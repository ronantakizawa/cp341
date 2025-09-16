import { enableAudio } from './collisions.js';
import { isConnected } from './microbit.js';
import { isPaused, adjustGameSpeed, getGameSpeed } from './state.js';

let recognition = null;
let isListening = false;

export function initVoiceRecognition() {
  try {
    // Check if Web Speech API is supported
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      console.log('Speech recognition not supported in this browser');
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
        processVoiceCommand(command);
      }
    };

    // Handle recognition errors
    recognition.onerror = function(event) {
      console.log('Speech recognition error:', event.error);
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


    return true;

  } catch (error) {
    console.error('Error initializing voice recognition:', error);
    return false;
  }
}

export function startVoiceListening() {
  if (!recognition || isListening) return;

  try {
    isListening = true;
    recognition.start();
  } catch (error) {
    console.log('Error starting voice recognition:', error);
  }
}

export function stopVoiceListening() {
  if (!recognition || !isListening) return;

  isListening = false;
  recognition.stop();
}

function processVoiceCommand(command) {
  // Don't process commands if game is paused
  if (isPaused) {
    return;
  }


  // Enable audio on first voice command
  enableAudio();

  // Process speed commands
  if (command.includes('faster') || command.includes('speed up') || command.includes('fast')) {
    adjustGameSpeed(1);
    console.log('Voice command: Speed up');
  } else if (command.includes('slower') || command.includes('slow down') || command.includes('slow')) {
    adjustGameSpeed(-1);
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
    console.log('Voice command: Normal speed');
  } else {
    // Unrecognized command
    setTimeout(() => {
    }, 2000);
  }
}