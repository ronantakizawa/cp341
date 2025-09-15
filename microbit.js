import { updateBirdRotation, adjustHeight } from './bird.js';
import { isPaused } from './main.js';
import { enableAudio } from './collisions.js';

let port, reader;
export let isConnected = false;
let smoothedRoll = 0;
let smoothedPitch = 0;
const smoothingFactor = 0.2;
let lastTouchState = 0;
let touchActionTime = 0;
const touchCooldown = 200; // 200ms cooldown between touch actions

export async function connectMicrobit() {
  try {
    port = await navigator.serial.requestPort();
    await port.open({ 
      baudRate: 115200,
      bufferSize: 64
    });
    
    const textDecoder = new TextDecoderStream();
    const readableStreamClosed = port.readable.pipeTo(textDecoder.writable);
    reader = textDecoder.readable.getReader();
    
    isConnected = true;
    updateStatus('Connected to MicroBit!');
    document.getElementById('startBtn').textContent = 'Disconnect';
    document.getElementById('startBtn').onclick = disconnectMicrobit;
    
    document.getElementById('logo').style.display = 'none';
    
    readSerialData();
    
  } catch (error) {
    console.error('Connection failed:', error);
    updateStatus('Connection failed');
  }
}

export function disconnectMicrobit() {
  if (reader) {
    reader.releaseLock();
  }
  if (port) {
    port.close();
  }
  isConnected = false;
  updateStatus('Disconnected');
  document.getElementById('startBtn').textContent = 'Connect MicroBit';
  document.getElementById('startBtn').onclick = connectMicrobit;
  
  document.getElementById('logo').style.display = 'block';
}

async function readSerialData() {
  try {
    while (isConnected) {
      const { value, done } = await reader.read();
      if (done) break;
      
      const lines = value.split('\n');
      for (const line of lines) {
        const trimmedLine = line.trim();
        if (trimmedLine && trimmedLine.includes(',')) {
          parseAngleData(trimmedLine);
        }
      }
    }
  } catch (error) {
    console.error('Reading error:', error);
    isConnected = false;
    updateStatus('Connection lost');
    
    document.getElementById('logo').style.display = 'block';
  }
}

function parseAngleData(dataString) {
  // Don't update bird position if game is paused
  if (isPaused) {
    return;
  }

  try {
    const parts = dataString.split(',');
    if (parts.length === 3) {
      const roll = parseFloat(parts[0]);
      const pitch = parseFloat(parts[1]);
      const touch = parseInt(parts[2]);

      if (!isNaN(roll) && !isNaN(pitch) && !isNaN(touch)) {
        smoothedRoll = smoothedRoll + smoothingFactor * (roll - smoothedRoll);
        smoothedPitch = smoothedPitch + smoothingFactor * (pitch - smoothedPitch);

        updateBirdRotation(smoothedRoll, smoothedPitch);

        // Handle touch input for height control
        processTouchInput(touch);
      }
    }
  } catch (error) {
    console.log('Parse error:', error);
  }
}

function processTouchInput(touchState) {
  const currentTime = Date.now();

  // Only process touch changes with cooldown
  if (touchState !== lastTouchState && currentTime - touchActionTime > touchCooldown) {
    if (touchState === 1) { // Touch detected (foil touching GND)
      enableAudio();
      adjustHeight(1); // Go up when touching
      touchActionTime = currentTime;
    }
    lastTouchState = touchState;
  }
}

function updateStatus(message) {
  document.getElementById('status').textContent = `Status: ${message}`;
}