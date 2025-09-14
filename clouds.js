import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { scene } from './scene.js';
import { isConnected } from './microbit.js';

export let clouds = [];
export let smogClouds = [];
const cloudSpeed = 1.5;
const maxClouds = 20;

// Start spawning objects when MicroBit connects
export function startObjectSpawning() {
  console.log('Starting object spawning, isConnected:', isConnected);
  // Create initial objects ahead when game starts
  for (let i = 0; i < 3; i++) {
    createNewGoldenHoopAhead(); // Force create hoops
  }
  if (Math.random() < 0.3) { // 30% chance to spawn a jet initially
    createNewBackgroundJetAhead();
  }
  // Spawn some initial smog clouds
  for (let i = 0; i < 2; i++) {
    if (Math.random() < 0.4) {
      createNewSmogCloudAhead();
    }
  }
  console.log('Objects spawned, clouds array length:', clouds.length);
}




export function updateClouds() {
  // Update regular clouds
  for (let i = clouds.length - 1; i >= 0; i--) {
    const cloud = clouds[i];
    cloud.position.z += cloudSpeed;

    if (cloud.position.z > 50) {
      scene.remove(cloud);
      clouds.splice(i, 1);

      createNewCloudAhead();
    }
  }

  // Update smog clouds
  for (let i = smogClouds.length - 1; i >= 0; i--) {
    const smog = smogClouds[i];
    smog.position.z += cloudSpeed;

    if (smog.position.z > 50) {
      scene.remove(smog);
      smogClouds.splice(i, 1);

      // Occasionally spawn new smog clouds
      if (Math.random() < 0.3) {
        createNewSmogCloudAhead();
      }
    }
  }
  
  // Ensure minimum number of objects are always spawning ahead
  if (isConnected && clouds.length < 5) {
    console.log('Spawning more objects, current count:', clouds.length);
    for (let i = clouds.length; i < 5; i++) {
      if (Math.random() < 0.9) {
        createNewGoldenHoopAhead();
      } else {
        createNewBackgroundJetAhead();
      }
    }
  }
}

function createNewCloudAhead() {
  // Only create objects if MicroBit is connected
  if (!isConnected) {
    console.log('Not creating object - MicroBit not connected');
    return;
  }
  
  console.log('Creating new object ahead');
  
  if (Math.random() < 0.15) {
    createNewGoldenHoopAhead();
    return;
  }

  if (Math.random() < 0.1) {
    createNewBackgroundJetAhead();
    return;
  }

  if (Math.random() < 0.2) {
    createNewSmogCloudAhead();
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
    Math.random() * 75 - 25,
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
      (Math.random() - 0.5) * 100, // Narrower X range for middle of screen
      Math.random() * 30 + 5, // Narrower Y range targeting middle (5 to 35)
      -Math.random() * 200 - 400
    );
    
    backgroundJet.rotation.y = -Math.PI;
    backgroundJet.rotation.x = Math.PI ;
    backgroundJet.rotation.z = Math.PI;
    
    // Mark as jet for collision detection
    backgroundJet.userData.isJet = true;
    
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


function createNewGoldenHoopAhead() {
  // Create a golden hoop using torus geometry
  const hoopGeometry = new THREE.TorusGeometry(16, 3, 8, 16);
  const hoopMaterial = new THREE.MeshPhongMaterial({ 
    color: 0xFFD700, // Golden color
    shininess: 100,
    specular: 0x444444
  });
  const hoop = new THREE.Mesh(hoopGeometry, hoopMaterial);
  
  // Mark as hoop for collision detection
  hoop.userData.isHoop = true;
  hoop.userData.collected = false;
  
  // Position new hoops far ahead
  hoop.position.set(
    (Math.random() - 0.5) * 200,
    Math.random() * 75 - 25,
    -Math.random() * 200 - 200  // Far ahead
  );
  
  // Random rotation for variety
  hoop.rotation.x = 0;
  hoop.rotation.y = 0;
  hoop.rotation.z = 0;
  
  scene.add(hoop);
  clouds.push(hoop); // Add to clouds array for movement
}

function createNewSmogCloudAhead() {
  const smogGroup = new THREE.Group();

  // Create a darker, denser cloud structure
  const numSpheres = Math.floor(Math.random() * 8) + 6;
  for (let i = 0; i < numSpheres; i++) {
    const sphereSize = Math.random() * 4 + 3;
    const smogGeometry = new THREE.SphereGeometry(sphereSize, 8, 6);
    const smogMaterial = new THREE.MeshLambertMaterial({
      color: 0x404040, // Dark gray
      transparent: true,
      opacity: Math.random() * 0.3 + 0.6 // More opaque than regular clouds
    });
    const smogSphere = new THREE.Mesh(smogGeometry, smogMaterial);

    smogSphere.position.set(
      (Math.random() - 0.5) * 12,
      (Math.random() - 0.5) * 6,
      (Math.random() - 0.5) * 8
    );

    smogGroup.add(smogSphere);
  }

  // Mark as smog for detection
  smogGroup.userData.isSmog = true;

  // Position smog clouds at lower altitudes (more likely near ground pollution)
  smogGroup.position.set(
    (Math.random() - 0.5) * 350,
    Math.random() * 40 - 30, // Lower altitude range
    -Math.random() * 200 - 300
  );

  const scale = Math.random() * 1.5 + 1.2;
  smogGroup.scale.set(scale, scale, scale);

  scene.add(smogGroup);
  smogClouds.push(smogGroup);
}