import { initScene, renderScene } from './scene.js';
import { loadBird, updateBirdAnimation, applyGravity } from './bird.js';
import { updateClouds, startObjectSpawning, enableAudio as enableCloudsAudio } from './clouds.js';
import { createMountainField, updateMountains } from './mountains.js';
import { connectMicrobit } from './microbit.js';
import { checkHoopCollisions, checkJetCollisions, checkJetProximity, checkSmogProximity, enableAudio } from './collisions.js';
import { initVoiceRecognition, startVoiceListening } from './voice.js';

async function init() {
  initScene();
  
  loadBird();
  
  createMountainField();
  
  // Initialize voice recognition
  initVoiceRecognition();
  
  document.getElementById('startBtn').addEventListener('click', function() {
    // Enable audio on button click
    enableAudio();
    enableCloudsAudio(); // Also enable audio for thunder sounds
    connectMicrobit();

    // Start voice listening when MicroBit connects
    startVoiceListening();

    // Start spawning objects when connecting MicroBit
    setTimeout(() => {
      startObjectSpawning();
    }, 1000); // Wait 1 second after connection starts
  });
  
  animate();
}

export let isPaused = false;

// Game speed control
export let gameSpeed = 1.0; // Normal speed
const minSpeed = 0.1; // Minimum speed (half speed)
const maxSpeed = 3.0; // Maximum speed (3x speed)
const speedStep = 0.75; // How much to change speed per command

export function pauseGame() {
  isPaused = true;
}

export function resumeGame() {
  isPaused = false;
}

export function adjustGameSpeed(direction) {
  gameSpeed += direction * speedStep;

  // Clamp speed between min and max
  if (gameSpeed > maxSpeed) {
    gameSpeed = maxSpeed;
  } else if (gameSpeed < minSpeed) {
    gameSpeed = minSpeed;
  }

  // Round to 1 decimal place for cleaner display
  gameSpeed = Math.round(gameSpeed * 10) / 10;
}

export function getGameSpeed() {
  return gameSpeed;
}

function animate() {
  requestAnimationFrame(animate);

  if (!isPaused) {
    updateClouds();

    updateMountains();

    updateBirdAnimation();

    applyGravity();

    checkHoopCollisions();

    checkJetCollisions();

    checkJetProximity();

    checkSmogProximity();
  }

  renderScene();
}


init();