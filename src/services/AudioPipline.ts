const fs = require('fs');
const Bluebird = require('bluebird');
const fsp = Bluebird.promisifyAll(fs);

const wav = require('wav');
const uuidv4 = require('uuid/v4');
const path = require('path');

import { InteractionService } from './InteractionService';
import { DataBaseService } from './DataBaseService';
import { Calculator } from './Calculator';
import { Weather } from './Weather';
import { SystemMonitor } from './SystemMonitor';
import { NLPService } from './NLPService';

const rawDir = 'media/raw';
const outputDir = 'static/output';
const nlpTreeDir = 'media/nlpTrees';

export class AudioPipline {
    public static pipeIt = async (res, req) => {
        let transcription;
        try {
            if (!req.files.audio || !req.files.audio.data) {
                res.sendStatus(400);
                return res.send();
            }

            const uuid = uuidv4();
            const rawFile = path.join(rawDir, uuid + '.wav');
            const outputFile = path.join(outputDir, uuid + '.wav');
            const nlpTreeFile = path.join(nlpTreeDir, uuid + '.json');

            let binaryArray = new Uint8Array(req.files.audio.data);
            await fsp.writeFileAsync(rawFile, new Buffer(binaryArray as any));

            transcription = await InteractionService.syncRecognize(rawFile);
            console.log('transcription:', transcription);

            if (!transcription) {
                res.sendStatus(400);
                return res.send();
            }

            let answer;

            answer = await DataBaseService.reply(transcription);

            if (transcription.toLowerCase().startsWith("calculate")) {
                answer = Calculator.calculate(transcription);
            }

            if (transcription.toLowerCase().includes("extreme")) {
                answer = await Weather.extemes(transcription);
            }

            if (includePhrase(transcription, ['truck', 'trucks'])) {
                answer = await SystemMonitor.trucks()
            }

            if (includePhrase(transcription, ['resource', 'resources'])) {
                answer = await SystemMonitor.resources();
            }

            if (includePhrase(transcription, ['jetty1', 'jetty 1', 'jetty one', 'j-1', 'j1', 'j 1', 'j one'])) {
                answer = await SystemMonitor.jetty1();
            }

            if (includePhrase(transcription, ['jetty2', 'jetty 2', 'jetty two', 'j-2', 'j2', 'j 2', 'j two'])) {
                answer = await SystemMonitor.jetty2();
            }

            if (includePhrase(transcription, ['pump', 'pumped', 'tank'])) {
                answer = await SystemMonitor.getResourceById(transcription);
            }

            if (transcription.toLowerCase().includes("thank")) {
                answer = "You are welcome.";
            }

            if(!answer){
                answer = await NLPService.parse(transcription, nlpTreeFile);
            }

            if (!answer) {
                answer = "Sorry, I'm afraid I don't know how to answer your question.";
            }

            await DataBaseService.insert(uuid, transcription);
            await InteractionService.speak(answer, outputFile);

            res.send({ name: uuid + '.wav', transcript: transcription, answer: answer });
        }
        catch (e) {
            console.log('sad');
            console.log(e);
            let answer = "Sorry, I'm afraid I don't know how to answer your question.";
            const outputFile = path.join(outputDir, 'error.wav');
            await InteractionService.speak(answer, outputFile);

            res.send({ name: 'error.wav', transcript: transcription, answer: answer });
        }
    }
}
const includePhrase = (text: string, phrases: Array<string>) => {
    let match = false;

    phrases.forEach(p => {
        if (text.toLowerCase().includes(p)) {
            match = true;
        }
    })

    return match;
}
