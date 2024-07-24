import { displayNumber } from './audioContext.js';
import { convertDataToPCM, convertDataToFSK, convertBinaryData, convertAsciiData, convertChirpAsciiData } from './convertData.js';


window.convertDataToPCM = convertDataToPCM;
window.convertDataToFSK = convertDataToFSK;
window.convertBinaryData = convertBinaryData;
window.convertAsciiData = convertAsciiData;
window.convertChirpAsciiData = convertChirpAsciiData;

document.getElementById('numberInput').addEventListener('change', displayNumber);
