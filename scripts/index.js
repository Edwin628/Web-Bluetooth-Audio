import { displayNumber } from './audioContext.js';
import { convertDataToPCM, convertDataToFSK, convertBinaryData, convertAsciiData, convertFreqAsciiData, convertChirpAsciiData } from './convertData.js';


window.convertDataToPCM = convertDataToPCM;
window.convertDataToFSK = convertDataToFSK;
window.convertBinaryData = convertBinaryData;
window.convertAsciiData = convertAsciiData;
window.convertFreqAsciiData = convertFreqAsciiData;
window.convertChirpAsciiData = convertChirpAsciiData;
window.generateAndPlaySilentAudio = generateAndPlaySilentAudio;

document.getElementById('numberInput').addEventListener('change', displayNumber);


function AVRCPSend() {
    const textToSend = document.getElementById('asciiChirpInput').value;

    // Media Session API
    if ('mediaSession' in navigator) {
        navigator.mediaSession.metadata = new MediaMetadata({
            title: textToSend,
            artist: 'lOGITECH', 
            album: 'WIRELESS CONTROL PROJ', 
        });
    }
    console.log("Text to send:", textToSend);
}

function generateAndPlaySilentAudio() {

    const textToSend = document.getElementById('asciiChirpInput').value;
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();

    const duration = 1; // seconds
    
    const sampleRate = audioContext.sampleRate;
    const frameCount = sampleRate * duration;
    const audioBuffer = audioContext.createBuffer(1, frameCount, sampleRate);
    
    const channelData = audioBuffer.getChannelData(0);
    for (let i = 0; i < frameCount; i++) {
        channelData[i] = 1000;
    }
    
    const source = audioContext.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(audioContext.destination);
    
    if ('mediaSession' in navigator) {
        navigator.mediaSession.metadata = new MediaMetadata({
            title: textToSend,
            artist: 'Generated Silence',
            album: 'Silent Album',
        });

        navigator.mediaSession.setActionHandler('play', () => {
            source.start();
        });

        navigator.mediaSession.setActionHandler('pause', () => {
            source.stop();
        });

        navigator.mediaSession.setActionHandler('previoustrack', () => {
            console.log('Previous track action not supported.');
        });

        navigator.mediaSession.setActionHandler('nexttrack', () => {
            console.log('Next track action not supported.');
        });
    }
    console.log(navigator.mediaSession.metadata);

    source.start();
}

const audioElement = document.getElementById('audioComponent');
const playPauseButton = document.getElementById('playPauseButton');
let textToSend = document.getElementById('asciiChirpInput').value;

// playPauseButton.addEventListener('click', function() {
//     if (audioElement.paused) {
//         audioElement.play();
//         playPauseButton.textContent = 'Pause';
//     } else {
//         audioElement.pause();
//         playPauseButton.textContent = 'Play';
//     }
//     audioElement.play();
// });

// stopAndDelete
function stopAndDelete() {
    audioElement.pause();
    audioElement.currentTime = 0; // reset audio playing position
    playPauseButton.textContent = 'Play';

    // reset
    playPauseButton.removeEventListener('click', stopAndDelete);
}

playPauseButton.addEventListener('click', function handlePlayPause() {
    if (audioElement.paused) {
        audioElement.play().then(() => {
            playPauseButton.textContent = 'Stop and Delete';
            playPauseButton.addEventListener('click', stopAndDelete, { once: true }); // use once: true delete once
        }).catch((error) => {
            console.error('play audio error:', error);
        });
    }
});

// audio end
audioElement.addEventListener('ended', function() {
    playPauseButton.textContent = 'Play';
    playPauseButton.removeEventListener('click', stopAndDelete);
});


// Media Session API 
audioElement.addEventListener('play', function() {
    textToSend = document.getElementById('asciiChirpInput').value;
    if ('mediaSession' in navigator) {
        navigator.mediaSession.metadata = new MediaMetadata({
            title: textToSend,          
            // artist: 'Your Artist Name',  
            // album: 'Your Album Name',    
        });

        console.log('Metadata:', navigator.mediaSession.metadata);
    }
});

audioElement.addEventListener('pause', function() {
    playPauseButton.textContent = 'Play';
});

