import { getBirdPosition } from './bird.js';
import { clouds } from './clouds.js';
import { scene } from './scene.js';
import { isConnected } from './microbit.js';
import { startCameraShake } from './scene.js';

let score = 0;
let audioEnabled = false;
let firstDistortionShown = false;

// Create audio objects
const pointSound = new Audio('./score.mp3');
const gameOverSound = new Audio('./gameover.mp3');
const jetSound = new Audio('./jet.mp3');

// Set up audio error handling
pointSound.addEventListener('error', function(e) {
  console.warn('Score audio file not found or not supported:', e);
});

gameOverSound.addEventListener('error', function(e) {
  console.warn('Game over audio file not found or not supported:', e);
});

jetSound.addEventListener('error', function(e) {
  console.warn('Jet audio file not found or not supported:', e);
});

// Preload the audio
pointSound.preload = 'auto';
gameOverSound.preload = 'auto';
jetSound.preload = 'auto';

// Enable audio after first user interaction
export function enableAudio() {
  if (!audioEnabled) {
    // Try to play and immediately pause to unlock audio context
    pointSound.play().then(() => {
      pointSound.pause();
      pointSound.currentTime = 0;
      audioEnabled = true;
      console.log('Audio enabled');
    }).catch(() => {
      console.log('Audio still blocked');
    });
  }
}

export function checkHoopCollisions() {
  // Only run collision detection if MicroBit is connected
  if (!isConnected) return;
  
  const birdPos = getBirdPosition();
  if (!birdPos) return;
  
  for (let i = 0; i < clouds.length; i++) {
    const object = clouds[i];
    
    // Check if this is a hoop and hasn't been collected yet
    if (object.userData && object.userData.isHoop && !object.userData.collected) {
      const distance = birdPos.distanceTo(object.position);
      
      // If bird is close enough to hoop center (flying through it)
      if (distance < 50) {
        object.userData.collected = true;
        
        // Log the hoop hit
        console.log('Bird hit a hoop! Score:', score + 1);
        
        // Make hoop disappear completely and play sound
        scene.remove(object);
        clouds.splice(i, 1);
        i--; // Adjust index since we removed an element
        
        incrementScore();
      }
    }
  }
}

export function checkJetCollisions() {
  // Only run collision detection if MicroBit is connected
  if (!isConnected) return;
  
  const birdPos = getBirdPosition();
  if (!birdPos) return;
  
  for (let i = 0; i < clouds.length; i++) {
    const object = clouds[i];
    
    // Check if this is a jet and hasn't been hit yet
    if (object.userData && object.userData.isJet && !object.userData.hitByBird) {
      const distance = birdPos.distanceTo(object.position);
      
      // If bird is too close to jet
      if (distance < 25) {
        object.userData.hitByBird = true;
        
        // Log the jet hit
        console.log('Bird hit a jet! Game Over!');
        
        gameOver();
      }
    }
  }
}

function incrementScore() {
  score++;
  document.getElementById('score').textContent = `Score: ${score}`;
  
  // Play point sound only if audio is enabled
  if (audioEnabled) {
    pointSound.currentTime = 0; // Reset to start in case it's already playing
    pointSound.play().catch(error => {
      console.log('Could not play sound:', error);
    });
  }
}

function gameOver() {
  // Play game over sound if audio is enabled
  if (audioEnabled) {
    gameOverSound.currentTime = 0;
    gameOverSound.play().catch(error => {
      console.log('Could not play game over sound:', error);
    });
  }
  
  // Show game over message
  alert('Game Over! You hit a plane!\n\nFinal Score: ' + score);
  
  // Reload the page after a short delay to let the sound play
  setTimeout(() => {
    window.location.reload();
  }, 500);
}

export function checkJetProximity() {
  // Only run proximity detection if MicroBit is connected
  if (!isConnected) return;
  
  const birdPos = getBirdPosition();
  if (!birdPos) return;
  
  let closestJetDistance = Infinity;
  
  for (let i = 0; i < clouds.length; i++) {
    const object = clouds[i];
    
    // Check if this is a jet (not a hoop)
    if (object.userData && object.userData.isJet) {
      const distance = birdPos.distanceTo(object.position);
      
      if (distance < closestJetDistance) {
        closestJetDistance = distance;
      }
    }
  }
  
  // Apply camera shake based on proximity to jets
  if (closestJetDistance < 100) { // Within interference range
    // Calculate shake intensity based on distance (closer = more shake)
    const maxShakeDistance = 100;
    const minShakeDistance = 20;
    
    if (closestJetDistance > minShakeDistance) {
      // Scale intensity: closer jets = more intense shake
      const distanceRatio = (maxShakeDistance - closestJetDistance) / (maxShakeDistance - minShakeDistance);
      const intensity = distanceRatio * 2; // Max intensity of 2
      const duration = 0.1; // Short bursts of shake
      
      startCameraShake(intensity, duration);
      
      // Play jet interference sound
      startVisualDistortion(intensity);
    }
  }
}

// Play jet interference sound (reusing function name for compatibility)
function startVisualDistortion(intensity) {
  // Show alert on first distortion
  if (!firstDistortionShown) {
    alert('Jets can distract the flight of birds, causing them to lose balance, temperament, and sight');
    firstDistortionShown = true;
  }
  
  if (audioEnabled && intensity > 0.5) { // Only play if significant interference
    jetSound.currentTime = 0;
    jetSound.volume = Math.min(intensity / 2, 0.3); // Scale volume with intensity, max 0.3
    jetSound.play().catch(error => {
      console.log('Could not play jet sound:', error);
    });
  }
}

export function getScore() {
  return score;
}