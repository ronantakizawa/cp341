import { initScene, renderScene } from './scene.js';
import { loadBird, updateBirdAnimation } from './bird.js';
import { createCloudField, updateClouds } from './clouds.js';
import { createMountainField, updateMountains } from './mountains.js';
import { connectMicrobit } from './microbit.js';

function init() {
  initScene();
  
  createCloudField();
  
  loadBird();
  
  createMountainField();
  
  document.getElementById('startBtn').addEventListener('click', connectMicrobit);
  
  animate();
}

function animate() {
  requestAnimationFrame(animate);
  
  updateClouds();
  
  updateMountains();
  
  updateBirdAnimation();
  
  renderScene();
}

init();