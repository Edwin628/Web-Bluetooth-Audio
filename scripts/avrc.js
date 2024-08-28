function setupAudioControls(audioElement, playPauseButton, id) {
    // Function to stop and reset audio playback
    function stopAndDelete() {
        audioElement.pause();
        audioElement.currentTime = 0; // Reset audio playback position
        playPauseButton.textContent = 'Play';

        // Remove the stop event listener
        playPauseButton.removeEventListener('click', stopAndDelete);
    }

    // Handle play and pause logic
    playPauseButton.addEventListener('click', function handlePlayPause() {
        if (audioElement.paused) {
            audioElement.play().then(() => {
                playPauseButton.textContent = 'Stop and Delete';
                playPauseButton.addEventListener('click', stopAndDelete, { once: true }); // Add event listener for stop, remove after one click
            }).catch((error) => {
                console.error('play audio error:', error);
            });
        }
    });

    // Reset button state when audio ends
    audioElement.addEventListener('ended', function() {
        playPauseButton.textContent = 'Play';
        playPauseButton.removeEventListener('click', stopAndDelete);
    });

    // Media Session API logic
    audioElement.addEventListener('play', function() {
        let textToSend = document.getElementById(id).value;
        if (id === 'valueSlider') {
            textToSend = "_str_" + textToSend;
        }
        if ('mediaSession' in navigator) {
            navigator.mediaSession.metadata = new MediaMetadata({
                title: textToSend,
                // artist: 'Your Artist Name',  
                // album: 'Your Album Name',    
            });

            console.log('Metadata:', navigator.mediaSession.metadata);
        }
    });

    // Reset button text on pause
    audioElement.addEventListener('pause', function() {
        playPauseButton.textContent = 'Play';
    });
}

const audioElement = document.getElementById('audioComponent');
const playPauseButton = document.getElementById('playPauseButton');

const audioElement2 = document.getElementById('audioComponent_slider');
const playPauseButton_slider = document.getElementById('playPauseButton_slider');
let slidervalToSend = "_str_" + document.getElementById('valueSlider').value;

setupAudioControls(audioElement, playPauseButton, 'asciiChirpInput');
setupAudioControls(audioElement2, playPauseButton_slider, 'valueSlider');

