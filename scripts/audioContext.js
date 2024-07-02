const AudioContext = window.AudioContext || window.webkitAudioContext;
const OfflineAudioContext = window.OfflineAudioContext || window.webkitOfflineAudioContext;

let desiredSampleRate = 48000;

function displayNumber() {
    desiredSampleRate = document.getElementById('numberInput').value;
}

export { AudioContext, OfflineAudioContext, desiredSampleRate, displayNumber };
