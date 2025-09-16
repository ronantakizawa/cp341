import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { scene } from './scene.js';
import { getBirdPosition } from './bird.js';
import { isConnected } from './microbit.js';
import { getGameSpeed } from './main.js';
import { getScore, gameOver } from './collisions.js';

export let clouds = [];
export let smogClouds = [];
export let thunderClouds = [];
const cloudSpeed = 1.5;
const maxClouds = 20;

// Lightning bolt system
let lightningModel = null;
const activeLightningBolts = [];
const LIGHTNING_SPEED = 14; // much faster
const LIGHTNING_LIFETIME = 1.2; // shorter lifetime
const LIGHTNING_COOLDOWN = 1.5; // min seconds between bolts per cloud

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

let lightningWarningShown = false;
let playerLives = 3;
let gameOverState = false;
let invincibleUntil = 0;

// Enable audio function
export function enableAudio() {
  console.log('Enabling audio in clouds.js');
  audioEnabled = true;
}

// Timed spawn system
let lastCloudSpawn = performance.now();
let lastSmogSpawn = performance.now();
let lastThunderSpawn = performance.now();
const CLOUD_SPAWN_INTERVAL = 1200; // ms
const SMOG_SPAWN_INTERVAL = 2600; // ms
const THUNDER_SPAWN_INTERVAL = 4000; // ms

function showElectricityEffect() {
  // Flash the screen bright yellow and shake
  const flash = document.createElement('div');
  flash.style.cssText = `
    position: fixed;
    top: 0; left: 0; width: 100vw; height: 100vh;
    background: rgba(255,255,0,0.85);
    z-index: 2000;
    pointer-events: none;
    transition: opacity 0.2s;`;
  document.body.appendChild(flash);
  setTimeout(() => {
    flash.style.opacity = '0';
    setTimeout(() => flash.remove(), 200);
  }, 120);
  import('./scene.js').then(m => m.startCameraShake(2.5, 0.6));
}

function showLightningWarning() {
  if (lightningWarningShown) return;
  lightningWarningShown = true;

  // Pause the game
  import('./main.js').then(m => m.pauseGame());

  // Create notification element
  const notification = document.createElement('div');
  notification.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: rgba(255, 68, 68, 0.95);
    color: white;
    padding: 40px;
    border-radius: 15px;
    font-size: 24px;
    font-weight: bold;
    text-align: center;
    z-index: 1000;
    max-width: 600px;
    min-width: 500px;
    box-shadow: 0 8px 40px rgba(0,0,0,0.7);
    line-height: 1.4;
  `;
  notification.textContent =
    'Extreme weather events, made worse by climate change, can disorient and endanger birds.\n\nLightning, hail, and storms are a growing threat to bird migration and survival.';
  document.body.appendChild(notification);
  setTimeout(() => {
    notification.remove();
    // Resume the game after notification is removed
    import('./main.js').then(m => m.resumeGame());
  }, 3500);
}

function updateLivesDisplay() {
  let livesDiv = document.getElementById('lives');
  if (!livesDiv) {
    livesDiv = document.createElement('div');
    livesDiv.id = 'lives';
    livesDiv.style.position = 'absolute';
    livesDiv.style.top = '20px';
    livesDiv.style.left = '50%';
    livesDiv.style.transform = 'translateX(-50%)';
    livesDiv.style.zIndex = '200';
    livesDiv.style.fontSize = '48px';
    livesDiv.style.color = 'red';
    livesDiv.style.fontWeight = 'bold';
    document.body.appendChild(livesDiv);
  }
  livesDiv.innerHTML = '❤'.repeat(playerLives) + '♡'.repeat(3 - playerLives);
}

// Initialize lives display on script load
if (typeof window !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    updateLivesDisplay();
  });
}
// Also call updateLivesDisplay immediately in case DOMContentLoaded already fired
updateLivesDisplay();

export function loseLife() {
  if (gameOverState) return;
  // Add invincibility for 1.2 seconds after hit
  invincibleUntil = performance.now() + 1200;
  playerLives--;
  updateLivesDisplay();
  if (playerLives <= 0) {
    gameOverState = true;
    // Use the new game over screen from collisions.js
    gameOver();
  }
}

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
    if (birdPos && !gameOverState) {
      const now = performance.now();
      const thunderWorldPos = new THREE.Vector3();
      thunder.getWorldPosition(thunderWorldPos);
      const dist = thunderWorldPos.distanceTo(birdPos);

      // Warning range - show notification when near (larger radius)
      const warningRadius = 25 * thunder.scale.x;
      if (dist < warningRadius) {
        showLightningWarning();
      }

      // Collision range - lightning strike when very close (smaller radius)
      const lightningRadius = 11 * thunder.scale.x;
      if (now > invincibleUntil && dist < lightningRadius) {
        showElectricityEffect();
        // Play thunder sound
        console.log('Thunder collision detected! audioEnabled:', audioEnabled);
        if (audioEnabled) {
          console.log('Playing thunder sound...');
          thunderSound.currentTime = 0;
          thunderSound.volume = 0.7;
          thunderSound.play().then(() => {
            console.log('Thunder sound played successfully');
          }).catch(error => {
            console.log('Could not play thunder sound:', error);
          });
        } else {
          console.log('Audio not enabled - thunder sound not played');
        }
        loseLife();
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
    if (now - lastThunderSpawn > THUNDER_SPAWN_INTERVAL) {
      createNewThunderCloudAhead();
      lastThunderSpawn = now;
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

  // Reduce smog cloud spawn rate to make game easier
  if (Math.random() < 0.08) {
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
      Math.random() * 20 + 5, // Lower max height for better visibility (5 to 25)
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

  // Position thunder clouds at bird's current height
  const birdPos = getBirdPosition && getBirdPosition();
  const playerZ = birdPos ? birdPos.z : 0;
  const playerY = birdPos ? birdPos.y : (Math.random() * 40 - 30);
  thunderGroup.position.set(
    (Math.random() - 0.5) * 350,
    playerY + (Math.random() - 0.5) * 10, // Centered on bird, with some random offset
    playerZ - 120 - Math.random() * 80 // 120-200 units behind player
  );

  const scale = Math.random() * 1.5 + 1.2;
  thunderGroup.scale.set(scale, scale, scale);

  scene.add(thunderGroup);
  thunderClouds.push(thunderGroup);
}