import { displayNumber } from './audioContext.js';
import { convertDataToPCM, convertDataToFSK } from './convertData.js';


window.convertDataToPCM = convertDataToPCM;
window.convertDataToFSK = convertDataToFSK;

document.getElementById('numberInput').addEventListener('change', displayNumber);
