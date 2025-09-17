import { updateBirdRotation, adjustHeight } from './bird.js';
import { isPaused } from './state.js';
import { enableAudio } from './collisions.js';

let port, reader;
export let isConnected = false;
// Smoothing variables for raw accelerometer data
let smoothedX = 0;
let smoothedY = 0;
let smoothedZ = 0;
const smoothingFactor = 0.3; // Match original microbit smoothing
let targetRoll = 0;
const rollThreshold = 5; // degrees - minimum tilt to register movement
const rollHoldTime = 1000; // ms - how long to hold position
let lastRollUpdateTime = 0;
let lastTouchState = 0;
let touchActionTime = 0;
const touchCooldown = 200; // 200ms cooldown between touch actions
let serialBuffer = ''; // Buffer for incomplete serial data

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
    document.getElementById('startBtn').textContent = 'Disconnect';
    document.getElementById('startBtn').onclick = disconnectMicrobit;
    
    document.getElementById('logo').style.display = 'none';
    
    readSerialData();
    
  } catch (error) {
    console.error('Connection failed:', error);
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
  document.getElementById('startBtn').textContent = 'Connect MicroBit';
  document.getElementById('startBtn').onclick = connectMicrobit;
  
  document.getElementById('logo').style.display = 'block';
}

async function readSerialData() {
  try {
    while (isConnected) {
      const { value, done } = await reader.read();
      if (done) break;

      // Add incoming data to buffer
      serialBuffer += value;

      // Process complete lines
      const lines = serialBuffer.split('\n');
      // Keep the last incomplete line in buffer
      serialBuffer = lines.pop() || '';

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
    console.log('Received data:', dataString, 'Parts:', parts.length);
    if (parts.length === 4) {
      const rawX = parseInt(parts[0]);
      const rawY = parseInt(parts[1]);
      const rawZ = parseInt(parts[2]);
      const touch = parseInt(parts[3]);

      if (!isNaN(rawX) && !isNaN(rawY) && !isNaN(rawZ) && !isNaN(touch)) {
        // Apply exponential smoothing to raw accelerometer data
        smoothedX = smoothedX + smoothingFactor * (rawX - smoothedX);
        smoothedY = smoothedY + smoothingFactor * (rawY - smoothedY);
        smoothedZ = smoothedZ + smoothingFactor * (rawZ - smoothedZ);

        // Calculate roll and pitch from smoothed values
        const roll = Math.atan2(smoothedX, Math.sqrt(smoothedY * smoothedY + smoothedZ * smoothedZ)) * (180 / Math.PI);
        const pitch = Math.atan2(-smoothedY, Math.sqrt(smoothedX * smoothedX + smoothedZ * smoothedZ)) * (180 / Math.PI);

        // Apply position holding logic for roll
        const currentTime = Date.now();
        let finalRoll = roll;

        if (Math.abs(roll) > rollThreshold) {
          // Significant tilt detected - update target position
          targetRoll = roll;
          lastRollUpdateTime = currentTime;
          finalRoll = roll;
        } else if (currentTime - lastRollUpdateTime < rollHoldTime) {
          // Hold the last position for a bit
          finalRoll = targetRoll;
        } else {
          // Return to center after hold time
          targetRoll = targetRoll + 0.1 * (0 - targetRoll);
          finalRoll = targetRoll;
        }


        updateBirdRotation(finalRoll, pitch);

        // Handle touch input for height control
        processTouchInput(touch);
      }
    } else if (parts.length === 3) {
      // Fallback for old format (roll, pitch, touch)
      console.log('Using old format');
      const roll = parseFloat(parts[0]);
      const pitch = parseFloat(parts[1]);
      const touch = parseInt(parts[2]);

      if (!isNaN(roll) && !isNaN(pitch) && !isNaN(touch)) {
        updateBirdRotation(roll, pitch);
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