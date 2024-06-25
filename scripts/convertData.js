import { createSineWaveAudioBuffer, createLinearAudioBuffer, createFlatAudioBuffer } from './audioBuffers.js';
import { drawWaveform } from './draw.js';
import { desiredSampleRate } from './audioContext.js';

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
                audioBuffer = createSineWaveAudioBuffer(audioContext, 1000, 1000);
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
    }

    playSound();
}

function dataToFrequency(data) {
    // A simple conversion
    return data.split('').map(char => 440 + char.charCodeAt(0) * 20);
}

function convertDataToFSK(data, desiredSampleRate = 48000) {
    const audioContextOptions = { sampleRate: desiredSampleRate };
    const audioContext = new (window.AudioContext || window.webkitAudioContext)(audioContextOptions);

    const frequency0 = 1000;
    const frequency1 = 2000;

    function dataToFrequency(data) {
        return data.split('').map(bit => bit === '0' ? frequency0 : frequency1);
    }

    function createFSKAudioBuffer(context, frequencies, duration = 0.1) {
        const sampleRate = context.sampleRate;
        const frameCount = sampleRate * duration * frequencies.length;
        const buffer = context.createBuffer(1, frameCount, sampleRate);
        const data = buffer.getChannelData(0);

        frequencies.forEach((frequency, index) => {
            const start = index * sampleRate * duration;
            for (let i = 0; i < sampleRate * duration; i++) {
                data[start + i] = Math.sin(2 * Math.PI * frequency * i / sampleRate);
            }
        });

        return buffer;
    }

    function playSound(frequencies) {
        const messageElement = document.getElementById('message');
        messageElement.textContent = "Sample Rate: " + audioContext.sampleRate;

        const audioBuffer = createFSKAudioBuffer(audioContext, frequencies);

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
    }

    const frequencies = dataToFrequency(data);
    playSound(frequencies);
}

export { convertDataToPCM, convertDataToFSK };
