const express = require('express');
const fs = require('fs');
const wav = require('wav');
const interact = require('./interact');
const multer = require('multer'); 
const bodyParser = require('body-parser');
const fileUpload = require('express-fileupload');

const PORT= '3710';

const app = express();
let server = require('http').createServer(app);
server.listen(PORT);
console.log('Listening on port ' + PORT);

app.use(express.static(__dirname + '/public'));
app.use(express.static(__dirname + '/static'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(fileUpload());

app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname + '/public/index.html'));
});

app.get('/repeat', function (req, res) {
    res.render('index');
});

const outFile = 'media/demo.wav';
const outFileRaw = 'media/demoraw.wav';
const repeatFile = 'static/repeat.wav';

app.post('/talk', (req, res, next) => {
    fs.writeFile(outFileRaw, Buffer(new Uint16Array(req.files.audio.data)), () => {
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

            let text = await interact.syncRecognize(outFile);
            await interact.speak(text, repeatFile);
            
            res.send();
        })

    });
})
