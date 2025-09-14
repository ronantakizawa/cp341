import { adjustHeight } from './bird.js';
import { enableAudio } from './collisions.js';
import { isConnected } from './microbit.js';
import { isPaused } from './main.js';

let video;
let hands;
let camera;
let isDetecting = false;

// Gesture detection variables
let lastGesture = null;
let lastActionTime = 0;
let actionInterval = 150; // Continuous action every 150ms while gesture is held

export async function initCamera() {
  try {
    // Wait for MediaPipe to load
    if (typeof Hands === 'undefined') {
      await new Promise((resolve, reject) => {
        const timeout = setTimeout(() => reject(new Error('MediaPipe loading timeout')), 10000);
        const checkLibs = () => {
          if (typeof Hands !== 'undefined') {
            clearTimeout(timeout);
            resolve();
          } else {
            setTimeout(checkLibs, 100);
          }
        };
        checkLibs();
      });
    }

    video = document.getElementById('camera');

    // Request camera access
    const stream = await navigator.mediaDevices.getUserMedia({
      video: {
        width: 160,
        height: 120,
        facingMode: 'user' // Front-facing camera
      }
    });

    video.srcObject = stream;

    // Wait for video to load
    await new Promise(resolve => {
      video.onloadedmetadata = resolve;
    });

    // Initialize MediaPipe Hands
    hands = new Hands({
      locateFile: (file) => {
        return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
      }
    });

    hands.setOptions({
      maxNumHands: 1,
      modelComplexity: 1,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5
    });

    hands.onResults(onResults);

    // Initialize camera utils
    camera = new Camera(video, {
      onFrame: async () => {
        if (isDetecting) {
          await hands.send({image: video});
        }
      },
      width: 160,
      height: 120
    });

    document.getElementById('cameraStatus').textContent = 'Camera: Ready';

    return true;
  } catch (error) {
    document.getElementById('cameraStatus').textContent = 'Camera: Error';
    return false;
  }
}

export function startGestureDetection() {
  if (isDetecting || !camera) return;

  isDetecting = true;
  document.getElementById('cameraStatus').textContent = 'Camera: Detecting';
  camera.start();
}

export function stopGestureDetection() {
  isDetecting = false;
  if (camera) {
    camera.stop();
  }
  document.getElementById('cameraStatus').textContent = 'Camera: Stopped';
}

function onResults(results) {
  if (!isDetecting) return;

  const currentTime = Date.now();

  if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
    const landmarks = results.multiHandLandmarks[0];
    const gesture = recognizeGesture(landmarks);

    if (gesture) {
      processGesture(gesture, currentTime);
      updateCameraStatus(`Gesture: ${gesture}`);
    } else {
      lastGesture = null;
      updateCameraStatus('Hand detected');
    }
  } else {
    lastGesture = null;
    updateCameraStatus('No hand detected');
  }
}

function recognizeGesture(landmarks) {
  // Hand landmark indices (MediaPipe format)
  const THUMB_TIP = 4;
  const THUMB_IP = 3;
  const THUMB_MCP = 2;
  const INDEX_TIP = 8;
  const INDEX_PIP = 6;
  const MIDDLE_TIP = 12;
  const RING_TIP = 16;
  const PINKY_TIP = 20;
  const WRIST = 0;

  // Get landmark positions
  const thumbTip = landmarks[THUMB_TIP];
  const thumbIp = landmarks[THUMB_IP];
  const thumbMcp = landmarks[THUMB_MCP];
  const indexTip = landmarks[INDEX_TIP];
  const indexPip = landmarks[INDEX_PIP];
  const middleTip = landmarks[MIDDLE_TIP];
  const ringTip = landmarks[RING_TIP];
  const pinkyTip = landmarks[PINKY_TIP];
  const wrist = landmarks[WRIST];

  // Check if thumb is extended (above other joints)
  const thumbExtended = thumbTip.y < thumbIp.y && thumbTip.y < thumbMcp.y;

  // Check if other fingers are folded (tips below their middle joints or closer to wrist)
  const indexFolded = indexTip.y > indexPip.y;
  const middleFolded = middleTip.y > landmarks[10].y; // MIDDLE_PIP
  const ringFolded = ringTip.y > landmarks[14].y; // RING_PIP
  const pinkyFolded = pinkyTip.y > landmarks[18].y; // PINKY_PIP

  // Count folded fingers (at least 3 should be folded for thumb gestures)
  const foldedCount = [indexFolded, middleFolded, ringFolded, pinkyFolded].filter(Boolean).length;

  // Thumbs up: thumb extended, at least 3 other fingers folded
  if (thumbExtended && foldedCount >= 3) {
    return 'thumbs_up';
  }

  // Thumbs down: thumb pointing down, at least 3 other fingers folded
  const thumbDown = thumbTip.y > thumbIp.y && thumbTip.y > thumbMcp.y;

  if (thumbDown && foldedCount >= 3) {
    return 'thumbs_down';
  }

  return null;
}

function processGesture(gesture, currentTime) {
  // Enable audio on first gesture detection
  enableAudio();

  // Check if enough time has passed since last action for continuous movement
  if (currentTime - lastActionTime >= actionInterval) {
    executeGestureAction(gesture);
    lastActionTime = currentTime;
  }

  lastGesture = gesture;
}

function executeGestureAction(gesture) {
  // Don't allow height changes if game is paused
  if (isPaused) {
    return;
  }

  // Only allow height changes if microbit is connected
  if (!isConnected) {
    updateCameraStatus('Connect MicroBit first!');
    return;
  }

  if (gesture === 'thumbs_up') {
    adjustHeight(1);
    updateCameraStatus('👍 UP!');
  } else if (gesture === 'thumbs_down') {
    adjustHeight(-1);
    updateCameraStatus('👎 DOWN!');
  }
}

function updateCameraStatus(status) {
  const statusElement = document.getElementById('cameraStatus');
  statusElement.textContent = `Camera: ${status}`;

  // Reset status after 2 seconds for action confirmations
  if (status.includes('👍') || status.includes('👎')) {
    setTimeout(() => {
      if (isDetecting) {
        statusElement.textContent = 'Camera: Detecting';
      }
    }, 2000);
  }
}

export function getCameraStatus() {
  return {
    isDetecting,
    lastGesture
  };
}