import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { scene, camera } from './scene.js';
import { getGameSpeed } from './main.js';

export let bird;
export let mixer;

// Height control system
const minHeight = -25; // Above mountains (mountains are around -115)
const maxHeight = 25;  // Reduced max height
let currentHeight = -25; // Default height
const heightStep = 20; // How much to increase each press

// Gravity system
const gravity = 0.05; // How fast the bird falls per frame (much weaker)
let targetHeight = minHeight; // Target height bird is falling towards

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

    bird.position.set(-30, -20, -15);
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
    const rollSensitivity = 3.2; // slightly reduced for narrower field
    const pitchSensitivity = 2.0;
    const baseXOffset = -40; // recenter after narrowing lanes
    const maxHorizontal = 220; 
    const minZ = -120; // Minimum Z position (closer to camera)
    const maxZ = 0; // Maximum Z position (further from camera)

    let targetX = roll * rollSensitivity + baseXOffset;
    if (targetX > maxHorizontal) targetX = maxHorizontal;
    if (targetX < -maxHorizontal) targetX = -maxHorizontal;
    bird.position.x = targetX;

    let targetZ = -pitch * pitchSensitivity;
    if (targetZ > maxZ) targetZ = maxZ;
    if (targetZ < minZ) targetZ = minZ;
    bird.position.z = targetZ;

    bird.position.y = currentHeight; // Use current height instead of fixed -25

    bird.rotation.y = Math.PI / 2;
    bird.rotation.x = 0;
    bird.rotation.z = 0;
  }
}

export function updateBirdAnimation() {
  if (mixer) {
    mixer.update(0.016 * getGameSpeed());
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

  // Don't update bird position directly - let gravity system handle it
  // The gravity system will smoothly move towards currentHeight
}

export function applyGravity() {
  // Always pull the bird down towards minimum height
  if (currentHeight > minHeight) {
    currentHeight -= gravity * getGameSpeed();

    // Don't go below minimum height
    if (currentHeight < minHeight) {
      currentHeight = minHeight;
    }
  }

  // Update bird position if bird exists
  if (bird) {
    bird.position.y = currentHeight;
  }
}


export function getBirdPosition() {
  return bird ? bird.position : null;
}