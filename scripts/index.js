import { displayNumber } from './audioContext.js';
import { convertDataToPCM, convertDataToFSK, convertBinaryData, convertAsciiData, convertFreqAsciiData, convertChirpAsciiData, convertChirpSliderData, convertChirpWheelData} from './convertData.js';


window.convertDataToPCM = convertDataToPCM;
window.convertDataToFSK = convertDataToFSK;
window.convertBinaryData = convertBinaryData;
window.convertAsciiData = convertAsciiData;
window.convertFreqAsciiData = convertFreqAsciiData;
window.convertChirpAsciiData = convertChirpAsciiData;
window.convertChirpSliderData = convertChirpSliderData;
window.updateSliderValue = updateSliderValue;

document.getElementById('numberInput').addEventListener('change', displayNumber);

// Function to update the displayed slider value
function updateSliderValue() {
    var slider = document.getElementById('valueSlider');
    var output = document.getElementById('sliderValue');
    output.textContent = slider.value;
}



