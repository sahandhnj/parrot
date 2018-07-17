const express = require('express');
const BinaryServer = require('binaryjs').BinaryServer;
const fs = require('fs');
const wav = require('wav');
const interact = require('./interact');

const port = 3710;
const outFile = 'static/demo.wav';
const app = express();

app.use(express.static(__dirname + '/public'))
app.use(express.static(__dirname + '/static'))

app.get('/', function(req, res){
    res.sendFile(path.join(__dirname + '/public/index.html'));
});

app.get('/repeat', function(req, res){
    res.render('index');
});
var server = require('http').createServer(app);  

server.listen(port);

console.log('server open on port ' + port);

binaryServer = BinaryServer({server: server});

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
          interact.speak(text,'repeat').then(() =>{
              client.send('over');
          })
      })
      console.log('wrote to file ' + outFile);
    });
  });
});
