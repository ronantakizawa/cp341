import { initScene, renderScene } from './scene.js';
import { loadBird, updateBirdAnimation, applyGravity } from './bird.js';
import { updateClouds, startObjectSpawning, enableAudio as enableCloudsAudio } from './clouds.js';
import { createMountainField, updateMountains } from './mountains.js';
import { connectMicrobit } from './microbit.js';
import { checkHoopCollisions, checkJetCollisions, checkThunderCollisions, checkJetProximity, checkThunderProximity, checkSmogProximity, enableAudio } from './collisions.js';
import { initVoiceRecognition, startVoiceListening } from './voice.js';
import { isPaused, resumeGame } from './state.js';
import { CSS_STYLES, NOTIFICATION_MESSAGES } from './config.js';

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

  document.getElementById('aboutBtn').addEventListener('click', function() {
    // Create notification element
    const notification = document.createElement('div');
    notification.style.cssText = CSS_STYLES.notification;
    notification.textContent = NOTIFICATION_MESSAGES.about;

    const exitButton = document.createElement('button');
    exitButton.textContent = 'X';
    exitButton.style.cssText = CSS_STYLES.xButton;

    exitButton.onclick = () => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
      resumeGame();
    } 
    // Add to page
    notification.appendChild(exitButton);
    document.body.appendChild(notification);
    
  });
  
  
  animate();
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

    checkThunderCollisions();

    checkJetProximity();

    checkThunderProximity();

    checkSmogProximity();
  }

  renderScene();
}


init();