const fs = require('fs');
const wav = require('wav');

import { InteractionService } from './InteractionService';

const outFile = 'media/demo.wav';
const outFileRaw = 'media/demoraw.wav';
const repeatFile = 'media/repeat.wav';

export class AudioPipline {
    public static pipeIt = async (res, req) =>{
        let binaryArray = new Uint16Array(req.files.audio.data);

        fs.writeFile(outFileRaw,  new Buffer(binaryArray as any), () => {
            console.log('\n\nWrote file to', outFileRaw);
            
            let fileWriter = new wav.FileWriter(outFile, {
                channels: 1,
                sampleRate: 48000,
                bitDepth: 16
            });
            
            let readStream = fs.createReadStream(outFileRaw);
            readStream.on('open', () => {
                console.log('Piping to wav');
                readStream.pipe(fileWriter);
    
            });
    
            readStream.on('error', err => {
                res.end(err);
            });
    
            readStream.on('end', async () => {
                fileWriter.end();
                console.log('Wrote file to', outFile);
    
                let transcription = await InteractionService.syncRecognize(outFile);
                console.log('transcription:',transcription);

                if(!transcription){
                    res.sendStatus(400);
                    return res.send();
                }
    
                await InteractionService.speak(transcription, repeatFile);
                res.send();
            })
        });
    }
}