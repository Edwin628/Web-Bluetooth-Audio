function createSineWaveAudioBuffer(audioContext, frequency, numCycles = 5) {
    const sampleRate = audioContext.sampleRate;
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

    let bufferDataLeft = audioBuffer.getChannelData(0);
    let bufferDataRight = audioBuffer.getChannelData(1);

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

    let bufferDataLeft = audioBuffer.getChannelData(0);
    let bufferDataRight = audioBuffer.getChannelData(1);

    for (let i = 0; i < bufferSize; i++) {
        bufferDataLeft[i] = 1;
        bufferDataRight[i] = -1;
    }

    return audioBuffer;
}

export { createSineWaveAudioBuffer, createLinearAudioBuffer, createFlatAudioBuffer };
