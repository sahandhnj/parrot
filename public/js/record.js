const API = 'http://localhost:3711';

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

const config = {
    bufferLen: 4096,
    numChannels: 2,
    sampleRate: 48000,
    mimeType: 'audio/wav'
};

const enableMicrophoneStream = async () => {
    try {
        if (!navigator.getUserMedia) {
            navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia ||
                navigator.mozGetUserMedia || navigator.msGetUserMedia;
        }

        if (!navigator.getUserMedia) {
            alert('No navigator found');
        }

        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

        if (!stream) {
            alert('No audio stream found');
        }
        
        const audioContext = window.AudioContext || window.webkitAudioContext;
        const contextMain = new audioContext();

        // the sample rate is in context.sampleRate
        audioInput = contextMain.createMediaStreamSource(stream);
        let context = audioInput.context;
        let recorder = (context.createScriptProcessor ||
            context.createJavaScriptrecorder).call(context,
                config.bufferLen, config.numChannels, config.numChannels);
        
        init();

        recorder.onaudioprocess = (e) => {
            if (!recording) return;

            var buffer = [];
            for (var channel = 0; channel < config.numChannels; channel++) {
                buffer.push(e.inputBuffer.getChannelData(channel));
            }

            console.log(buffer);
            record(buffer);
        };

        audioInput.connect(recorder);
        recorder.connect(context.destination);
    } catch (err) {
        console.log(err);
    }

}



const repeat = (failed, name) => {
    let audio = document.getElementById("playAudio");
    let random = Math.floor(Math.random() * 1000) + 1

    if (failed) {
        audio.src = "error.wav";
    }
    else {
        audio.src = 'output/' + name + "?cb=" + random;
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

        const audioBlob = exportWAV('audio/wav');
        const audioUrl = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioUrl);
        const play = () => audio.play();
        play();
        // let fd = new FormData();
        // fd.append('audio', audioBlob);
        // fetch(API + '/talk', {
        //     headers: { Accept: "application/json" },
        //     method: "POST", body: fd
        // })
        //     .then(async response => {
        //         if (response.status === 400) {
        //             return repeat(true, response.body.name);
        //         }

        //         let body = await response.json()
        //         repeat(false, body.name);
        //     })

        // audioChunks = [];
    }
};

let mouseDown = function () {
    document.getElementById("recordBtn").style.color = "red";
    document.getElementById("presentation").textContent = "listening..."
    mic.start();
}

let mouseUp = function () {
    document.getElementById("recordBtn").style.color = "green";
    document.getElementById("presentation").textContent = "pending..."
    mic.stop();
}

enableMicrophoneStream().then(() => {
    console.log('Start -->');
});


let recLength = 0;
let recBuffers = [];
let numChannels; 
let sampleRate;

function init() {
    sampleRate = config.sampleRate;
    numChannels = config.numChannels;
    initBuffers();
}

function record(inputBuffer) {
    for (var channel = 0; channel < numChannels; channel++) {
        recBuffers[channel].push(inputBuffer[channel]);
    }

    recLength += inputBuffer[0].length;
}

function exportWAV(type) {
    let buffers = [];

    for (let channel = 0; channel < numChannels; channel++) {
        buffers.push(mergeBuffers(recBuffers[channel], recLength));
    }
    console.log('buffers',buffers);
    let interleaved;
    if (numChannels === 2) {
        interleaved = interleave(buffers[0], buffers[1]);
    } else {
        interleaved = buffers[0];
    }
    console.log('interleaved',interleaved);
    let dataview = encodeWAV(interleaved);
    let audioBlob = new Blob([dataview], { type: type });

    return audioBlob;
}

function getBuffer() {
    let buffers = [];
    for (let channel = 0; channel < numChannels; channel++) {
        buffers.push(mergeBuffers(recBuffers[channel], recLength));
    }
    
    return buffers;
}

function clear() {
    recLength = 0;
    recBuffers = [];
    initBuffers();
}

function initBuffers() {
    for (let channel = 0; channel < numChannels; channel++) {
        recBuffers[channel] = [];
    }
}

function mergeBuffers(recBuffers, recLength) {
    let result = new Float32Array(recLength);
    let offset = 0;
    for (let i = 0; i < recBuffers.length; i++) {
        result.set(recBuffers[i], offset);
        offset += recBuffers[i].length;
    }
    return result;
}

function interleave(inputL, inputR) {
    let length = inputL.length + inputR.length;
    let result = new Float32Array(length);

    let index = 0,
        inputIndex = 0;

    while (index < length) {
        result[index++] = inputL[inputIndex];
        result[index++] = inputR[inputIndex];
        inputIndex++;
    }
    return result;
}

function floatTo16BitPCM(output, offset, input) {
    for (let i = 0; i < input.length; i++ , offset += 2) {
        let s = Math.max(-1, Math.min(1, input[i]));
        output.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
    }
}

function writeString(view, offset, string) {
    for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
    }
}

function encodeWAV(samples) {
    let buffer = new ArrayBuffer(44 + samples.length * 2);
    let view = new DataView(buffer);

    /* RIFF identifier */
    writeString(view, 0, 'RIFF');
    /* RIFF chunk length */
    view.setUint32(4, 36 + samples.length * 2, true);
    /* RIFF type */
    writeString(view, 8, 'WAVE');
    /* format chunk identifier */
    writeString(view, 12, 'fmt ');
    /* format chunk length */
    view.setUint32(16, 16, true);
    /* sample format (raw) */
    view.setUint16(20, 1, true);
    /* channel count */
    view.setUint16(22, numChannels, true);
    /* sample rate */
    view.setUint32(24, sampleRate, true);
    /* byte rate (sample rate * block align) */
    view.setUint32(28, sampleRate * 4, true);
    /* block align (channel count * bytes per sample) */
    view.setUint16(32, numChannels * 2, true);
    /* bits per sample */
    view.setUint16(34, 16, true);
    /* data chunk identifier */
    writeString(view, 36, 'data');
    /* data chunk length */
    view.setUint32(40, samples.length * 2, true);

    floatTo16BitPCM(view, 44, samples);

    return view;
}

function forceDownload(blob, filename) {
    let url = (window.URL || window.webkitURL).createObjectURL(blob);
    let link = window.document.createElement('a');
    link.href = url;
    link.download = filename || 'output.wav';
    let click = document.createEvent("Event");
    click.initEvent("click", true, true);
    link.dispatchEvent(click);
}



window.AudioContext = window.AudioContext || window.webkitAudioContext;

var audioContext = new AudioContext();
var audioInput = null,
    realAudioInput = null,
    inputPoint = null,
    audioRecorder = null;
var rafID = null;
var analyserContext = null;
var canvasWidth, canvasHeight;
var recIndex = 0;

/* TODO:
- offer mono option
- "Monitor input" switch
*/

// function saveAudio() {
//     audioRecorder.exportWAV( doneEncoding );
//     // could get mono instead by saying
//     // audioRecorder.exportMonoWAV( doneEncoding );
// }

// function gotBuffers( buffers ) {
//     var canvas = document.getElementById( "wavedisplay" );

//     drawBuffer( canvas.width, canvas.height, canvas.getContext('2d'), buffers[0] );

//     // the ONLY time gotBuffers is called is right after a new recording is completed - 
//     // so here's where we should set up the download.
//     audioRecorder.exportWAV( doneEncoding );
// }

// function doneEncoding( blob ) {
//     Recorder.setupDownload( blob, "myRecording" + ((recIndex<10)?"0":"") + recIndex + ".wav" );
//     recIndex++;
// }

// function toggleRecording( e ) {
//     if (e.classList.contains("recording")) {
//         // stop recording
//         audioRecorder.stop();
//         e.classList.remove("recording");
//         audioRecorder.getBuffers( gotBuffers );
//     } else {
//         // start recording
//         if (!audioRecorder)
//             return;
//         e.classList.add("recording");
//         audioRecorder.clear();
//         audioRecorder.record();
//     }
// }

// function convertToMono( input ) {
//     var splitter = audioContext.createChannelSplitter(2);
//     var merger = audioContext.createChannelMerger(2);

//     input.connect( splitter );
//     splitter.connect( merger, 0, 0 );
//     splitter.connect( merger, 0, 1 );
//     return merger;
// }

// function cancelAnalyserUpdates() {
//     window.cancelAnimationFrame( rafID );
//     rafID = null;
// }

// function updateAnalysers(time) {
//     if (!analyserContext) {
//         var canvas = document.getElementById("analyser");
//         canvasWidth = canvas.width;
//         canvasHeight = canvas.height;
//         analyserContext = canvas.getContext('2d');
//     }

//     // analyzer draw code here
//     {
//         var SPACING = 3;
//         var BAR_WIDTH = 1;
//         var numBars = Math.round(canvasWidth / SPACING);
//         var freqByteData = new Uint8Array(analyserNode.frequencyBinCount);

//         analyserNode.getByteFrequencyData(freqByteData); 

//         analyserContext.clearRect(0, 0, canvasWidth, canvasHeight);
//         analyserContext.fillStyle = '#F6D565';
//         analyserContext.lineCap = 'round';
//         var multiplier = analyserNode.frequencyBinCount / numBars;

//         // Draw rectangle for each frequency bin.
//         for (var i = 0; i < numBars; ++i) {
//             var magnitude = 0;
//             var offset = Math.floor( i * multiplier );
//             // gotta sum/average the block, or we miss narrow-bandwidth spikes
//             for (var j = 0; j< multiplier; j++)
//                 magnitude += freqByteData[offset + j];
//             magnitude = magnitude / multiplier;
//             var magnitude2 = freqByteData[i * multiplier];
//             analyserContext.fillStyle = "hsl( " + Math.round((i*360)/numBars) + ", 100%, 50%)";
//             analyserContext.fillRect(i * SPACING, canvasHeight, BAR_WIDTH, -magnitude);
//         }
//     }
    
//     rafID = window.requestAnimationFrame( updateAnalysers );
// }

// function toggleMono() {
//     if (audioInput != realAudioInput) {
//         audioInput.disconnect();
//         realAudioInput.disconnect();
//         audioInput = realAudioInput;
//     } else {
//         realAudioInput.disconnect();
//         audioInput = convertToMono( realAudioInput );
//     }

//     audioInput.connect(inputPoint);
// }

// function gotStream(stream) {
//     inputPoint = audioContext.createGain();

//     // Create an AudioNode from the stream.
//     realAudioInput = audioContext.createMediaStreamSource(stream);
//     audioInput = realAudioInput;
//     audioInput.connect(inputPoint);

// //    audioInput = convertToMono( input );

//     analyserNode = audioContext.createAnalyser();
//     analyserNode.fftSize = 2048;
//     inputPoint.connect( analyserNode );

//     audioRecorder = new Recorder( inputPoint );

//     zeroGain = audioContext.createGain();
//     zeroGain.gain.value = 0.0;
//     inputPoint.connect( zeroGain );
//     zeroGain.connect( audioContext.destination );
//     updateAnalysers();
// }

// function initAudio() {
//         if (!navigator.getUserMedia)
//             navigator.getUserMedia = navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
//         if (!navigator.cancelAnimationFrame)
//             navigator.cancelAnimationFrame = navigator.webkitCancelAnimationFrame || navigator.mozCancelAnimationFrame;
//         if (!navigator.requestAnimationFrame)
//             navigator.requestAnimationFrame = navigator.webkitRequestAnimationFrame || navigator.mozRequestAnimationFrame;

//     navigator.getUserMedia(
//         {
//             "audio": {
//                 "mandatory": {
//                     "googEchoCancellation": "false",
//                     "googAutoGainControl": "false",
//                     "googNoiseSuppression": "false",
//                     "googHighpassFilter": "false"
//                 },
//                 "optional": []
//             },
//         }, gotStream, function(e) {
//             alert('Error getting audio');
//             console.log(e);
//         });
// }

// window.addEventListener('load', initAudio );
