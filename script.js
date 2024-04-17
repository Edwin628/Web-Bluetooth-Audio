// script.js

window.AudioContext = window.AudioContext || window.webkitAudioContext;
window.OfflineAudioContext = window.OfflineAudioContext || window.webkitOfflineAudioContext;

var context = null;
var recorder = null;

// the ggwave module instance
var ggwave = null;
var parameters = null;
var instance = null;

// instantiate the ggwave instance
// ggwave_factory comes from the ggwave.js module
ggwave_factory().then(function(obj) {
    ggwave = obj;
});

var txData = document.getElementById("txData");
var rxData = document.getElementById("rxData");
var captureStart = document.getElementById("captureStart");
var captureStop = document.getElementById("captureStop");
const canvas = document.getElementById('oscillatorCanvas');
const ctx = canvas.getContext('2d');

// helper function
function convertTypedArray(src, type) {
    var buffer = new ArrayBuffer(src.byteLength);
    var baseView = new src.constructor(buffer).set(src);
    return new type(buffer);
}

// initialize audio context and ggwave
function init() {
    if (!context) {
        context = new AudioContext({sampleRate: 48000});

        parameters = ggwave.getDefaultParameters();
        parameters.sampleRateInp = context.sampleRate;
        parameters.sampleRateOut = context.sampleRate;
        instance = ggwave.init(parameters);
    }
}

//
// Tx
//

function onSend() {
    init();

    // generate audio waveform
    var waveform = ggwave.encode(instance, txData.value, ggwave.ProtocolId.GGWAVE_PROTOCOL_AUDIBLE_FAST, 10)

    // play audio
    var buf = convertTypedArray(waveform, Float32Array);
    var buffer = context.createBuffer(1, buf.length, context.sampleRate);
    buffer.getChannelData(0).set(buf);
    var source = context.createBufferSource();
    source.buffer = buffer;
    source.connect(context.destination);
    source.start(0);

    // Visualize the waveform with WaveSurfer
    var wavesurfer = WaveSurfer.create({
        container: '#waveform',
        waveColor: 'violet',
        progressColor: 'purple',
        backend: 'MediaElement'
    });

    // Convert the buffer to a blob and load it into WaveSurfer
    bufferToWave(buffer, buf.length, function(blob) {
        var url = URL.createObjectURL(blob);
        wavesurfer.load(url);
        var downloadLink = document.createElement('a');
        downloadLink.href = url;
        downloadLink.download = 'audio.wav'; // Specify the download name
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
        URL.revokeObjectURL(url); // Clean up
    });
}

// Function to convert audio buffer to a WAV Blob
function bufferToWave(abuffer, len, callback) {
    var numOfChan = abuffer.numberOfChannels,
        length = len * numOfChan * 2 + 44,
        buffer = new ArrayBuffer(length),
        view = new DataView(buffer),
        channels = [], i, sample,
        offset = 0,
        pos = 0;

    // write WAVE header
    setUint32(0x46464952);                         // "RIFF"
    setUint32(length - 8);                         // file length - 8
    setUint32(0x45564157);                         // "WAVE"

    setUint32(0x20746d66);                         // "fmt " chunk
    setUint32(16);                                 // length = 16
    setUint16(1);                                  // PCM (uncompressed)
    setUint16(numOfChan);
    setUint32(abuffer.sampleRate);
    setUint32(abuffer.sampleRate * 2 * numOfChan); // byte rate
    setUint16(numOfChan * 2);                      // block align
    setUint16(16);                                 // bits per sample

    setUint32(0x61746164);                         // "data" - chunk
    setUint32(length - pos - 4);                   // chunk length

    // write interleaved data
    for(i = 0; i < abuffer.numberOfChannels; i++)
        channels.push(abuffer.getChannelData(i));

    while(pos < length) {
        for(i = 0; i < numOfChan; i++) {             // interleave channels
            sample = Math.max(-1, Math.min(1, channels[i][offset])); // clamp
            sample = (0.5 + sample < 0 ? sample * 32768 : sample * 32767)|0; // scale to 16-bit signed int
            view.setInt16(pos, sample, true);          // write 16-bit sample
            pos += 2;
        }
        offset++                                     // next source sample
    }

    // create Blob
    var blob = new Blob([view], { type: 'audio/wav' });

    callback(blob);

    function setUint16(data) {
        view.setUint16(pos, data, true);
        pos += 2;
    }

    function setUint32(data) {
        view.setUint32(pos, data, true);
        pos += 4;
    }
}

function convertDataToAudio(data) {
    // Set Sample Rate
    const desiredSampleRate = 8000; 

    const audioContextOptions = { sampleRate: desiredSampleRate };
    const audioContext = new (window.AudioContext || window.webkitAudioContext)(audioContextOptions);

    const oscillator = audioContext.createOscillator();
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(dataToFrequency(data)[0], audioContext.currentTime);
    console.log("Frequency", dataToFrequency(data)[0])

    // Create AnalyserNode
    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 2048;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    // Connect to oscillator
    oscillator.connect(analyser);
    analyser.connect(audioContext.destination);

    //oscillator.connect(audioContext.destination);
    oscillator.start();
    oscillator.stop(audioContext.currentTime + 1);

    drawWaveform(analyser, dataArray)
    //drawFrequency();

    const messageElement = document.getElementById('message');
    messageElement.textContent = "Sample Rate: " + audioContext.sampleRate;

    console.log("Actual sample rate used:", audioContext.sampleRate);
}



function convertDataToPCM(data) {

    const desiredSampleRate = 8000; 

    const audioContextOptions = { sampleRate: desiredSampleRate };
    const audioContext = new (window.AudioContext || window.webkitAudioContext)(audioContextOptions);

    let frequency = dataToFrequency(data)[0]
    if(data == "a"){
        frequency = 100
    }
    //const frequency = 100

    function playSound() {
        // Create AudioBuffer
        const sampleRate = audioContext.sampleRate; // 44100 Hz
        const bufferSize = sampleRate * 1; // 1s 
        const audioBuffer = audioContext.createBuffer(1, bufferSize, sampleRate);

        // Fill the AudioBuffer（Sine Wave here）
        let bufferData = audioBuffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            bufferData[i] = Math.sin(2 * Math.PI * frequency * i / sampleRate); // frequency Hz 的音频频率
        }

        // Use AudioBufferSourceNode to play AudioBuffer
        const source = audioContext.createBufferSource();
        source.buffer = audioBuffer;

        // Create analyser node
        const analyser = audioContext.createAnalyser();
        analyser.fftSize = 2048;
        const dataArray = new Uint8Array(analyser.frequencyBinCount);

        source.connect(analyser);
        analyser.connect(audioContext.destination);

        source.start();
        drawWaveform(analyser, dataArray);

        source.onended = () => {
            source.disconnect();
            analyser.disconnect();
        };
    }

    playSound();
}

function drawWaveform(analyser, dataArray) {
    requestAnimationFrame(() => drawWaveform(analyser, dataArray));

    analyser.getByteTimeDomainData(dataArray);

    ctx.fillStyle = 'rgb(200, 200, 200)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.lineWidth = 2;
    ctx.strokeStyle = 'rgb(0, 0, 0)';
    ctx.beginPath();

    const sliceWidth = canvas.width * 1.0 / dataArray.length;
    let x = 0;

    for (let i = 0; i < dataArray.length; i++) {
        const v = dataArray[i] / 128.0;
        const y = v * canvas.height / 2;

        if (i === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }

        x += sliceWidth;
    }

    ctx.lineTo(canvas.width, canvas.height / 2);
    ctx.stroke();
}

function drawFrequency(analyser, dataArray) {
    //requestAnimationFrame(drawFrequency);
    requestAnimationFrame(() => drawFrequency(analyser, dataArray));

    analyser.getByteFrequencyData(dataArray);  // 获取频率域数据

    ctx.fillStyle = 'rgb(200, 200, 200)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.lineWidth = 2;
    ctx.strokeStyle = 'rgb(0, 0, 0)';
    ctx.beginPath();

    let barWidth = (canvas.width / dataArray.length) * 2.5;
    let barHeight;
    let x = 0;

    for (let i = 0; i < dataArray.length; i++) {
        barHeight = dataArray[i] * 2;

        ctx.fillStyle = 'rgb(' + (barHeight+100) + ',50,50)';
        ctx.fillRect(x, canvas.height - barHeight / 2, barWidth, barHeight / 2);

        x += barWidth + 1;
    }
}

// This is a placeholder for the WAV encoding function
function encodeWAV(audioBuffer) {
    // Convert audioBuffer to WAV data
    // For a full implementation, you would need to properly format the WAV file here
    // This usually involves writing a proper WAV header, then appending the raw audio data
    return new Uint8Array(); // Placeholder
}

function dataToFrequency(data) {
    // A simple conversion
    return data.split('').map(char => 440 + char.charCodeAt(0) * 20);
}


function deleteWaveform() {
    // Assuming wavesurfer is the variable holding your WaveSurfer instance
    if (wavesurfer) {
        wavesurfer.empty();
    }
}
