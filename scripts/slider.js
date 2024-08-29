import {convertChirpWheelData, convertChirpWheelIOSData} from './convertData.js';


let selectedBlock = null;

const blocks = document.querySelectorAll('.block');
const slider = document.getElementById('universalSlider');

const audioElement_wheel = document.getElementById('audioComponent_wheel');

blocks.forEach(block => {
    block.addEventListener('click', function() {
        // Highlight the selected block
        blocks.forEach(b => b.style.backgroundColor = '#3a3a3a');
        block.style.backgroundColor = '#004b8d';

        selectedBlock = block;

        // Set the slider range and value based on the selected block
        switch (block.id) {
            case 'strengthBlock':
                slider.min = 0;
                slider.max = 11;
                slider.step = 0.1;
                slider.value = parseFloat(document.getElementById('strengthValue').textContent);
                break;
            case 'ffbFilterBlock':
                slider.min = 0;
                slider.max = 15;
                slider.step = 1;
                slider.value = parseInt(document.getElementById('ffbFilterValue').textContent.split(' / ')[0]);
                break;
            case 'dampenerBlock':
                slider.min = 0;
                slider.max = 100;
                slider.step = 1;
                slider.value = parseInt(document.getElementById('dampenerValue').textContent);
                break;
            case 'angleBlock':
                slider.min = 90;
                slider.max = 1080;
                slider.step = 1;
                slider.value = parseInt(document.getElementById('angleValue').textContent);
                break;
            case 'tfAudioBlock':
                slider.min = 0;
                slider.max = 100;
                slider.step = 1;
                slider.value = parseInt(document.getElementById('tfAudioValue').textContent);
                break;
            default:
                slider.disabled = true;
                return;
        }
        slider.disabled = false;
    });
});

slider.addEventListener('input', function() {
    // if (selectedBlock) {
    //     switch (selectedBlock.id) {
    //         case 'strengthBlock':
    //             document.getElementById('strengthValue').textContent = slider.value + ' Nm';
    //             break;
    //         case 'ffbFilterBlock':
    //             document.getElementById('ffbFilterValue').textContent = slider.value + ' / 15';
    //             break;
    //         case 'dampenerBlock':
    //             document.getElementById('dampenerValue').textContent = slider.value + '%';
    //             break;
    //         case 'tfAudioBlock':
    //             document.getElementById('tfAudioValue').textContent = slider.value + '%';
    //             break;
    //         case 'angleBlock':
    //             document.getElementById('angleValue').textContent = slider.value + '°';
    //             break;
    //     }
    // }
    if (selectedBlock) {
        updateUI(selectedBlock.id, slider.value);
    }
});

function updateUI(id, value) {
    switch (id) {
        case 'strengthBlock':
            document.getElementById('strengthValue').textContent = value + ' Nm';
            break;
        case 'ffbFilterBlock':
            document.getElementById('ffbFilterValue').textContent = value + ' / 15';
            break;
        case 'dampenerBlock':
            document.getElementById('dampenerValue').textContent = value + '%';
            break;
        case 'tfAudioBlock':
            document.getElementById('tfAudioValue').textContent = value + '%';
            break;
        case 'angleBlock':
            document.getElementById('angleValue').textContent = value + '°';
            break;
    }
}
const logOutput = document.getElementById('logOutput');

// pointerup, touchend

// let wasTouched = false;
// slider.addEventListener('touchend', function() {
//     wasTouched = true;
//     if (selectedBlock) {
//         const message = 'Touchend event triggered: ' + slider.value;
//         logOutput.textContent = message;
//         handleValueChange(selectedBlock.id, slider.value);
//     }
//     setTimeout(() => wasTouched = false, 10);
// });

slider.addEventListener('mouseup', function() {
    // const message = 'Mouseup event triggered: ' + slider.value;
    // logOutput.textContent = message;
    if (selectedBlock) {
        handleValueChange(selectedBlock.id, slider.value);
    }
});

function handleValueChange(blockId, value) {
    const blockElement = document.getElementById(blockId);
    const message = 'handle value triggered: ' + value;
    logOutput.textContent = message;

    switch (selectedBlock.id) {
        case 'modeBlock':
            // convertChirpWheelData("_mod=" + value);
            SendData("_mod=" + value);
            break;
        case 'strengthBlock':
            SendData("_str=" + value);
            break;
        case 'ffbFilterBlock':
            SendData("_ffb=" + value);
            break;
        case 'dampenerBlock':
            SendData("_dam=" + value);
            break;
        case 'tfAudioBlock':
            SendData("_tfa=" + value);
            break;
        case 'angleBlock':
            SendData("_ang=" + value);
            break;
    }

    console.log(`${blockId}: ${value}`);
}

let sendMode = "chirp";

document.getElementById('sendModeSelect').addEventListener('change', function() {
    sendMode = this.value;
});

function SendData(textToSend) {
    if (sendMode == "chirp") {
        // convertChirpWheelData(textToSend);
        convertChirpWheelIOSData();
    } else {
        playAudioWithMetadata(textToSend);
    }
}

function playAudioWithMetadata(textToSend) {
    audioElement_wheel.play().then(() => {
        if ('mediaSession' in navigator) {
            navigator.mediaSession.metadata = new MediaMetadata({
                title: textToSend,
            });

            console.log('Metadata:', navigator.mediaSession.metadata);
        }
    }).catch((error) => {
        console.error('Error playing audio:', error);
    });
}

document.getElementById('modeSelect').addEventListener('change', function() {
    handleValueChange('modeBlock', this.value);
});

export {selectedBlock}