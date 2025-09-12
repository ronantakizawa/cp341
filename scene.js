import * as THREE from 'three';

export let scene, camera, renderer;
export let ambientLight, directionalLight;

// Camera shake system
let basePosition = { x: 0, y: 8, z: 20 };
let shakeIntensity = 0;
let shakeDuration = 0;

export function initScene() {
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x5483BF);
  
  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.set(0, 8, 20);
  camera.lookAt(0, 0, 0);
  
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  document.getElementById('container').appendChild(renderer.domElement);
  
  addLighting();
  
  window.addEventListener('resize', onWindowResize, false);
}

function addLighting() {
  ambientLight = new THREE.AmbientLight(0x808080, 2.0);
  scene.add(ambientLight);
  
  directionalLight = new THREE.DirectionalLight(0xffffff, 2.5);
  directionalLight.position.set(50, 50, 25);
  directionalLight.castShadow = true;
  directionalLight.shadow.mapSize.width = 2048;
  directionalLight.shadow.mapSize.height = 2048;
  scene.add(directionalLight);
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

export function renderScene() {
  // Apply camera shake
  updateCameraShake();
  
  camera.lookAt(0, 0, 0);
  renderer.render(scene, camera);
}

// Start camera shake with given intensity and duration
export function startCameraShake(intensity, duration) {
  shakeIntensity = Math.max(shakeIntensity, intensity); // Use strongest shake
  shakeDuration = Math.max(shakeDuration, duration);
}

function updateCameraShake() {
  if (shakeDuration > 0) {
    // Generate random shake offset
    const shakeX = (Math.random() - 0.5) * shakeIntensity;
    const shakeY = (Math.random() - 0.5) * shakeIntensity;
    const shakeZ = (Math.random() - 0.5) * shakeIntensity * 0.5; // Less Z shake
    
    // Apply shake to camera position
    camera.position.set(
      basePosition.x + shakeX,
      basePosition.y + shakeY,
      basePosition.z + shakeZ
    );
    
    // Reduce shake over time
    shakeDuration -= 0.016; // Approximately 60fps
    shakeIntensity *= 0.95; // Fade intensity
  } else {
    // Reset to base position when shake ends
    camera.position.set(basePosition.x, basePosition.y, basePosition.z);
    shakeIntensity = 0;
  }
}

export { onWindowResize };