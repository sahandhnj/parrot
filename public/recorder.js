(function (window) {
  var client = new BinaryClient('ws://localhost:9011');

  client.on('stream', function (stream, meta) {
    stream.on('data', function (data) {
      if (data == 'over') {
        console.log('Got it');
        let audio = document.getElementById("playAudio");
        let random= Math.floor(Math.random() * 1000) + 1  

        audio.src= "repeat.mp3?cb=" + random;
        audio.load();
        audio.play();
      }
    });

    stream.on('end', function () {
    });
  });

  client.on('open', function () {
    window.Stream = client.createStream();

    if (!navigator.getUserMedia)
      navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia ||
        navigator.mozGetUserMedia || navigator.msGetUserMedia;

    if (navigator.getUserMedia) {
      navigator.getUserMedia({ audio: true }, success, function (e) {
        alert('Error capturing audio.');
      });
    } else alert('getUserMedia not supported in this browser.');

    var recording = false;

    window.startRecording = function () {
      recording = true;
    }

    window.playAudio = function () {
      var audio = document.getElementById("playAudio");
      audio.load();
      audio.play();
    }

    window.stopRecording = function () {
      recording = false;
      window.Stream.end();
    }

    window.mouseDown = function () {
      document.getElementById("recordBtn").style.color = "red";
      window.startRecording();
    }

    window.mouseUp = function () {
      document.getElementById("recordBtn").style.color = "green";
      window.stopRecording();
    }

    function success(e) {
      audioContext = window.AudioContext || window.webkitAudioContext;
      context = new audioContext();

      // the sample rate is in context.sampleRate
      audioInput = context.createMediaStreamSource(e);

      var bufferSize = 2048;
      recorder = context.createScriptProcessor(bufferSize, 1, 1);

      recorder.onaudioprocess = function (e) {
        if (!recording) return;
        console.log('recording');
        var left = e.inputBuffer.getChannelData(0);
        window.Stream.write(convertoFloat32ToInt16(left));
      }

      audioInput.connect(recorder);
      recorder.connect(context.destination);
    }

    function convertoFloat32ToInt16(buffer) {
      var l = buffer.length;
      var buf = new Int16Array(l)

      while (l--) {
        buf[l] = buffer[l] * 0xFFFF;    //convert to 16 bit
      }
      return buf.buffer
    }
  });

})(this);


