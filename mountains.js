import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { scene } from './scene.js';

export let mountains = [];
const mountainSpeed = 0.6;
const maxMountains = 5;
const mountainSpacing = 150;
let mountainModel = null;

export function createMountainField() {
  const loader = new GLTFLoader();
  
  loader.load('./mountain.glb', function(gltf) {
    mountainModel = gltf.scene;
    
    mountainModel.traverse(function(child) {
      if (child.isMesh && child.material) {
        child.material.needsUpdate = true;
      }
    });
    
    for (let i = 0; i < maxMountains; i++) {
      createMountainFromCache(i * mountainSpacing - (maxMountains - 1) * mountainSpacing / 2);
    }
  }, undefined, function(error) {
    console.error('Error loading mountain model:', error);
  });
}

function createMountainFromCache(zPosition = null) {
  if (!mountainModel) {
    console.warn('Mountain model not loaded yet');
    return;
  }
  
  const mountain = mountainModel.clone();
  
  const scale = 400;
  mountain.scale.set(scale, scale, scale);
  
  mountain.position.set(
    -230,
    -115,
    zPosition !== null ? zPosition : 40
  );
  
  mountain.rotation.y = 0;
  
  mountain.traverse(function(child) {
    if (child.isMesh) {
      child.castShadow = false;
      child.receiveShadow = true;
    }
  });
  
  scene.add(mountain);
  mountains.push(mountain);
}

export function updateMountains() {
  for (let i = mountains.length - 1; i >= 0; i--) {
    const mountain = mountains[i];
    mountain.position.z += mountainSpeed;
    
    if (mountain.position.z > 500) {
      scene.remove(mountain);
      mountains.splice(i, 1);
      
      const lastMountain = mountains[mountains.length - 1];
      const newZPosition = lastMountain ? lastMountain.position.z - mountainSpacing : -mountainSpacing * 2;
      createMountainFromCache(newZPosition);
    }
  }
}