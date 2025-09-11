// Colorado Sky Runner with Three.js and MicroBit
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

let scene, camera, renderer, bird;
let mixer; // Animation mixer for bird
let mountains = []; // Array to hold repeating mountains
let port, reader;
let isConnected = false;
let smoothedRoll = 0;
let smoothedPitch = 0;
const smoothingFactor = 0.2; // Increased from 0.1 to 0.2 for more responsiveness while still smoothing

// Bird configuration
const birdConfig = {
  path: './bird.glb',
  cameraDistance: 50,
  brightness: 1.0,
  scale: 1.2
};

// Initialize the 3D scene
function init() {
  // Create scene
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x5483BF); // Custom blue sky background
  
  // Create cloud field
  createCloudField();
  
  // Create camera - positioned higher and much further back from the bird
  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.set(0, 8, 20);
  camera.lookAt(0, 0, 0);
  
  // Create renderer
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  document.getElementById('container').appendChild(renderer.domElement);
  
  // Add lighting
  addLighting();
  
  // Load Bird
  loadBird();
  
  // Add environment
  addEnvironment();
  
  // Handle window resize
  window.addEventListener('resize', onWindowResize, false);
  
  // Set up UI event listeners
  document.getElementById('startBtn').addEventListener('click', connectMicrobit);
  
  // Start render loop
  animate();
}

let ambientLight, directionalLight;

function addLighting() {
  // Much brighter ambient light for better overall scene visibility
  ambientLight = new THREE.AmbientLight(0x808080, 2.0);  // Increased brightness significantly
  scene.add(ambientLight);
  
  // Much brighter directional light
  directionalLight = new THREE.DirectionalLight(0xffffff, 2.5);  // Increased from 1.5 to 2.5
  directionalLight.position.set(50, 50, 25);
  directionalLight.castShadow = true;
  directionalLight.shadow.mapSize.width = 2048;
  directionalLight.shadow.mapSize.height = 2048;
  scene.add(directionalLight);
}

function loadBird() {
  const config = birdConfig;
  const loader = new GLTFLoader();
  
  // Remove existing  if present
  
  // Stop existing animation mixer
  if (mixer) {
    mixer.stopAllAction();
    mixer = null;
  }
  
  // Adjust camera distance based on jet type
  camera.position.z = config.cameraDistance;
  
  // Adjust lighting brightness based on jet typ
  
  loader.load(config.path, function(gltf) {
    bird = gltf.scene;
    
    // Scale and position the jet based on config
    const scale = config.scale || 2.0;
    bird.scale.set(scale, scale, scale);
    
    // Position the bird
    bird.position.set(-45, -25, 0); // Move bird left to center it
    bird.rotation.y = Math.PI / 2;
    
    // Enable shadows
    bird.traverse(function(child) {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
    
    // Setup animation for bird
    if (gltf.animations && gltf.animations.length > 0) {
      mixer = new THREE.AnimationMixer(bird);
      
      // Play all animations at 0.5x speed
      gltf.animations.forEach((clip) => {
        const action = mixer.clipAction(clip);
        action.setEffectiveTimeScale(0.5); // Slow down to 0.5x speed
        action.play();
      });
      
      console.log(`Bird animations loaded: ${gltf.animations.length} animations`);
    }
    
    scene.add(bird);
    console.log('Bird loaded successfully');
  }, undefined, function(error) {
    console.error('Error loading bird model:', error);
    // Create a simple placeholder if model fails to load
  });
}

// Cloud field system
let clouds = [];
const cloudSpeed = 0.5;  // Faster movement for better flying effect
const maxClouds = 10;

// Mountain system
const mountainSpeed = 0.5; // Same speed as clouds
const maxMountains = 5; // Reduced for better performance
const mountainSpacing = 150; // Reduced spacing so mountains touch
let mountainModel = null; // Cache the loaded model

function createCloudField() {
  // Create initial clouds
  for (let i = 0; i < maxClouds; i++) {
    createCloud();
  }
}

function createCloud() {
  // 1/100 chance to create a jet instead of a cloud
  if (Math.random() < 0.1) {
    createBackgroundJet();
    return;
  }
  
  // Create a cloud using multiple spheres for a fluffy appearance
  const cloudGroup = new THREE.Group();
  
  // Create 4-8 spheres for each cloud to make it fluffy
  const numSpheres = Math.floor(Math.random() * 5) + 4;
  for (let i = 0; i < numSpheres; i++) {
    const sphereSize = Math.random() * 3 + 2; // Cloud spheres between 2-5 units
    const cloudGeometry = new THREE.SphereGeometry(sphereSize, 8, 6);
    const cloudMaterial = new THREE.MeshLambertMaterial({ 
      color: 0xffffff,
      transparent: true,
      opacity: Math.random() * 0.2 + 0.8 // Whiter, more opaque clouds (0.8-1.0)
    });
    const cloudSphere = new THREE.Mesh(cloudGeometry, cloudMaterial);
    
    // Position spheres close together to form a cloud
    cloudSphere.position.set(
      (Math.random() - 0.5) * 8, // Cluster spheres together
      (Math.random() - 0.5) * 4,
      (Math.random() - 0.5) * 6
    );
    
    cloudGroup.add(cloudSphere);
  }
  
  // Position cloud groups randomly around the scene
  cloudGroup.position.set(
    (Math.random() - 0.5) * 400, // Spread wide horizontally
    (Math.random() - 0.5) * 200 + 50, // Higher in the sky (50-150 units up)
    Math.random() * 600 - 400    // From far behind to ahead
  );
  
  // Random cloud size variation
  const scale = Math.random() * 2 + 1;  // Cloud scale 1-3
  cloudGroup.scale.set(scale, scale, scale);
  
  scene.add(cloudGroup);
  clouds.push(cloudGroup);
}

function createBackgroundJet() {
  const loader = new GLTFLoader();
  
  loader.load('./jet.glb', function(gltf) {
    const backgroundJet = gltf.scene;
    
    // Scale the background jet - 2x bigger
    const scale = (Math.random() * 1.5 + 0.5) * 2; // Random scale 1.0-4.0 (2x bigger)
    backgroundJet.scale.set(scale, scale, scale);
    
    // Position randomly in the sky
    backgroundJet.position.set(
      (Math.random() - 0.5) * 400, // Spread wide horizontally
      (Math.random() - 0.5) * 200 + 50, // Higher in the sky
      Math.random() * 600 - 400    // From far behind to ahead
    );
    
    // Always face forward
    backgroundJet.rotation.y = - Math.PI; // Face forward (same as main jet)
    backgroundJet.rotation.x = 0;
    backgroundJet.rotation.z = 0;
    
    // Enable shadows
    backgroundJet.traverse(function(child) {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
    
    scene.add(backgroundJet);
    clouds.push(backgroundJet); // Add to clouds array so it moves with the same system
  }, undefined, function(error) {
    console.error('Error loading background jet:', error);
  });
}

function updateClouds() {
  // Move clouds towards camera (jet flying forward effect)
  for (let i = clouds.length - 1; i >= 0; i--) {
    const cloud = clouds[i];
    cloud.position.z += cloudSpeed;
    
    // Remove clouds that have passed the camera
    if (cloud.position.z > 50) {
      scene.remove(cloud);
      clouds.splice(i, 1);
      
      // Create a new cloud far ahead
      createNewCloudAhead();
    }
  }
}

function createNewCloudAhead() {
  // 1/100 chance to create a jet instead of a cloud
  if (Math.random() < 0.01) {
    createNewBackgroundJetAhead();
    return;
  }
  
  // Create a cloud using multiple spheres for a fluffy appearance
  const cloudGroup = new THREE.Group();
  
  // Create 4-8 spheres for each cloud to make it fluffy
  const numSpheres = Math.floor(Math.random() * 5) + 4;
  for (let i = 0; i < numSpheres; i++) {
    const sphereSize = Math.random() * 3 + 2; // Cloud spheres between 2-5 units
    const cloudGeometry = new THREE.SphereGeometry(sphereSize, 8, 6);
    const cloudMaterial = new THREE.MeshLambertMaterial({ 
      color: 0xffffff,
      transparent: true,
      opacity: Math.random() * 0.2 + 0.8 // Whiter, more opaque clouds (0.8-1.0)
    });
    const cloudSphere = new THREE.Mesh(cloudGeometry, cloudMaterial);
    
    // Position spheres close together to form a cloud
    cloudSphere.position.set(
      (Math.random() - 0.5) * 8, // Cluster spheres together
      (Math.random() - 0.5) * 4,
      (Math.random() - 0.5) * 6
    );
    
    cloudGroup.add(cloudSphere);
  }
  
  // Position new clouds far ahead
  cloudGroup.position.set(
    (Math.random() - 0.5) * 400,
    (Math.random() - 0.5) * 200 + 50, // Higher in the sky
    -Math.random() * 200 - 400  // Far ahead of jet
  );
  
  const scale = Math.random() * 2 + 1;  // Cloud scale 1-3
  cloudGroup.scale.set(scale, scale, scale);
  
  scene.add(cloudGroup);
  clouds.push(cloudGroup);
}

function createNewBackgroundJetAhead() {
  const loader = new GLTFLoader();
  
  loader.load('./jet.glb', function(gltf) {
    const backgroundJet = gltf.scene;
    
    // Scale the background jet - 2x bigger
    const scale = (Math.random() * 1.5 + 0.5) * 2; // Random scale 1.0-4.0 (2x bigger)
    backgroundJet.scale.set(scale, scale, scale);
    
    // Position new jets far ahead
    backgroundJet.position.set(
      (Math.random() - 0.5) * 400,
      (Math.random() - 0.5) * 200 + 50, // Higher in the sky
      -Math.random() * 200 - 400  // Far ahead of jet
    );
    
    // Always face forward
    backgroundJet.rotation.y = -Math.PI; // Face forward (same as main jet)
    backgroundJet.rotation.x = Math.PI ;
    backgroundJet.rotation.z = Math.PI;
    
    // Enable shadows
    backgroundJet.traverse(function(child) {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
    
    scene.add(backgroundJet);
    clouds.push(backgroundJet); // Add to clouds array so it moves with the same system
  }, undefined, function(error) {
    console.error('Error loading background jet ahead:', error);
    // If jet fails to load, create a cloud instead
  });
}

function addEnvironment() {
  // Initialize mountain field
  createMountainField();
}

function createMountainField() {
  // Load the mountain model once and cache it
  const loader = new GLTFLoader();
  
  loader.load('./mountain.glb', function(gltf) {
    mountainModel = gltf.scene;
    
    // Preserve original materials and textures
    mountainModel.traverse(function(child) {
      if (child.isMesh && child.material) {
        child.material.needsUpdate = true;
      }
    });
    
    // Create initial mountains in a line using the cached model
    for (let i = 0; i < maxMountains; i++) {
      createMountainFromCache(i * mountainSpacing - (maxMountains - 1) * mountainSpacing / 2);
    }
    
    console.log('Mountain model loaded successfully');
  }, undefined, function(error) {
    console.error('Error loading mountain model:', error);
  });
}

function createMountainFromCache(zPosition = null) {
  if (!mountainModel) {
    console.warn('Mountain model not loaded yet');
    return;
  }
  
  const mountain = mountainModel.clone(); // Clone the cached model
  
  // Scale the mountains - same as before
  const scale = 400;
  mountain.scale.set(scale, scale, scale);
  
  // Position mountains in a line touching each other
  mountain.position.set(
    -230, // Same X position as before
    -115, // Lowered by 15 units (from -100 to -115)
    zPosition !== null ? zPosition : 40 // Use provided Z position or default
  );
  
  mountain.rotation.y = 0; // No rotation needed
  
  // Enable shadows
  mountain.traverse(function(child) {
    if (child.isMesh) {
      child.castShadow = false; // Mountains don't cast shadows (performance)
      child.receiveShadow = true; // But they can receive shadows
    }
  });
  
  scene.add(mountain);
  mountains.push(mountain);
}

function updateMountains() {
  // Move mountains towards camera (flying forward effect)
  for (let i = mountains.length - 1; i >= 0; i--) {
    const mountain = mountains[i];
    mountain.position.z += mountainSpeed;
    
    // Remove mountains that have passed the camera
    if (mountain.position.z > 500) {
      scene.remove(mountain);
      mountains.splice(i, 1);
      
      // Create a new mountain far ahead to maintain continuous line
      const lastMountain = mountains[mountains.length - 1];
      const newZPosition = lastMountain ? lastMountain.position.z - mountainSpacing : -mountainSpacing * 2;
      createMountainFromCache(newZPosition);
    }
  }
}


async function connectMicrobit() {
  try {
    port = await navigator.serial.requestPort();
    await port.open({ 
      baudRate: 115200,
      bufferSize: 64
    });
    
    const textDecoder = new TextDecoderStream();
    const readableStreamClosed = port.readable.pipeTo(textDecoder.writable);
    reader = textDecoder.readable.getReader();
    
    isConnected = true;
    updateStatus('Connected to MicroBit!');
    document.getElementById('startBtn').textContent = 'Disconnect';
    document.getElementById('startBtn').onclick = disconnectMicrobit;
    
    // Hide the logo when connected
    document.getElementById('logo').style.display = 'none';
    
    readSerialData();
    
  } catch (error) {
    console.error('Connection failed:', error);
    updateStatus('Connection failed');
  }
}

function disconnectMicrobit() {
  if (reader) {
    reader.releaseLock();
  }
  if (port) {
    port.close();
  }
  isConnected = false;
  updateStatus('Disconnected');
  document.getElementById('startBtn').textContent = 'Connect MicroBit';
  document.getElementById('startBtn').onclick = connectMicrobit;
  
  // Show the logo when disconnected
  document.getElementById('logo').style.display = 'block';
}

async function readSerialData() {
  try {
    while (isConnected) {
      const { value, done } = await reader.read();
      if (done) break;
      
      // Process angle data
      const lines = value.split('\n');
      for (const line of lines) {
        const trimmedLine = line.trim();
        if (trimmedLine && trimmedLine.includes(',')) {
          parseAngleData(trimmedLine);
        }
      }
    }
  } catch (error) {
    console.error('Reading error:', error);
    isConnected = false;
    updateStatus('Connection lost');
    
    // Show the logo when connection is lost
    document.getElementById('logo').style.display = 'block';
  }
}

function parseAngleData(dataString) {
  try {
    const parts = dataString.split(',');
    if (parts.length === 2) {
      const roll = parseFloat(parts[0]);
      const pitch = parseFloat(parts[1]);
      
      if (!isNaN(roll) && !isNaN(pitch)) {
        // Apply exponential smoothing to reduce erratic movements
        smoothedRoll = smoothedRoll + smoothingFactor * (roll - smoothedRoll);
        smoothedPitch = smoothedPitch + smoothingFactor * (pitch - smoothedPitch);
        
        // Log both raw and smoothed values
        console.log(`Raw: Roll: ${roll.toFixed(1)}°, Pitch: ${pitch.toFixed(1)}° | Smoothed: Roll: ${smoothedRoll.toFixed(1)}°, Pitch: ${smoothedPitch.toFixed(1)}°`);
        
        updateBirdRotation(smoothedRoll, smoothedPitch);
      }
    }
  } catch (error) {
    console.log('Parse error:', error);
  }
}

function updateBirdRotation(roll, pitch) {
  if (bird) {
    // For bird: use accelerometer to control position instead of rotation
    // Roll input (left/right tilt) controls X-axis position (left/right movement)
    // Pitch input (forward/back tilt) controls Z-axis position (forward/back movement)
    
    const rollSensitivity = 2.0; // Adjust sensitivity for X movement
    const pitchSensitivity = 2.0; // Adjust sensitivity for Z movement
    
    // Update bird position based on accelerometer input
    bird.position.x = roll * rollSensitivity - 45; // Roll controls left/right position (offset by -45)
    bird.position.z = -pitch * pitchSensitivity; // Pitch controls forward/back position (reversed)
    bird.position.y = -25; // Keep Y position fixed
    
    // Keep bird facing the same direction
    bird.rotation.y = Math.PI / 2; // Maintain base rotation
    bird.rotation.x = 0; // No rotation
    bird.rotation.z = 0; // No rotation
  }
}

function updateStatus(message) {
  document.getElementById('status').textContent = `Status: ${message}`;
}


function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
  requestAnimationFrame(animate);
  
  // Update cloud positions for flying effect
  updateClouds();
  
  // Update mountain positions for flying effect
  updateMountains();
  
  // Update animation mixer for bird animations
  if (mixer) {
    mixer.update(0.016); // Update with ~60fps delta time
  }
  
  // Keep camera stationary behind the Bird
  // Camera stays fixed watching the Bird perform maneuvers
  camera.lookAt(0, 0, 0);
  
  renderer.render(scene, camera);
}

// Start the application
init();
