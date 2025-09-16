import { getBirdPosition } from './bird.js';
import { clouds, smogClouds, thunderClouds } from './clouds.js';
import { scene } from './scene.js';
import { isConnected } from './microbit.js';
import { startCameraShake, startVisualDistortionEffect } from './scene.js';
import { pauseGame, resumeGame, incrementScore, getScore, loseLife } from './main.js';
import { showJetWarning, showSmogWarning, getFirstDistortionShown, setFirstDistortionShown, getFirstSmogShown, setFirstSmogShown } from './notifications.js';

let audioEnabled = false;
import * as THREE from 'three';


// Create audio objects
const pointSound = new Audio('./score.mp3');
const gameOverSound = new Audio('./gameover.mp3');
const jetSound = new Audio('./jet.mp3');



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
    }).catch(() => {
      console.log('Audio still blocked');
    });
  }
}

export function isAudioEnabled() {
  return audioEnabled;
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

function gameOver() {
  // Play game over sound if audio is enabled
  if (audioEnabled) {
    gameOverSound.currentTime = 0;
    gameOverSound.play().catch(error => {
      console.log('Could not play game over sound:', error);
    });
  }
  
  // Show game over message
  alert('Game Over! Score: ' + getScore());
  
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

      // Apply visual distortion and show smog warning (no jet sound)
      startSmogDistortionEffect(intensity);
    }
  }
}



// Apply visual distortion and audio effects for jets
function startVisualDistortion(intensity) {
  // Show notification on first distortion
  if (!getFirstDistortionShown()) {
    showJetWarning();
    setFirstDistortionShown(true);
  }

  // Apply visual distortion effects
  startVisualDistortionEffect(intensity, 5.0); // 3 second duration

  // Play audio effects
  if (audioEnabled && intensity > 0.5) { // Only play if significant interference
    jetSound.currentTime = 0;
    jetSound.volume = Math.min(intensity / 2, 0.3); // Scale volume with intensity, max 0.3
    jetSound.play().catch(error => {
      console.log('Could not play jet sound:', error);
    });
  }
}

// Apply visual distortion effects for smog (no jet sound)
function startSmogDistortionEffect(intensity) {
  // Show notification on first smog encounter
  if (!getFirstSmogShown()) {
    showSmogWarning();
    setFirstSmogShown(true);
  }

  // Apply visual distortion effects only (no sound)
  startVisualDistortionEffect(intensity, 2.0); // 3 second duration
}

