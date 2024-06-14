// create the audio

const AudioContext = window.AudioContext || window.webkitAudioContext;
const OfflineAudioContext = window.OfflineAudioContext || window.webkitOfflineAudioContext;


let desiredSampleRate = 8000; 


// Set Sample Rate
function displayNumber() {
    desiredSampleRate = document.getElementById('numberInput').value;
    // display the number
    // document.getElementById('display').innerText = 'SampleRate: ' + number;
}

function createSineWaveAudioBufferx(audioContext, frequency, duration = 1) {
    const sampleRate = audioContext.sampleRate;
    const bufferSize = sampleRate * duration;
    const audioBuffer = audioContext.createBuffer(1, bufferSize, sampleRate);
    let bufferData = audioBuffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
        bufferData[i] = Math.sin(2 * Math.PI * frequency * i / sampleRate);
    }

    return audioBuffer;
}

function createSineWaveAudioBuffer(audioContext, frequency, numCycles = 5) {
    const sampleRate = audioContext.sampleRate;
    // caculate the time for specific cycles
    const duration = numCycles / frequency;
    const bufferSize = sampleRate * duration;  
    const audioBuffer = audioContext.createBuffer(1, bufferSize, sampleRate);
    let bufferData = audioBuffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
        bufferData[i] = Math.sin(2 * Math.PI * frequency * i / sampleRate);
    }

    return audioBuffer;
}


function createLinearAudioBuffer(audioContext, duration = 1) {
    const sampleRate = audioContext.sampleRate;
    const bufferSize = sampleRate * duration;
    const audioBuffer = audioContext.createBuffer(2, bufferSize, sampleRate);

    let bufferDataLeft = audioBuffer.getChannelData(0); // Left Channel
    let bufferDataRight = audioBuffer.getChannelData(1); // Right CHannel

    // Increasing Signal
    for (let i = 0; i < bufferSize; i++) {
        bufferDataLeft[i] = i / bufferSize;
        bufferDataRight[i] = (bufferSize - i) / bufferSize;
    }

    return audioBuffer;
}

function createFlatAudioBuffer(audioContext, duration = 1) {
    const sampleRate = audioContext.sampleRate;
    const bufferSize = sampleRate * duration;
    const audioBuffer = audioContext.createBuffer(2, bufferSize, sampleRate);

    let bufferDataLeft = audioBuffer.getChannelData(0); // Left Channel
    let bufferDataRight = audioBuffer.getChannelData(1); // Right Channel

    // Increasing Signal
    for (let i = 0; i < bufferSize; i++) {
        bufferDataLeft[i] = 1;
        bufferDataRight[i] = -1;
    }

    return audioBuffer;
}


function convertDataToPCM(data, path = "flat") {
    desiredSampleRate = 48000
    const audioContextOptions = { sampleRate: desiredSampleRate };
    const audioContext = new (window.AudioContext || window.webkitAudioContext)(audioContextOptions);

    let frequency = dataToFrequency(data)[0]
    if(data == "a"){
        frequency = 100
    }
    //const frequency = 100


    function playSound() {
        // Display sample rate
        const messageElement = document.getElementById('message');
        messageElement.textContent = "Sample Rate: " + audioContext.sampleRate;

        // Create AudioBuffer
        //const audioBuffer = createSineWaveAudioBuffer(audioContext, frequency, 0.1)
        let audioBuffer
        switch(path){
            case "flat":
                audioBuffer = createFlatAudioBuffer(audioContext);
                break;
            case "linear":
                audioBuffer = createLinearAudioBuffer(audioContext);
                break;
            case "sine":
                audioBuffer = createSineWaveAudioBuffer(audioContext,1000,1000);
                break;
            default:
                audioBuffer = createFlatAudioBuffer(audioContext);
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


// ===================================deprecated=====================================
function convertDataToAudio(data) {
    desiredSampleRate = 8000; 
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