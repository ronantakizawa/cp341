import { CSS_STYLES, NOTIFICATION_MESSAGES } from './config.js';

// Track notification states
let lightningWarningShown = false;
let firstDistortionShown = false;
let firstSmogShown = false;

// Function to show non-blocking jet warning
export function showJetWarning() {
  // Import game functions dynamically to avoid circular dependencies
  import('./main.js').then(({ pauseGame, resumeGame }) => {
    // Pause the game
    pauseGame();

    // Create notification element
    const notification = document.createElement('div');
    notification.style.cssText = CSS_STYLES.notification;
    notification.textContent = NOTIFICATION_MESSAGES.jet;

    // Add to page
    document.body.appendChild(notification);

    // Auto-remove after 3 seconds and resume game
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
      resumeGame();
    }, 3000);
  });
}

// Function to show smog warning
export function showSmogWarning() {
  // Import game functions dynamically to avoid circular dependencies
  import('./main.js').then(({ pauseGame, resumeGame }) => {
    // Pause the game
    pauseGame();

    // Create notification element
    const notification = document.createElement('div');
    notification.style.cssText = CSS_STYLES.notification;
    notification.textContent = NOTIFICATION_MESSAGES.smog;

    // Add to page
    document.body.appendChild(notification);

    // Auto-remove after 3 seconds and resume game
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
      resumeGame();
    }, 3000);
  });
}

// Function to show lightning warning
export function showLightningWarning() {
  if (lightningWarningShown) return;
  lightningWarningShown = true;

  // Import game functions dynamically to avoid circular dependencies
  import('./main.js').then(({ pauseGame, resumeGame }) => {
    // Pause the game
    pauseGame();

    // Create notification element
    const notification = document.createElement('div');
    notification.style.cssText = CSS_STYLES.notification;
    notification.textContent = NOTIFICATION_MESSAGES.lightning;
    document.body.appendChild(notification);

    setTimeout(() => {
      notification.remove();
      // Resume the game after notification is removed
      resumeGame();
    }, 3500);
  });
}

// Function to show electricity effect (lightning flash)
export function showElectricityEffect() {
  // Flash the screen bright yellow and shake
  const flash = document.createElement('div');
  flash.style.cssText = CSS_STYLES.lightningFlash;
  document.body.appendChild(flash);
  setTimeout(() => {
    flash.style.opacity = '0';
    setTimeout(() => flash.remove(), 200);
  }, 120);

  // Import scene functions and trigger camera shake
  import('./scene.js').then(m => m.startCameraShake(2.5, 0.6));
}

// State management functions
export function getFirstDistortionShown() {
  return firstDistortionShown;
}

export function setFirstDistortionShown(value) {
  firstDistortionShown = value;
}

export function getFirstSmogShown() {
  return firstSmogShown;
}

export function setFirstSmogShown(value) {
  firstSmogShown = value;
}