(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "path", "../services/InteractionService"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const path = require("path");
    const fs = require('fs');
    const wav = require('wav');
    const InteractionService_1 = require("../services/InteractionService");
    const outFile = 'media/demo.wav';
    const outFileRaw = 'media/demoraw.wav';
    const repeatFile = 'static/repeat.wav';
    class AudioRoute {
        constructor() {
        }
        static create(router) {
            console.log('HERE2');
            router.get('/', (req, res, next) => {
                res.sendFile(path.join(__dirname + '/public/index.html'));
            });
            router.post('/talk', (req, res, next) => {
                console.log('HERE');
                console.log(req.files);
                fs.writeFile(outFileRaw, null, () => {
                    console.log('Wrote file to', outFileRaw);
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
                        let text = await InteractionService_1.InteractionService.syncRecognize(outFile);
                        if (!text) {
                            res.sendStatus(400);
                            return res.send();
                        }
                        await InteractionService_1.InteractionService.speak(text, repeatFile);
                        res.send();
                    });
                });
            });
        }
    }
    exports.AudioRoute = AudioRoute;
});
