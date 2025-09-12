import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { scene, camera } from './scene.js';

export let bird;
export let mixer;

const birdConfig = {
  path: './bird.glb',
  cameraDistance: 50,
  brightness: 1.0,
  scale: 1.2
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
    
    bird.position.set(-45, -25, 0);
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
    bird.position.y = -25;
    
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