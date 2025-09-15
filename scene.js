import * as THREE from 'three';

export let scene, camera, renderer;
export let ambientLight, directionalLight;

// Camera shake system
let basePosition = { x: 0, y: 8, z: 20 };
let shakeIntensity = 0;
let shakeDuration = 0;

// Visual distortion system
let distortionIntensity = 0;
let distortionDuration = 0;
let originalFogColor = null;
let originalBgColor = null;

export function initScene() {
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x5483BF);

  // Store original colors for distortion effects
  originalBgColor = scene.background.clone();
  
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

  // Apply visual distortion effects
  updateVisualDistortion();

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

// Start visual distortion with given intensity and duration
export function startVisualDistortionEffect(intensity, duration) {
  distortionIntensity = Math.max(distortionIntensity, intensity);
  distortionDuration = Math.max(distortionDuration, duration);
}

function updateVisualDistortion() {
  if (distortionDuration > 0) {
    // Apply color distortion - make scene more grayish/brownish for smog
    const distortionFactor = distortionIntensity * (distortionDuration / 3.0); // Normalize based on typical duration

    // Create a polluted/smoggy tint
    const pollutedColor = new THREE.Color(0x8B7355); // Brownish-gray smog color
    const currentBg = originalBgColor.clone();
    currentBg.lerp(pollutedColor, Math.min(distortionFactor * 0.4, 0.6)); // Max 60% tint
    scene.background.copy(currentBg);

    // Reduce ambient light to simulate smog blocking sunlight
    if (ambientLight) {
      const originalIntensity = 2.0;
      ambientLight.intensity = originalIntensity * (1 - Math.min(distortionFactor * 0.3, 0.5));
    }

    // Add slight camera shake for disorientation
    if (Math.random() < 0.1) { // 10% chance per frame for subtle shake
      startCameraShake(distortionIntensity * 0.5, 0.1);
    }

    // Reduce distortion over time
    distortionDuration -= 0.016; // Approximately 60fps
    distortionIntensity *= 0.98; // Slow fade
  } else {
    // Reset to original appearance when distortion ends
    if (originalBgColor) {
      scene.background.copy(originalBgColor);
    }
    if (ambientLight) {
      ambientLight.intensity = 2.0; // Reset to original intensity
    }
    distortionIntensity = 0;
  }
}

export { onWindowResize };