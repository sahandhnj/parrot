const API = 'http://localhost:3710';

let audioChunks = [];
let recording = false;

const convertoFloat32ToInt16 = (buffer) => {
    let l = buffer.length;
    let buf = new Int16Array(l)

    while (l--) {
        buf[l] = buffer[l] * 0xFFFF;
    }

    return buf.buffer
}

const enableMicrophoneStream = async () => {
    try {
        if (!navigator.getUserMedia){
            navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia ||
            navigator.mozGetUserMedia || navigator.msGetUserMedia;
        }

        if(!navigator.getUserMedia){
            alert('No navigator found');
        }
      
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

        if(!stream){
            alert('No audio stream found');
        }
        const audioContext = window.AudioContext || window.webkitAudioContext;
        const context = new audioContext();

        // the sample rate is in context.sampleRate
        audioInput = context.createMediaStreamSource(stream);

        const bufferSize = 2048;
        recorder = context.createScriptProcessor(bufferSize, 1, 1);
        recorder.onaudioprocess = function (input) {
            if (!recording) {
                return;
            }

            console.log('recording');
            let left = input.inputBuffer.getChannelData(0);
            audioChunks.push(convertoFloat32ToInt16(left));
        }

        audioInput.connect(recorder);
        recorder.connect(context.destination);
    } catch (err) {
        console.log(err);
    }

}

const repeat = (failed,name) => {
    let audio = document.getElementById("playAudio");
    let random = Math.floor(Math.random() * 1000) + 1

    if(failed) {
        audio.src = "error.wav";
    } 
    else {
        audio.src = 'output/'+ name + "?cb=" + random;
    }

    audio.load();
    audio.play();
}

const mic = {
    start: () => {
        console.log('Start recording');
        recording = true;
    },
    stop: () => {
        console.log('Stop recording');
        recording = false;
        let fd = new FormData();
        fd.append('audio', new Blob(audioChunks));
    
        fetch(API + '/talk', {
            headers: { Accept: "application/json" },
            method: "POST", body: fd
        })
        .then(async response => {
            if(response.status === 400){
                return repeat(true, response.body.name);
            }

            let body= await response.json()
            repeat(false, body.name);
        })
    
        audioChunks = [];
    }
};

let mouseDown = function () {
    document.getElementById("recordBtn").style.background = "#00FF00";
    mic.start();
}

let mouseUp = function () {
    document.getElementById("recordBtn").style.background = "#d11d47";
    mic.stop();
}

enableMicrophoneStream().then(() => {
    console.log('Start -->');
});