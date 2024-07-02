import { displayNumber } from './audioContext.js';
import { convertDataToPCM, convertDataToFSK, convertBinaryData } from './convertData.js';


window.convertDataToPCM = convertDataToPCM;
window.convertDataToFSK = convertDataToFSK;
window.convertBinaryData = convertBinaryData;


document.getElementById('numberInput').addEventListener('change', displayNumber);
