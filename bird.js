import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { scene, camera } from './scene.js';

export let bird;
export let mixer;

// Height control system
const minHeight = -25; // Above mountains (mountains are around -115)
const maxHeight = 50;  // High in the sky
let currentHeight = -25; // Default height
const heightStep = 10; // How much to increase each press

const birdConfig = {
  path: './bird.glb',
  cameraDistance: 50,
  brightness: 1.0,
  scale: 0.8
};

export function loadBird() {
  const config = birdConfig;
  const loader = new GLTFLoader();
  
  if (mixer) {
    mixer.stopAllAction();
    mixer = null;
  }
  
  camera.position.z = config.cameraDistance;
  
  loader.load(config.path, function(gltf) {
    bird = gltf.scene;
    
    const scale = config.scale || 2.0;
    bird.scale.set(scale, scale, scale);
    
    bird.position.set(-30, -20, 0);
    bird.rotation.y = Math.PI / 2;
    
    bird.traverse(function(child) {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
    
    if (gltf.animations && gltf.animations.length > 0) {
      mixer = new THREE.AnimationMixer(bird);
      
      gltf.animations.forEach((clip) => {
        const action = mixer.clipAction(clip);
        action.setEffectiveTimeScale(0.5);
        action.play();
      });
    }
    
    scene.add(bird);
  }, undefined, function(error) {
    console.error('Error loading bird model:', error);
  });
}

export function updateBirdRotation(roll, pitch) {
  if (bird) {
    const rollSensitivity = 2.0;
    const pitchSensitivity = 2.0;
    
    bird.position.x = roll * rollSensitivity - 45;
    bird.position.z = -pitch * pitchSensitivity;
    bird.position.y = currentHeight; // Use current height instead of fixed -25
    
    bird.rotation.y = Math.PI / 2;
    bird.rotation.x = 0;
    bird.rotation.z = 0;
  }
}

export function updateBirdAnimation() {
  if (mixer) {
    mixer.update(0.016);
  }
}

export function adjustHeight(direction) {
  currentHeight += direction * heightStep;
  
  // Clamp height between min and max
  if (currentHeight > maxHeight) {
    currentHeight = maxHeight;
  } else if (currentHeight < minHeight) {
    currentHeight = minHeight;
  }
  
  // Update bird position immediately if bird exists
  if (bird) {
    bird.position.y = currentHeight;
  }
}

export function getBirdPosition() {
  return bird ? bird.position : null;
}