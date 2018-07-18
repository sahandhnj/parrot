// https://medium.com/@bryanjenningz/how-to-record-and-play-audio-in-javascript-faa1b2b3e49b
// https://github.com/bryanjenningz/record-audio
// https://stackoverflow.com/questions/40392270/format-and-send-seamless-audio-from-js-to-local-pyaudio

//https://stackoverflow.com/questions/39090006/websocket-javascript-as-client-and-python-as-server-and-web-host-on-linux
// https://github.com/samdutton/simpl/blob/gh-pages/getusermedia/sources/js/main.js
// https://www.davidbcalhoun.com/2011/android-3-0-honeycomb-is-first-to-implement-the-device-api/
// https://stackoverflow.com/questions/45007129/stream-audio-with-js-audio-buffer-coming-from-python
// https://subvisual.co/blog/posts/39-tutorial-html-audio-capture-streaming-to-node-js-no-browser-extensions/

// werkt met aanroepen via index.html


navigator.mediaDevices.getUserMedia({ audio: true })
  .then(stream => {
    const mediaRecorder = new mediaRecorder(stream);
    mediaRecorder.start();

    const audioChuncks = [];
    mediaRecorder.addEventListener("dataavailable", event => {
      audioChuncks.push(event.data);
    });

    mediaRecorder.addEventListener("stop", () => {
      const audioBlob = new Blob(audioChuncks);
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      audio.play();
    });

    setTimeout(() => {
      mediaRecorder.stop();
    }, 3000);

    console.log(audioChuncks)

  });
