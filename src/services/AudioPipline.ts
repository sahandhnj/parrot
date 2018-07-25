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

const rawDir = 'media/raw';
const outputDir = 'static/output';
export class AudioPipline {
    public static pipeIt = async (res, req) => {
        if (!req.files.audio || !req.files.audio.data) {
            res.sendStatus(400);
            return res.send();
        }

        const uuid = uuidv4();
        const rawFile = path.join(rawDir, uuid + '.wav');
        const outputFile = path.join(outputDir, uuid + '.wav');

        let binaryArray = new Uint8Array(req.files.audio.data);
        await fsp.writeFileAsync(rawFile, new Buffer(binaryArray as any));

        let transcription = await InteractionService.syncRecognize(rawFile);
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

        if (transcription.toLowerCase().includes("truck") || transcription.toLowerCase().includes("trucks")) {
            answer = await SystemMonitor.trucks()
        }

        if (transcription.toLowerCase().includes("resource") || transcription.toLowerCase().includes("resources")) {
            answer = await SystemMonitor.resources();
        }

        if (transcription.toLowerCase().includes("thank")) {
          answer = "You are welcome.";
        }

        if (!answer) {
            answer = "Sorry, I'm afraid I don't know how to answer your question.";
        }

        await DataBaseService.insert(uuid, transcription);
        await InteractionService.speak(answer, outputFile);
        res.send({ name: uuid + '.wav', transcript: transcription });
    }
}
