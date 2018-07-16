const express = require('express');
const BinaryServer = require('binaryjs').BinaryServer;
const fs = require('fs');
const wav = require('wav');
const interact = require('./interact');

const port = 3710;
const outFile = 'demo.wav';
const app = express();

app.set('views', __dirname + '/tpl');
app.set('view engine', 'jade');
app.engine('jade', require('jade').__express);
app.use(express.static(__dirname + '/public'))

app.get('/', function(req, res){
  res.render('index');
});

app.listen(port);

console.log('server open on port ' + port);

binaryServer = BinaryServer({port: 9011});

binaryServer.on('connection', function(client) {
  console.log('new connection');

  var fileWriter = new wav.FileWriter(outFile, {
    channels: 1,
    sampleRate: 48000,
    bitDepth: 16
  });

  client.on('stream', function(stream, meta) {
    console.log('new stream');
    stream.pipe(fileWriter);

    stream.on('end', function() {
      fileWriter.end();
      interact.syncRecognize(outFile).then(text =>{
          interact.speak(text,'repeat');
      })
      console.log('wrote to file ' + outFile);
    });
  });
});
