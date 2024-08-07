import { createSineWaveAudioBuffer, createLinearAudioBuffer, createFlatAudioBuffer, createEndingAudioBuffer} from './audioBuffers.js';
import { drawWaveform } from './draw.js';
import { desiredSampleRate } from './audioContext.js';

function stopSound(audioContext) {
    if (audioContext) {
        audioContext.close().then(() => {
            audioContext = null;
        });
    }
}

function convertDataToPCM(data, path = "flat") {
    const audioContextOptions = { sampleRate: desiredSampleRate };
    const audioContext = new (window.AudioContext || window.webkitAudioContext)(audioContextOptions);

    let frequency = dataToFrequency(data)[0];
    if (data === "a") {
        frequency = 100;
    }

    function playSound() {
        const messageElement = document.getElementById('message');
        messageElement.textContent = "Sample Rate: " + audioContext.sampleRate;

        let audioBuffer;
        switch (path) {
            case "flat":
                audioBuffer = createFlatAudioBuffer(audioContext);
                break;
            case "linear":
                audioBuffer = createLinearAudioBuffer(audioContext);
                break;
            case "sine":
                audioBuffer = createSineWaveAudioBuffer(audioContext, 1000, 100);
                break;
            default:
                audioBuffer = createFlatAudioBuffer(audioContext);
        }

        const source = audioContext.createBufferSource();
        source.buffer = audioBuffer;

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
        // stopSound(audioContext);
    }

    playSound();
}

function dataToFrequency(data) {
    // A simple conversion
    return data.split('').map(char => 440 + char.charCodeAt(0) * 20);
}

function concatenateAudioBuffers(audioContext, buffer1, buffer2) {
    const numberOfChannels = Math.min(buffer1.numberOfChannels, buffer2.numberOfChannels);
    const length = buffer1.length + buffer2.length;
    const sampleRate = buffer1.sampleRate;
    
    const newBuffer = audioContext.createBuffer(numberOfChannels, length, sampleRate);
    console.log("channel numbers: " + numberOfChannels);
    console.log("sampleRate: " + sampleRate);
    console.log(" buffer1 length: " + buffer1.length);
    console.log(" buffer2 length: " + buffer2.length);
    for (let channel = 0; channel < numberOfChannels; channel++) {
        const channelData = newBuffer.getChannelData(channel);
        channelData.set(buffer1.getChannelData(channel), 0);
        channelData.set(buffer2.getChannelData(channel), buffer1.length);
    }
    
    return newBuffer;
}

function convertDataToFSK(data, isBinary, desiredSampleRate = 48000) {
    const audioContextOptions = { sampleRate: desiredSampleRate };
    const audioContext = new (window.AudioContext || window.webkitAudioContext)(audioContextOptions);

    const frequency0 = 1000;
    const frequency1 = 2000;

    function dataToFrequency(data) {
        return data.split('').map(bit => bit === '0' ? frequency0 : frequency1);
    }

    const frequencyBase = 150; // base frequency interval

    function ASCIIToFrequency(data) {
        return data.split('').map(char => frequencyBase * char.charCodeAt(0));
    }

    function createFSKAudioBuffer(context, frequencies, duration = 0.1) {
        const sampleRate = context.sampleRate;
        const frameCount = sampleRate * duration * frequencies.length;
        const buffer = context.createBuffer(2, frameCount, sampleRate);
        // const data = buffer.getChannelData(0);
        let bufferDataLeft = buffer.getChannelData(0);
        let bufferDataRight = buffer.getChannelData(1);

        frequencies.forEach((frequency, index) => {
            const start = index * sampleRate * duration;
            for (let i = 0; i < sampleRate * duration; i++) {
                // data[start + i] =  Math.sin(2 * Math.PI * frequency * i / sampleRate);
                bufferDataLeft[start + i] = Math.sin(2 * Math.PI * frequency * i / sampleRate);
                bufferDataRight[start + i] = Math.sin(2 * Math.PI * frequency * i / sampleRate);
            }
        });

        return buffer;
    }

    function playSound(frequencies) {
        const messageElement = document.getElementById('message');
        messageElement.textContent = "Sample Rate: " + audioContext.sampleRate;

        // const audioBuffer = createFSKAudioBuffer(audioContext, frequencies);
        // let audioBuffer = createFlatAudioBuffer(audioContext, 0.01);
        // audioBuffer = createFSKAudioBuffer(audioContext, frequencies);

        let flatBuffer = createFlatAudioBuffer(audioContext, 0.01);
        let fskBuffer = createFSKAudioBuffer(audioContext, frequencies, 0.05);
        let concatenatedBuffer = concatenateAudioBuffers(audioContext, flatBuffer, fskBuffer);  

        const source = audioContext.createBufferSource();
        source.buffer = concatenatedBuffer;

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
    let frequencies;
    if(isBinary) {      
        frequencies = dataToFrequency(data);
    } else {
        frequencies = ASCIIToFrequency(data);
    }
    console.log(frequencies);
    playSound(frequencies);
}

function convertDataToChirp(data, desiredSampleRate = 48000) {
    const audioContextOptions = { sampleRate: desiredSampleRate };
    const audioContext = new (window.AudioContext || window.webkitAudioContext)(audioContextOptions);

    const frequencyBase = 150; // base frequency interval
    const chirpDuration = 0.2; // duration of each chirp signal in seconds

    function ASCIIToChirpFrequency(data) {
        return data.split('').map(char => {
            const charCode = char.charCodeAt(0);
            const startFrequency = frequencyBase * charCode;
            const endFrequency = startFrequency + frequencyBase;
            return { startFrequency, endFrequency };
        });
    }

    function createChirpAudioBuffer(context, chirpData, duration = 0.1) {
        const sampleRate = context.sampleRate;
        const frameCount = sampleRate * duration * chirpData.length;
        const buffer = context.createBuffer(2, frameCount, sampleRate);
        const bufferDataLeft = buffer.getChannelData(0);
        const bufferDataRight = buffer.getChannelData(1);

        chirpData.forEach(({ startFrequency, endFrequency }, index) => {
            const start = index * sampleRate * duration;
            const k = (endFrequency - startFrequency) / duration;  // Chirp rate

            for (let i = 0; i < sampleRate * duration; i++) {
                const t = i / sampleRate;  // Time in seconds
                const instantaneousFrequency = startFrequency + k * t;
                const signalValue = Math.sin(2 * Math.PI * instantaneousFrequency * t);
                bufferDataLeft[start + i] = signalValue;
                bufferDataRight[start + i] = signalValue;
            }
        });

        return buffer;
    }

    function playSound(chirpData) {
        const messageElement = document.getElementById('message');
        messageElement.textContent = "Sample Rate: " + audioContext.sampleRate;

        const chirpBuffer = createChirpAudioBuffer(audioContext, chirpData, chirpDuration);

        const source = audioContext.createBufferSource();
        source.buffer = chirpBuffer;

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

    const chirpData = ASCIIToChirpFrequency(data);
    console.log(chirpData);
    playSound(chirpData);
}

function convertDataToFreqRange(data, desiredSampleRate = 48000) {
    const audioContextOptions = { sampleRate: desiredSampleRate };
    const audioContext = new (window.AudioContext || window.webkitAudioContext)(audioContextOptions);

    const frequencyBase = 4000; // base frequency
    const frequencyInterval = 1000; // base frequency interval
    const duration = 0.01; // total duration in seconds

    function ASCIIToChirpFrequency(data) {
        return data.split('').map(char => {
            const charCode = char.charCodeAt(0);
            const frequencies = [];
            for (let i = 0; i < 8; i++) {
                if (charCode & (1 << i)) {
                    frequencies.push(frequencyBase +  frequencyInterval * (i + 1));
                } else {
                    frequencies.push(0); // No frequency for this bit
                }
            }
            return frequencies;
        });
    }

    function createBitFreqAudioBuffer(context, freqData, duration, paddingDuration = 0.001) {
        const sampleRate = context.sampleRate;
        const chirpCount = freqData.length;
        const FreqFrameCount = sampleRate * duration;
        const paddingFrameCount = sampleRate * paddingDuration;
        const totalFrameCount = (FreqFrameCount + paddingFrameCount) * chirpCount + paddingFrameCount;
        
        const buffer = context.createBuffer(2, totalFrameCount, sampleRate);
        const bufferDataLeft = buffer.getChannelData(0);
        const bufferDataRight = buffer.getChannelData(1);
    
        freqData.forEach((frequencies, index) => {
            const chirpStart = Math.floor((index * (FreqFrameCount + paddingFrameCount)) + paddingFrameCount);
            const chirpEnd = chirpStart + FreqFrameCount;
            const paddingStart = Math.floor(index * (FreqFrameCount + paddingFrameCount));
            const paddingEnd = paddingStart + paddingFrameCount;
    
            // Fill padding with zeros
            for (let i = paddingStart; i < paddingEnd; i++) {
                bufferDataLeft[i] = 0;
                bufferDataRight[i] = 0;
            }
    
            // Fill chirp data
            for (let i = chirpStart; i < chirpEnd; i++) {
                const t = (i - chirpStart) / sampleRate;  // Time in seconds
                let signalValue = 0;
                frequencies.forEach(frequency => {
                    if (frequency > 0) {
                        signalValue += Math.sin(2 * Math.PI * frequency * t);
                    }
                });
                bufferDataLeft[i] = signalValue;
                bufferDataRight[i] = signalValue;
            }
        });
    
        // Fill the final padding with zeros
        const finalPaddingStart = chirpCount * (FreqFrameCount + paddingFrameCount);
        const finalPaddingEnd = finalPaddingStart + paddingFrameCount;
        for (let i = finalPaddingStart; i < finalPaddingEnd; i++) {
            bufferDataLeft[i] = 0;
            bufferDataRight[i] = 0;
        }
    
        return buffer;
    }

    function drawFrequencySpectrum(analyser, dataArray, sampleRate, frequencies) {
        const canvas = document.getElementById("canvas");
        const canvasCtx = canvas.getContext("2d");

        function draw() {
            requestAnimationFrame(draw);
            analyser.getByteFrequencyData(dataArray);

            canvasCtx.clearRect(0, 0, canvas.width, canvas.height);

            const barWidth = canvas.width / dataArray.length;
            let barHeight;
            let x = 0;

            for (let i = 0; i < dataArray.length; i++) {
                barHeight = dataArray[i];

                canvasCtx.fillStyle = `rgb(${barHeight + 100}, 50, 50)`;
                canvasCtx.fillRect(x, canvas.height - barHeight / 2, barWidth, barHeight / 2);

                x += barWidth;
            }

            // Draw frequency labels
            const nyquist = sampleRate / 2;
            frequencies.forEach(freq => {
                const bin = Math.round(freq / nyquist * dataArray.length);
                const xPos = bin * barWidth;
                canvasCtx.fillStyle = "white";
                canvasCtx.fillText(freq + " Hz", xPos, canvas.height - 10);
            });
        }

        draw();
    }

    function playSound(chirpData) {
        const messageElement = document.getElementById('message');
        messageElement.textContent = "Sample Rate: " + audioContext.sampleRate;

        let flatBuffer = createFlatAudioBuffer(audioContext, 0.01);
        const chirpBuffer = createBitFreqAudioBuffer(audioContext, chirpData, duration);
        let endBuffer = createEndingAudioBuffer(audioContext, 0.01);
        let concatenatedBuffer = concatenateAudioBuffers(audioContext, flatBuffer, chirpBuffer);
        concatenatedBuffer = concatenateAudioBuffers(audioContext, concatenatedBuffer, endBuffer);  

        const source = audioContext.createBufferSource();
        source.buffer = concatenatedBuffer;

        const analyser = audioContext.createAnalyser();
        analyser.fftSize = 2048;
        const dataArray = new Uint8Array(analyser.frequencyBinCount);

        source.connect(analyser);
        analyser.connect(audioContext.destination);

        source.start();
        drawWaveform(analyser, dataArray);
        //drawFrequencySpectrum(analyser, dataArray, audioContext.sampleRate, [2000, 4000, 6000, 8000, 10000, 12000, 14000, 16000]);


        source.onended = () => {
            source.disconnect();
            analyser.disconnect();
        };
    }

    const chirpData = ASCIIToChirpFrequency(data);
    console.log("Samples Per ASCII: " + desiredSampleRate * duration);
    console.log(chirpData);
    playSound(chirpData);
}

function convertDataToChirpRange(data, desiredSampleRate = 48000) {
    const audioContextOptions = { sampleRate: desiredSampleRate };
    const audioContext = new (window.AudioContext || window.webkitAudioContext)(audioContextOptions);

    const frequencyBase = 4000; // base frequency
    const frequencyInterval = 1000; 
    const frequencyRamp = 100; // frequency range for linear ramp
    const duration = 0.01; // duration for each ascii in seconds

    function ASCIIToChirpData(data) {
        return data.split('').map(char => {
            const charCode = char.charCodeAt(0);
            const chirpSegments = [];
            for (let i = 0; i < 8; i++) {
                if (charCode & (1 << i)) {
                    // 1 bit: frequency linearly increases
                    const startFreq = frequencyBase +  frequencyInterval * (i + 1);
                    chirpSegments.push({ startFrequency: startFreq, endFrequency: startFreq + frequencyRamp });
                } else {
                    // 0 bit: frequency is flat
                    chirpSegments.push({ startFrequency: 0, endFrequency: 0});
                }
            }
            return chirpSegments;
        });
    }

    function createChirpAudioBuffer(context, chirpData, duration, paddingDuration = 0.001) {
        const sampleRate = context.sampleRate;
        const chirpBitDuration = duration / 8; // duration of each chirp signal bit
        const chirpCount = chirpData.length;
        const ChirpframeCount = sampleRate * duration;
        const paddingFrameCount = sampleRate * paddingDuration;
        const totalFrameCount = (ChirpframeCount + paddingFrameCount) * chirpCount + paddingFrameCount;


        const buffer = context.createBuffer(2, totalFrameCount, sampleRate);
        const bufferDataLeft = buffer.getChannelData(0);
        const bufferDataRight = buffer.getChannelData(1);

        chirpData.forEach((frequencies, index) => {
            const chirpStart = Math.floor((index * (ChirpframeCount + paddingFrameCount)) + paddingFrameCount);
            const chirpEnd = chirpStart + ChirpframeCount;
            const paddingStart = Math.floor(index * (ChirpframeCount + paddingFrameCount));
            const paddingEnd = paddingStart + paddingFrameCount;

            // Fill padding with zeros
            for (let i = paddingStart; i < paddingEnd; i++) {
                bufferDataLeft[i] = 0;
                bufferDataRight[i] = 0;
            }

            frequencies.forEach(({ startFrequency, endFrequency }, idx) => {
                const start = idx * sampleRate * chirpBitDuration + chirpStart;
                const k = (endFrequency - startFrequency) / chirpBitDuration;  // Chirp rate
                if(k != 0){ 
                    for (let i = 0; i < sampleRate * chirpBitDuration; i++) {
                        const t = i / sampleRate;  // Time in seconds
                        const instantaneousFrequency = startFrequency + k * t;
                        const signalValue = Math.sin(2 * Math.PI * instantaneousFrequency * t);  // Sine wave
                        bufferDataLeft[start + i] = signalValue;
                        bufferDataRight[start + i] = signalValue;
                    }
                } else {
                    for (let i = 0; i < sampleRate * chirpBitDuration; i++) {
                        const t = i / sampleRate;  // Time in seconds
                        const instantaneousFrequency = startFrequency + k * t;
                        const signalValue = 0.99;  // Sine wave
                        bufferDataLeft[start + i] = signalValue;
                        bufferDataRight[start + i] = signalValue;
                    }
                }
            });
        });

        const finalPaddingStart = chirpCount * (ChirpframeCount + paddingFrameCount);
        const finalPaddingEnd = finalPaddingStart + paddingFrameCount;
        for (let i = finalPaddingStart; i < finalPaddingEnd; i++) {
            bufferDataLeft[i] = 0;
            bufferDataRight[i] = 0;
        }

        return buffer;
    }

    function drawFrequencySpectrum(analyser, dataArray, sampleRate) {
        const canvas = document.getElementById("canvas");
        const canvasCtx = canvas.getContext("2d");

        function draw() {
            requestAnimationFrame(draw);
            analyser.getByteFrequencyData(dataArray);

            canvasCtx.clearRect(0, 0, canvas.width, canvas.height);

            const barWidth = canvas.width / dataArray.length;
            let barHeight;
            let x = 0;

            for (let i = 0; i < dataArray.length; i++) {
                barHeight = dataArray[i];

                canvasCtx.fillStyle = `rgb(${barHeight + 100}, 50, 50)`;
                canvasCtx.fillRect(x, canvas.height - barHeight / 2, barWidth, barHeight / 2);

                x += barWidth;
            }
        }

        draw();
    }

    function playSound(chirpData) {
        const messageElement = document.getElementById('message');
        messageElement.textContent = "Sample Rate: " + audioContext.sampleRate;

        let flatBuffer = createFlatAudioBuffer(audioContext, 0.01);
        const chirpBuffer = createChirpAudioBuffer(audioContext, chirpData, duration);
        let endBuffer = createEndingAudioBuffer(audioContext, 0.01);
        let concatenatedBuffer = concatenateAudioBuffers(audioContext, flatBuffer, chirpBuffer);
        concatenatedBuffer = concatenateAudioBuffers(audioContext, concatenatedBuffer, endBuffer);  

        const source = audioContext.createBufferSource();
        source.buffer = concatenatedBuffer;

        const analyser = audioContext.createAnalyser();
        analyser.fftSize = 2048;
        const dataArray = new Uint8Array(analyser.frequencyBinCount);

        source.connect(analyser);
        analyser.connect(audioContext.destination);

        source.start();
        drawWaveform(analyser, dataArray);
        drawFrequencySpectrum(analyser, dataArray, audioContext.sampleRate);

        source.onended = () => {
            source.disconnect();
            analyser.disconnect();
        };
    }

    const chirpData = ASCIIToChirpData(data);
    console.log("Samples Per ASCII: " + desiredSampleRate * duration);
    console.log(chirpData);
    playSound(chirpData);
}



function convertDataToChirpFixed(data, desiredSampleRate = 48000) {
    const audioContextOptions = { sampleRate: desiredSampleRate };
    const audioContext = new (window.AudioContext || window.webkitAudioContext)(audioContextOptions);

    const frequencyBase = 150; // base frequency interval
    const totalDuration = 1.0; // total duration in seconds

    function ASCIIToChirpFrequency(data) {
        return data.split('').map(char => {
            const charCode = char.charCodeAt(0);
            const startFrequency = frequencyBase * charCode;
            const endFrequency = startFrequency + frequencyBase;
            return { startFrequency, endFrequency };
        });
    }

    function createChirpAudioBuffer(context, chirpData, totalDuration) {
        const sampleRate = context.sampleRate;
        const chirpDuration = totalDuration / chirpData.length; // duration of each chirp signal
        const frameCount = sampleRate * totalDuration;
        const buffer = context.createBuffer(2, frameCount, sampleRate);
        const bufferDataLeft = buffer.getChannelData(0);
        const bufferDataRight = buffer.getChannelData(1);

        chirpData.forEach(({ startFrequency, endFrequency }, index) => {
            const start = index * sampleRate * chirpDuration;
            const k = (endFrequency - startFrequency) / chirpDuration;  // Chirp rate

            for (let i = 0; i < sampleRate * chirpDuration; i++) {
                const t = i / sampleRate;  // Time in seconds
                const instantaneousFrequency = startFrequency + k * t;
                const signalValue = 2 * (t * instantaneousFrequency - Math.floor(t * instantaneousFrequency + 0.5));
                bufferDataLeft[start + i] = signalValue;
                bufferDataRight[start + i] = signalValue;
            }
        });

        return buffer;
    }

    function playSound(chirpData) {
        const messageElement = document.getElementById('message');
        messageElement.textContent = "Sample Rate: " + audioContext.sampleRate;

        const chirpBuffer = createChirpAudioBuffer(audioContext, chirpData, totalDuration);

        const source = audioContext.createBufferSource();
        source.buffer = chirpBuffer;

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

    const chirpData = ASCIIToChirpFrequency(data);
    console.log(chirpData);
    playSound(chirpData);
}

function convertBinaryData() {
    const binaryInput = document.getElementById('binaryInput').value;
    const sampleRateInput = document.getElementById('numberInput').value || 48000;
    convertDataToFSK(binaryInput, true,  parseInt(sampleRateInput));
}

function convertAsciiData() {
    const binaryInput = document.getElementById('asciiInput').value;
    const sampleRateInput = document.getElementById('numberInput').value || 48000;
    convertDataToFSK(binaryInput, false, parseInt(sampleRateInput));
}

function convertFreqAsciiData() {
    const binaryInput = document.getElementById('asciiChirpInput').value;
    const sampleRateInput = document.getElementById('numberInput').value || 48000;
    convertDataToFreqRange(binaryInput, parseInt(sampleRateInput));
}

function convertChirpAsciiData() {
    const binaryInput = document.getElementById('asciiChirpInput').value;
    const sampleRateInput = document.getElementById('numberInput').value || 48000;
    convertDataToChirpRange(binaryInput, parseInt(sampleRateInput));
}

export { convertDataToPCM, convertDataToFSK, convertBinaryData, convertAsciiData, convertFreqAsciiData, convertChirpAsciiData };
