import { initScene, renderScene } from './scene.js';
import { loadBird, updateBirdAnimation, adjustHeight } from './bird.js';
import { updateClouds, startObjectSpawning } from './clouds.js';
import { createMountainField, updateMountains } from './mountains.js';
import { connectMicrobit } from './microbit.js';
import { checkHoopCollisions, checkJetCollisions, checkJetProximity, enableAudio } from './collisions.js';
import { initEnvironments, updateEnvironments } from './environments.js';

async function init() {
  initScene();
  loadBird();
  createMountainField(); // still spawns mountains (they get wrapped later)
  await initEnvironments(); // start environment manager and keys
  
  document.getElementById('startBtn').addEventListener('click', function() {
    // Enable audio on button click
    enableAudio();
    connectMicrobit();
    
    // Start spawning objects when connecting MicroBit
    setTimeout(() => {
      startObjectSpawning();
    }, 1000); // Wait 1 second after connection starts
  });
  
  // Add arrow key event listeners for height control
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

let lastTime = performance.now();
function animate() {
  requestAnimationFrame(animate);
  const now = performance.now();
  const dt = (now - lastTime) / 1000;
  lastTime = now;

  updateClouds();
  updateMountains(); // keeps mountains moving when active
  updateEnvironments(dt); // handles switching
  updateBirdAnimation();
  checkHoopCollisions();
  checkJetCollisions();
  checkJetProximity();
  renderScene();
}


init();