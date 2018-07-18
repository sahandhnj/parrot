const fs = require('fs');
const wav = require('wav');
const uuidv4 = require('uuid/v4');
const path = require('path');

import { InteractionService } from './InteractionService';

const convertedDir = 'media/converted';
const rawDir = 'media/raw';
const outputDir = 'static/output';

export class AudioPipline {
    public static pipeIt = async (res, req) =>{
        if(!req.files.audio || !req.files.audio.data){
            res.sendStatus(400);
            return res.send();
        }
        
        const uuid= uuidv4();
        const convertedFile = path.join(convertedDir,uuid + '.wav');
        const rawFile = path.join(rawDir, uuid);
        const outputFile = path.join(outputDir, uuid+ '.wav');

        let binaryArray = new Uint16Array(req.files.audio.data);

        fs.writeFile(rawFile,  new Buffer(binaryArray as any), () => {
            console.log('\n\nWrote file to', rawFile);
            
            let fileWriter = new wav.FileWriter(convertedFile, {
                channels: 1,
                sampleRate: 48000,
                bitDepth: 16
            });
            
            let readStream = fs.createReadStream(rawFile);
            readStream.on('open', () => {
                console.log('Piping to wav');
                readStream.pipe(fileWriter);
            });
    
            readStream.on('error', err => {
                res.end(err);
            });
    
            readStream.on('end', async () => {
                fileWriter.end();
                console.log('Wrote file to', convertedFile);
    
                let transcription = await InteractionService.syncRecognize(convertedFile);
                console.log('transcription:',transcription);

                if(!transcription){
                    res.sendStatus(400);
                    return res.send();
                }
    
                await InteractionService.speak(transcription, outputFile);
                res.send({name: uuid + '.wav'});
            })
        });
    }
}