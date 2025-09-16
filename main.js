import { initScene, renderScene } from './scene.js';
import { loadBird, updateBirdAnimation, applyGravity } from './bird.js';
import { updateClouds, startObjectSpawning, enableAudio as enableCloudsAudio } from './clouds.js';
import { createMountainField, updateMountains } from './mountains.js';
import { connectMicrobit } from './microbit.js';
import { checkHoopCollisions, checkJetCollisions, checkJetProximity, checkSmogProximity, enableAudio } from './collisions.js';
import { initVoiceRecognition, startVoiceListening } from './voice.js';

async function init() {
  initScene();
  
  loadBird();
  
  createMountainField();
  
  // Initialize voice recognition
  initVoiceRecognition();
  
  document.getElementById('startBtn').addEventListener('click', function() {
    // Enable audio on button click
    enableAudio();
    enableCloudsAudio(); // Also enable audio for thunder sounds
    connectMicrobit();

    // Start voice listening when MicroBit connects
    startVoiceListening();

    // Start spawning objects when connecting MicroBit
    setTimeout(() => {
      startObjectSpawning();
    }, 1000); // Wait 1 second after connection starts
  });
  
  animate();
}

export let isPaused = false;

// Score management
let score = 0;

export function getScore() {
  return score;
}

export function incrementScore() {
  score++;
  document.getElementById('score').textContent = `Score: ${score}`;

  // Import audio functionality from collisions.js
  import('./collisions.js').then(module => {
    if (module.isAudioEnabled && module.isAudioEnabled()) {
      const pointSound = new Audio('./score.mp3');
      pointSound.currentTime = 0;
      pointSound.play().catch(error => {
        console.log('Could not play sound:', error);
      });
    }
  });
}

// Life management
let playerLives = 3;
let gameOverState = false;
let invincibleUntil = 0;

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

export function loseLife() {
  if (gameOverState) return;
  // Add invincibility for 1.2 seconds after hit
  invincibleUntil = performance.now() + 1200;
  playerLives--;
  updateLivesDisplay();
  if (playerLives <= 0) {
    gameOverState = true;
    // Import audio functionality and play game over sound
    import('./collisions.js').then(module => {
      if (module.isAudioEnabled && module.isAudioEnabled()) {
        const gameOverSound = new Audio('./gameover.mp3');
        gameOverSound.currentTime = 0;
        gameOverSound.volume = 0.8;
        gameOverSound.play().catch(error => {
          console.log('Could not play game over sound:', error);
        });
      }
    });
    setTimeout(() => {
      alert('Game Over! Score: ' + getScore());
      window.location.reload();
    }, 100);
  }
}

export function getGameOverState() {
  return gameOverState;
}

export function getInvincibleUntil() {
  return invincibleUntil;
}

// Initialize lives display on script load
if (typeof window !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    updateLivesDisplay();
  });
}
// Also call updateLivesDisplay immediately in case DOMContentLoaded already fired
updateLivesDisplay();

// Game speed control
export let gameSpeed = 1.0; // Normal speed
const minSpeed = 0.1; // Minimum speed (half speed)
const maxSpeed = 3.0; // Maximum speed (3x speed)
const speedStep = 0.75; // How much to change speed per command

export function pauseGame() {
  isPaused = true;
}

export function resumeGame() {
  isPaused = false;
}

export function adjustGameSpeed(direction) {
  gameSpeed += direction * speedStep;

  // Clamp speed between min and max
  if (gameSpeed > maxSpeed) {
    gameSpeed = maxSpeed;
  } else if (gameSpeed < minSpeed) {
    gameSpeed = minSpeed;
  }

  // Round to 1 decimal place for cleaner display
  gameSpeed = Math.round(gameSpeed * 10) / 10;
}

export function getGameSpeed() {
  return gameSpeed;
}

function animate() {
  requestAnimationFrame(animate);

  if (!isPaused) {
    updateClouds();

    updateMountains();

    updateBirdAnimation();

    applyGravity();

    checkHoopCollisions();

    checkJetCollisions();

    checkJetProximity();

    checkSmogProximity();
  }

  renderScene();
}


init();