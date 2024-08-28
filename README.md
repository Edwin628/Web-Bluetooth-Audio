# Web-Bluetooth-Audio

This project is a web-based application that leverages the Web Bluetooth API to interact with Bluetooth-enabled audio devices. It provides functionality to stream, process, and visualize audio data through the browser.

## Table of Contents

- [Installation](#installation)
- [Usage](#usage)
- [Project Structure](#project-structure)
- [License](#license)

## Installation

To run this project locally, you can follow these steps:

1. Navigate to the project directory:
   ```bash
   cd Web-Bluetooth-Audio
   ```
2. Open `index.html` in your preferred web browser:
   ```bash
   open index.html
   ```

> **Note:** This project requires a modern web browser that supports the Web Bluetooth API.

## Usage

Once the project is running in your browser:

1. The application will prompt you to connect to a Bluetooth audio device.
2. After establishing a connection, you can choose different audio files from the `assets` folder to play.
3. The application includes various scripts for audio visualization and manipulation.

### Chirp Send
Test for Chirp Signal Send, change it based on your need on `scripts/convertData.js`: 
  - `frequencyBase`: base frequency.
  - `frequencyInterval`: Frequency Interval between each bits.
  - `frequencyRamp`: Frequency range for linear ramp.
  - `duration`: Duration for each ascii in seconds.

```js client
function convertDataToChirpRange(data, desiredSampleRate = 48000) {
    const audioContextOptions = { sampleRate: desiredSampleRate };
    const audioContext = new (window.AudioContext || window.webkitAudioContext)(audioContextOptions);

    const frequencyBase = 4000; // base frequency
    const frequencyInterval = 1000; 
    const frequencyRamp = 100; // frequency range for linear ramp
    const duration = 0.01; // duration for each ascii in seconds
    ...
}
```

### AVRC Send
Test for AVRC Send, change it based on your need on `index.html`: 
```html
<audio id="audioComponent"  style="display: none;" controls>
    <source src="./assets/sound_5.mp3" >
    Your browser does not support the audio element.
</audio>
```
- **WAV Files:**
  - `high_freq_sine_3.wav`: High-frequency sine wave(3s).
  - `high_freq_sine_5.wav`: High-frequency sine wave(5s).
  - `high_freq_sine_10.wav`: High-frequency sine wave(10s).
  - `silent_audio.wav`: A silent audio track.

- **MP3 Files:**
  - `sound_3.mp3`: Sample sound file(3s).
  - `sound_5.mp3`: Sample sound file(5s).
  - `sound_10.mp3`: Sample sound file(10s).
  - `sound1-a.mp3`: Sample sound file.

## Project Structure

- **assets/**: Contains audio files used by the application.

- **scripts/**: Contains JavaScript files for the functionality of the web app.
  - `audio.js`: Old audio script.
  - `audioBuffers.js`: Manages audio buffers (sine, linear, flat).
  - `audioContext.js`: Manages the AudioContext.
  - `bluetooth.js`: Handles Bluetooth connectivity.
  - `convertData.js`: Converts data to audio.
  - `avrc.js`: Send data using arvc metadata.
  - `ggwave_lib.js`: Library for ggwave.
  - `draw.js`: Handles visual representation of audio.
  - `ggwave_lib.js`: Library for ggwave.
  - `ggwave.js`: Wrapper around the ggwave library.
  - `index.js`: Main entry point of the application.

- **index.html**: The main HTML file that bootstraps the web application.

- **styles.css**: Contains the styling for the application.

## License

This project is used for Logitech Project: Wireless Device Interaction over Digital Audio
