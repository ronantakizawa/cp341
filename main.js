import { initScene, renderScene } from './scene.js';
import { loadBird, updateBirdAnimation, adjustHeight } from './bird.js';
import { updateClouds, startObjectSpawning } from './clouds.js';
import { createMountainField, updateMountains } from './mountains.js';
import { connectMicrobit } from './microbit.js';
import { checkHoopCollisions, checkJetCollisions, checkJetProximity, enableAudio } from './collisions.js';
import { initCamera, startGestureDetection } from './gestures.js';

async function init() {
  initScene();
  
  loadBird();
  
  createMountainField();
  
  // Initialize camera for gesture detection
  const cameraReady = await initCamera();
  if (cameraReady) {
    startGestureDetection();
  }
  
  document.getElementById('startBtn').addEventListener('click', function() {
    // Enable audio on button click
    enableAudio();
    connectMicrobit();
    
    // Start spawning objects when connecting MicroBit
    setTimeout(() => {
      startObjectSpawning();
    }, 1000); // Wait 1 second after connection starts
  });
  
  // Keep arrow key event listeners as backup controls
  document.addEventListener('keydown', function(event) {
    // Enable audio on first keypress
    enableAudio();

    if (event.code === 'ArrowUp') {
      event.preventDefault();
      adjustHeight(1); // Go up
    } else if (event.code === 'ArrowDown') {
      event.preventDefault();
      adjustHeight(-1); // Go down
    }
  });
  
  animate();
}

function animate() {
  requestAnimationFrame(animate);
  
  updateClouds();
  
  updateMountains();
  
  updateBirdAnimation();
  
  checkHoopCollisions();
  
  checkJetCollisions();
  
  checkJetProximity();
  
  renderScene();
}


init();