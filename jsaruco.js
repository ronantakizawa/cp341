import { adjustHeight } from './bird.js';
import { enableAudio } from './collisions.js';

let video;
let canvas;
let ctx;
let isDetecting = false;
let detector;

// Track marker position for movement-based control
let lastMarkerY = null;
let currentMarkerY = null;
let markerMovementThreshold = 2; // Minimum pixels to register movement
let heightSensitivity = 0.3; // How much height change per pixel moved

export async function initCamera() {
  try {
    // Wait for js-aruco to load
    if (typeof AR === 'undefined' || typeof CV === 'undefined') {
      await new Promise((resolve, reject) => {
        const timeout = setTimeout(() => reject(new Error('js-aruco loading timeout')), 10000);
        const checkLibs = () => {
          if (typeof AR !== 'undefined' && typeof CV !== 'undefined') {
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
    
    // Create off-screen canvas for processing
    canvas = document.createElement('canvas');
    canvas.width = 160;
    canvas.height = 120;
    ctx = canvas.getContext('2d');
    
    // Initialize ArUco detector
    detector = new AR.Detector();
    
    document.getElementById('cameraStatus').textContent = 'Camera: Ready';
    
    return true;
  } catch (error) {
    console.error('Error initializing camera:', error);
    document.getElementById('cameraStatus').textContent = 'Camera: Error';
    return false;
  }
}

export function startArUcoDetection() {
  if (isDetecting) return;
  
  isDetecting = true;
  document.getElementById('cameraStatus').textContent = 'Camera: Detecting';
  detectArUcoMarkers();
}

export function stopArUcoDetection() {
  isDetecting = false;
  document.getElementById('cameraStatus').textContent = 'Camera: Stopped';
}

function detectArUcoMarkers() {
  if (!isDetecting || !video || !detector) {
    if (isDetecting) {
      requestAnimationFrame(detectArUcoMarkers);
    }
    return;
  }
  
  try {
    // Draw video frame to canvas
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    // Get image data
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    
    // Detect ArUco markers
    const markers = detector.detect(imageData);
    
    
    // Process detected markers
    if (markers.length > 0) {
      // Use the first detected marker for position tracking
      const marker = markers[0];
      
      // Calculate marker center position
      const corners = marker.corners;
      let centerY = 0;
      for (let i = 0; i < corners.length; i++) {
        centerY += corners[i].y;
      }
      centerY = centerY / corners.length;
      
      currentMarkerY = centerY;
      
      // Process movement if we have a previous position
      if (lastMarkerY !== null) {
        processMarkerMovement(currentMarkerY, lastMarkerY);
      }
      
      lastMarkerY = currentMarkerY;
      updateCameraStatus(`Y: ${Math.round(currentMarkerY)}`);
    } else {
      // No marker detected
      lastMarkerY = null;
      currentMarkerY = null;
    }
    
  } catch (error) {
    console.error('ArUco detection error:', error);
  }
  
  // Continue detection loop
  if (isDetecting) {
    requestAnimationFrame(detectArUcoMarkers);
  }
}

function processMarkerMovement(currentY, lastY) {
  // Enable audio on first marker detection
  enableAudio();
  
  const deltaY = currentY - lastY;
  
  // Only process significant movements
  if (Math.abs(deltaY) > markerMovementThreshold) {
    // Simplified logic: just check direction
    if (deltaY < -markerMovementThreshold) {
      // Marker moved up in camera = bird should go up
      adjustHeight(1);
      updateCameraStatus('UP');
    } else if (deltaY > markerMovementThreshold) {
      // Marker moved down in camera = bird should go down
      adjustHeight(-1);
      updateCameraStatus('DOWN');
    }
  }
}

function updateCameraStatus(command) {
  const statusElement = document.getElementById('cameraStatus');
  statusElement.textContent = `Camera: ${command}`;
  
  // Reset status after 1 second
  setTimeout(() => {
    if (isDetecting) {
      statusElement.textContent = 'Camera: Detecting';
    }
  }, 1000);
}

export function getCameraStatus() {
  return {
    isDetecting,
    lastMarkerY,
    currentMarkerY
  };
}