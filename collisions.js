import { getBirdPosition } from './bird.js';
import { clouds, smogClouds } from './clouds.js';
import { scene } from './scene.js';
import { isConnected } from './microbit.js';
import { startCameraShake, startVisualDistortionEffect } from './scene.js';
import { pauseGame, resumeGame } from './main.js';
import { loseLife } from './clouds.js';

let score = 0;
let audioEnabled = false;
let firstDistortionShown = false;
let firstSmogShown = false;
import * as THREE from 'three';


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

// Function to show non-blocking jet warning
function showJetWarning() {
  // Pause the game
  pauseGame();

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
  notification.textContent = 'Jets can distract the flight of birds, causing them to lose balance, temperament, and sight';

  // Add to page
  document.body.appendChild(notification);

  // Auto-remove after 3 seconds and resume game
  setTimeout(() => {
    if (notification.parentNode) {
      notification.parentNode.removeChild(notification);
    }
    resumeGame();
  }, 3000);
}

// Function to show smog warning
function showSmogWarning() {
  // Pause the game
  pauseGame();

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
  notification.textContent = 'Smog and human air pollution can affect bird\'s breathing and vision';

  // Add to page
  document.body.appendChild(notification);

  // Auto-remove after 3 seconds and resume game
  setTimeout(() => {
    if (notification.parentNode) {
      notification.parentNode.removeChild(notification);
    }
    resumeGame();
  }, 3000);
}

// Handle smog effects
function startSmogDistortion(intensity) {
  // Show notification on first smog encounter
  if (!firstSmogShown) {
    showSmogWarning();
    firstSmogShown = true;
  }

  // Apply visual distortion (reuse existing system)
  if (audioEnabled && intensity > 0.4) {
    // Use existing visual distortion system but don't show jet notification
    const originalFirstDistortionShown = firstDistortionShown;
    firstDistortionShown = true; // Temporarily prevent jet notification
    startVisualDistortion(intensity);
    firstDistortionShown = originalFirstDistortionShown; // Restore original state
  }
}

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
        console.log('Bird hit a jet!');
        loseLife();
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
  alert('Game Over! You lost all your lives.\n\nFinal Score: ' + score);
  
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

export function checkSmogProximity() {
  // Only run proximity detection if MicroBit is connected
  if (!isConnected) return;

  const birdPos = getBirdPosition();
  if (!birdPos) return;

  let closestSmogDistance = Infinity;

  for (let i = 0; i < smogClouds.length; i++) {
    const smog = smogClouds[i];

    // Check if this is a smog cloud
    if (smog.userData && smog.userData.isSmog) {
      const distance = birdPos.distanceTo(smog.position);

      if (distance < closestSmogDistance) {
        closestSmogDistance = distance;
      }
    }
  }

  // Apply effects when near smog
  if (closestSmogDistance < 80) { // Within smog interference range
    // Calculate effect intensity based on distance
    const maxSmogDistance = 80;
    const minSmogDistance = 20;

    if (closestSmogDistance > minSmogDistance) {
      // Scale intensity: closer smog = more intense effects
      const distanceRatio = (maxSmogDistance - closestSmogDistance) / (maxSmogDistance - minSmogDistance);
      const intensity = Math.max(0.3, distanceRatio); // Minimum intensity of 0.3

      // Apply visual distortion and show smog warning
      startSmogDistortion(intensity);
    }
  }
}

// Apply visual distortion and audio effects
function startVisualDistortion(intensity) {
  // Show notification on first distortion
  if (!firstDistortionShown) {
    showJetWarning();
    firstDistortionShown = true;
  }

  // Apply visual distortion effects
  startVisualDistortionEffect(intensity, 3.0); // 3 second duration

  // Play audio effects
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