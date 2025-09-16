import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { scene } from './scene.js';
import { getBirdPosition } from './bird.js';
import { isConnected } from './microbit.js';
import { getGameSpeed, getScore, getGameOverState } from './state.js';
import { showLightningWarning } from './notifications.js';

export let clouds = [];
export let smogClouds = [];
export let thunderClouds = [];
const cloudSpeed = 1.5;

// Lightning bolt system
let lightningModel = null;

// Thunder sound system
const thunderSound = new Audio('./thunder.mp3');
thunderSound.addEventListener('error', function(e) {
  console.warn('Thunder audio file not found or not supported:', e);
});

// Game over sound system
const gameOverSound = new Audio('./gameover.mp3');
gameOverSound.addEventListener('error', function(e) {
  console.warn('Game over audio file not found or not supported:', e);
});

let audioEnabled = false;

// Preload lightning.glb once
const lightningLoader = new GLTFLoader();
lightningLoader.load('./lightning.glb', function(gltf) {
  lightningModel = gltf.scene;
}, undefined, function(error) {
  console.error('Error loading lightning.glb:', error);
});

// Start spawning objects when MicroBit connects
export function startObjectSpawning() {
  console.log('Starting object spawning, isConnected:', isConnected);
  // Create a few initial objects ahead when game starts
  for (let i = 0; i < 3; i++) {
    createNewGoldenHoopAhead();
  }
  if (Math.random() < 0.3) {
    createNewBackgroundJetAhead();
  }
  for (let i = 0; i < 2; i++) {
    createNewSmogCloudAhead();
  }
  // Spawn some initial thunder clouds
  for (let i = 0; i < 1; i++) {
    if (Math.random() < 0.3) {
      createNewThunderCloudAhead();
    }
  }
  lastCloudSpawn = performance.now();
  lastSmogSpawn = performance.now();
  console.log('Objects spawned, clouds array length:', clouds.length);
}


// Enable audio function
export function enableAudio() {
  console.log('Enabling audio in clouds.js');
  audioEnabled = true;
}

// Timed spawn system
let lastCloudSpawn = performance.now();
let lastSmogSpawn = performance.now();
const CLOUD_SPAWN_INTERVAL = 1200; // ms
const SMOG_SPAWN_INTERVAL = 2600; // ms



// Patch collision in updateClouds
export function updateClouds() {
  // Update regular clouds
  for (let i = clouds.length - 1; i >= 0; i--) {
    const cloud = clouds[i];
    cloud.position.z += cloudSpeed * getGameSpeed();

    if (cloud.position.z > 50) {
      scene.remove(cloud);
      clouds.splice(i, 1);
    }
  }

  // Update smog clouds (dark grey, visual distortion only)
  for (let i = smogClouds.length - 1; i >= 0; i--) {
    const smog = smogClouds[i];
    smog.position.z += cloudSpeed * getGameSpeed();
    if (smog.position.z > 50) {
      scene.remove(smog);
      smogClouds.splice(i, 1);
    }
  }

  // Update thunder clouds (black, lightning strikes)
  for (let i = thunderClouds.length - 1; i >= 0; i--) {
    const thunder = thunderClouds[i];
    thunder.position.z += cloudSpeed * getGameSpeed();
    // Proximity and collision detection for thunder clouds
    const birdPos = getBirdPosition && getBirdPosition();
    if (birdPos && !getGameOverState()) {
      const now = performance.now();
      const thunderWorldPos = new THREE.Vector3();
      thunder.getWorldPosition(thunderWorldPos);
      const dist = thunderWorldPos.distanceTo(birdPos);

      // Warning range - show notification when near (larger radius)
      const warningRadius = 25 * thunder.scale.x;
      if (dist < warningRadius) {
        showLightningWarning();
      }

    }
    if (thunder.position.z > 50) {
      scene.remove(thunder);
      thunderClouds.splice(i, 1);
    }
  }
  // Timed spawning for clouds, smog clouds, and thunder clouds
  const now = performance.now();
  if (isConnected) {
    if (now - lastCloudSpawn > CLOUD_SPAWN_INTERVAL) {
      createNewCloudAhead();
      lastCloudSpawn = now;
    }
    if (now - lastSmogSpawn > SMOG_SPAWN_INTERVAL) {
      createNewSmogCloudAhead();
      lastSmogSpawn = now;
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
  
  if (Math.random() < 0.45) {
    createNewGoldenHoopAhead();
    return;
  }

  if (Math.random() < 0.25) {
    createNewBackgroundJetAhead();
    return;
  }

  // Reduce smog cloud spawn rate to make game easier
  if (Math.random() < 0.08) {
    createNewSmogCloudAhead();
    return;
  }

  // Thunder clouds - increased probability
  if (Math.random() < 0.10) {
    createNewThunderCloudAhead();
    return;
  }

  // Default: create regular cloud
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
      Math.random() * 20 - 5, // Lower min height for better visibility (-5 to 15)
      -Math.random() * 200 - 400
    );
    
    backgroundJet.rotation.y = -Math.PI;
    backgroundJet.rotation.x = Math.PI ;
    backgroundJet.rotation.z = Math.PI;
    
    // Mark as jet for collision detection
    backgroundJet.userData.isJet = true;
    // Mark as NOT a cloud for sound logic
    backgroundJet.userData.isCloud = false;
    
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
      color: 0x808080, // Lighter grey (more visible, less threatening)
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


  // Mark as smog for detection (no lightning bolt)
  smogGroup.userData.isSmog = true;

  // Position smog clouds at bird's current height
  const birdPos = getBirdPosition && getBirdPosition();
  const playerZ = birdPos ? birdPos.z : 0;
  const playerY = birdPos ? birdPos.y : (Math.random() * 40 - 30);
  smogGroup.position.set(
    (Math.random() - 0.5) * 350,
    playerY + (Math.random() - 0.5) * 10, // Centered on bird, with some random offset
    playerZ - 120 - Math.random() * 80 // 120-200 units behind player
  );

  const scale = Math.random() * 1.5 + 1.2;
  smogGroup.scale.set(scale, scale, scale);

  scene.add(smogGroup);
  smogClouds.push(smogGroup);
}

function createNewThunderCloudAhead() {
  const thunderGroup = new THREE.Group();

  // Create a darker, denser cloud structure (black)
  const numSpheres = Math.floor(Math.random() * 8) + 6;
  for (let i = 0; i < numSpheres; i++) {
    const sphereSize = Math.random() * 4 + 3;
    const thunderGeometry = new THREE.SphereGeometry(sphereSize, 8, 6);
    const thunderMaterial = new THREE.MeshLambertMaterial({
      color: 0x101010, // Even darker - very close to black
      transparent: true,
      opacity: Math.random() * 0.3 + 0.7 // More opaque than smog clouds
    });
    const thunderSphere = new THREE.Mesh(thunderGeometry, thunderMaterial);

    thunderSphere.position.set(
      (Math.random() - 0.5) * 12,
      (Math.random() - 0.5) * 6,
      (Math.random() - 0.5) * 8
    );

    thunderGroup.add(thunderSphere);
  }

  // Attach a lightning bolt as a child (if loaded) - only bottom half
  thunderGroup.userData.isThunder = true;
  if (lightningModel) {
    const bolt = lightningModel.clone();
    bolt.position.set(0, -12, 0); // Move down further to show only bottom portion
    bolt.scale.setScalar(4 + Math.random() * 2);
    bolt.userData.isLightning = true;
    thunderGroup.add(bolt);
    thunderGroup.userData.bolt = bolt;
  }

  // Position thunder clouds far ahead like other objects
  thunderGroup.position.set(
    (Math.random() - 0.5) * 200,
    Math.random() * 75 - 25,
    -Math.random() * 200 - 200  // Far ahead
  );

  const scale = Math.random() * 1.5 + 1.2;
  thunderGroup.scale.set(scale, scale, scale);

  scene.add(thunderGroup);
  thunderClouds.push(thunderGroup);
}