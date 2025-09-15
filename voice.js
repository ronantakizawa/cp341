import { enableAudio } from './collisions.js';
import { isConnected } from './microbit.js';
import { isPaused, adjustGameSpeed, getGameSpeed } from './main.js';

let recognition = null;
let isListening = false;

export function initVoiceRecognition() {
  try {
    // Check if Web Speech API is supported
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      console.log('Speech recognition not supported in this browser');
      updateVoiceStatus('Voice: Not supported');
      return false;
    }

    // Create speech recognition instance
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognition = new SpeechRecognition();

    // Configure recognition settings
    recognition.continuous = true; // Keep listening
    recognition.interimResults = false; // Only final results
    recognition.lang = 'en-US'; // English language
    recognition.maxAlternatives = 1; // Single best result

    // Handle successful recognition
    recognition.onresult = function(event) {
      const lastResult = event.results[event.results.length - 1];
      if (lastResult.isFinal) {
        const command = lastResult[0].transcript.toLowerCase().trim();
        console.log('Voice command received:', command);
        processVoiceCommand(command);
      }
    };

    // Handle recognition errors
    recognition.onerror = function(event) {
      console.log('Speech recognition error:', event.error);
      if (event.error === 'not-allowed') {
        updateVoiceStatus('Voice: Permission denied');
      } else if (event.error === 'no-speech') {
        // This is normal, don't show error
      } else {
        updateVoiceStatus('Voice: Error');
      }
    };

    // Handle recognition end
    recognition.onend = function() {
      if (isListening) {
        // Restart recognition if we're supposed to be listening
        try {
          recognition.start();
        } catch (error) {
          console.log('Error restarting recognition:', error);
        }
      }
    };

    updateVoiceStatus('Voice: Ready');
    return true;

  } catch (error) {
    console.error('Error initializing voice recognition:', error);
    updateVoiceStatus('Voice: Error');
    return false;
  }
}

export function startVoiceListening() {
  if (!recognition || isListening) return;

  try {
    isListening = true;
    recognition.start();
    updateVoiceStatus('Voice: Listening...');
    console.log('Voice recognition started');
  } catch (error) {
    console.log('Error starting voice recognition:', error);
    updateVoiceStatus('Voice: Error starting');
  }
}

export function stopVoiceListening() {
  if (!recognition || !isListening) return;

  isListening = false;
  recognition.stop();
  updateVoiceStatus('Voice: Stopped');
  console.log('Voice recognition stopped');
}

function processVoiceCommand(command) {
  // Don't process commands if game is paused
  if (isPaused) {
    return;
  }

  // Only process commands if microbit is connected
  if (!isConnected) {
    updateVoiceStatus('Voice: Connect MicroBit first!');
    return;
  }

  // Enable audio on first voice command
  enableAudio();

  // Process speed commands
  if (command.includes('faster') || command.includes('speed up') || command.includes('fast')) {
    adjustGameSpeed(1);
    updateVoiceStatus(`Voice: Speed ${getGameSpeed()}x`);
    console.log('Voice command: Speed up');
  } else if (command.includes('slower') || command.includes('slow down') || command.includes('slow')) {
    adjustGameSpeed(-1);
    updateVoiceStatus(`Voice: Speed ${getGameSpeed()}x`);
    console.log('Voice command: Slow down');
  } else if (command.includes('normal') || command.includes('reset')) {
    // Reset to normal speed
    while (getGameSpeed() !== 1.0) {
      if (getGameSpeed() > 1.0) {
        adjustGameSpeed(-1);
      } else {
        adjustGameSpeed(1);
      }
    }
    updateVoiceStatus(`Voice: Speed ${getGameSpeed()}x`);
    console.log('Voice command: Normal speed');
  } else {
    // Unrecognized command
    updateVoiceStatus('Voice: Say "faster" or "slower"');
    setTimeout(() => {
      if (isListening) {
        updateVoiceStatus('Voice: Listening...');
      }
    }, 2000);
  }
}

function updateVoiceStatus(status) {
  // Voice status could be displayed elsewhere if needed
  console.log(status);
}

export function getVoiceStatus() {
  return {
    isListening,
    isSupported: recognition !== null
  };
}