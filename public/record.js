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
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
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

const repeat = (failed) => {
    let audio = document.getElementById("playAudio");
    let random = Math.floor(Math.random() * 1000) + 1

    audio.src = "repeat.wav?cb=" + random;
    if(failed){
        audio.src = "error.wav";
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
        }).then(response => {
            repeat(response.status === 400);
        })
    
        audioChunks = [];
    }
};

let mouseDown = function () {
    document.getElementById("recordBtn").style.color = "red";
    mic.start();
}

let mouseUp = function () {
    document.getElementById("recordBtn").style.color = "green";
    mic.stop();
}

enableMicrophoneStream().then(() => {
    console.log('Start -->');
});