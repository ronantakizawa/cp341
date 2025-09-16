import { initScene, renderScene } from './scene.js';
import { loadBird, updateBirdAnimation, applyGravity } from './bird.js';
import { updateClouds, startObjectSpawning, enableAudio as enableCloudsAudio } from './clouds.js';
import { createMountainField, updateMountains } from './mountains.js';
import { connectMicrobit } from './microbit.js';
import { checkHoopCollisions, checkJetCollisions, checkThunderCollisions, checkJetProximity, checkThunderProximity, checkSmogProximity, enableAudio } from './collisions.js';
import { initVoiceRecognition, startVoiceListening } from './voice.js';
import { isPaused } from './state.js';

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
      notification.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: rgba(255, 68, 68, 0.95);
        color: white;
        padding: 40px;
        border-radius: 15px;
        font-size: 24px;
        font-weight: bold;
        text-align: center;
        z-index: 1000;
        max-width: 600px;
        min-width: 500px;
        box-shadow: 0 8px 40px rgba(0,0,0,0.7);
        line-height: 1.4;
      `;
      notification.textContent = 'Did you know that the bird population in the United States has declined by nearly 3 billion since 1970?'
        + ' That\'s a loss of about 29% of all birds! Habitat loss, climate change, and pollution are all major factors.' 
        + ' This game aims to raise awareness about the importance of protecting America\'s birds by'
        + ' showing the harmful conditions endured by birds every day';

      const exitButton = document.createElement('button');
      exitButton.textContent = 'X';
      exitButton.style.cssText = `
        position: absolute;
        top: 10px;
        right: 10px;
        background: rgba(255, 68, 68, 0.95);
        color: white;
        border-radius: 7px;
        font-size: 12px;
        font-weight: bold;
        text-align: center;
        z-index: 1000;
        width: 25px;
        height: 25px;
        box-shadow: 0 8px 40px rgba(0,0,0,0.7);
        line-height: 1.4;
        `;

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