import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { scene } from './scene.js';

export let clouds = [];
const cloudSpeed = 0.5;
const maxClouds = 10;

export function createCloudField() {
  for (let i = 0; i < maxClouds; i++) {
    createCloud();
  }
}

function createCloud() {
  if (Math.random() < 0.1) {
    createBackgroundJet();
    return;
  }
  
  const cloudGroup = new THREE.Group();
  
  const numSpheres = Math.floor(Math.random() * 5) + 4;
  for (let i = 0; i < numSpheres; i++) {
    const sphereSize = Math.random() * 3 + 2;
    const cloudGeometry = new THREE.SphereGeometry(sphereSize, 8, 6);
    const cloudMaterial = new THREE.MeshLambertMaterial({ 
      color: 0xffffff,
      transparent: true,
      opacity: Math.random() * 0.2 + 0.8
    });
    const cloudSphere = new THREE.Mesh(cloudGeometry, cloudMaterial);
    
    cloudSphere.position.set(
      (Math.random() - 0.5) * 8,
      (Math.random() - 0.5) * 4,
      (Math.random() - 0.5) * 6
    );
    
    cloudGroup.add(cloudSphere);
  }
  
  cloudGroup.position.set(
    (Math.random() - 0.5) * 400,
    (Math.random() - 0.5) * 80 + 20,
    Math.random() * 600 - 400
  );
  
  const scale = Math.random() * 2 + 1;
  cloudGroup.scale.set(scale, scale, scale);
  
  scene.add(cloudGroup);
  clouds.push(cloudGroup);
}

function createBackgroundJet() {
  const loader = new GLTFLoader();
  
  loader.load('./jet.glb', function(gltf) {
    const backgroundJet = gltf.scene;
    
    const scale = (Math.random() * 1.5 + 0.5) * 2;
    backgroundJet.scale.set(scale, scale, scale);
    
    backgroundJet.position.set(
      (Math.random() - 0.5) * 400,
      (Math.random() - 0.5) * 80 + 20,
      Math.random() * 600 - 400
    );
    
    backgroundJet.rotation.y = - Math.PI;
    backgroundJet.rotation.x = 0;
    backgroundJet.rotation.z = 0;
    
    backgroundJet.traverse(function(child) {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
    
    scene.add(backgroundJet);
    clouds.push(backgroundJet);
  }, undefined, function(error) {
    console.error('Error loading background jet:', error);
  });
}

export function updateClouds() {
  for (let i = clouds.length - 1; i >= 0; i--) {
    const cloud = clouds[i];
    cloud.position.z += cloudSpeed;
    
    if (cloud.position.z > 50) {
      scene.remove(cloud);
      clouds.splice(i, 1);
      
      createNewCloudAhead();
    }
  }
}

function createNewCloudAhead() {
  if (Math.random() < 0.01) {
    createNewBackgroundJetAhead();
    return;
  }
  
  const cloudGroup = new THREE.Group();
  
  const numSpheres = Math.floor(Math.random() * 5) + 4;
  for (let i = 0; i < numSpheres; i++) {
    const sphereSize = Math.random() * 3 + 2;
    const cloudGeometry = new THREE.SphereGeometry(sphereSize, 8, 6);
    const cloudMaterial = new THREE.MeshLambertMaterial({ 
      color: 0xffffff,
      transparent: true,
      opacity: Math.random() * 0.2 + 0.8
    });
    const cloudSphere = new THREE.Mesh(cloudGeometry, cloudMaterial);
    
    cloudSphere.position.set(
      (Math.random() - 0.5) * 8,
      (Math.random() - 0.5) * 4,
      (Math.random() - 0.5) * 6
    );
    
    cloudGroup.add(cloudSphere);
  }
  
  cloudGroup.position.set(
    (Math.random() - 0.5) * 400,
    (Math.random() - 0.5) * 80 + 20,
    -Math.random() * 200 - 400
  );
  
  const scale = Math.random() * 2 + 1;
  cloudGroup.scale.set(scale, scale, scale);
  
  scene.add(cloudGroup);
  clouds.push(cloudGroup);
}

function createNewBackgroundJetAhead() {
  const loader = new GLTFLoader();
  
  loader.load('./jet.glb', function(gltf) {
    const backgroundJet = gltf.scene;
    
    const scale = (Math.random() * 1.5 + 0.5) * 2;
    backgroundJet.scale.set(scale, scale, scale);
    
    backgroundJet.position.set(
      (Math.random() - 0.5) * 400,
      (Math.random() - 0.5) * 80 + 20,
      -Math.random() * 200 - 400
    );
    
    backgroundJet.rotation.y = -Math.PI;
    backgroundJet.rotation.x = Math.PI ;
    backgroundJet.rotation.z = Math.PI;
    
    backgroundJet.traverse(function(child) {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
    
    scene.add(backgroundJet);
    clouds.push(backgroundJet);
  }, undefined, function(error) {
    console.error('Error loading background jet ahead:', error);
  });
}