import { CSS_STYLES, NOTIFICATION_MESSAGES } from './config.js';

// Track notification states
let lightningWarningShown = false;
let firstDistortionShown = false;
let firstSmogShown = false;

// Function to show non-blocking jet warning
export function showJetWarning() {
  // Import game functions dynamically to avoid circular dependencies
  import('./state.js').then(({ pauseGame, resumeGame }) => {
    // Pause the game
    pauseGame();

    // Create notification element
    const notification = document.createElement('div');
    notification.style.cssText = CSS_STYLES.notification;
    notification.textContent = NOTIFICATION_MESSAGES.jet;

    // Add to page
    document.body.appendChild(notification);

    // Auto-remove after 5 seconds and resume game
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
      resumeGame();
    }, 5000);
  });
}

// Function to show smog warning
export function showSmogWarning() {
  // Import game functions dynamically to avoid circular dependencies
  import('./state.js').then(({ pauseGame, resumeGame }) => {
    // Pause the game
    pauseGame();

    // Create notification element
    const notification = document.createElement('div');
    notification.style.cssText = CSS_STYLES.notification;
    notification.textContent = NOTIFICATION_MESSAGES.smog;

    // Add to page
    document.body.appendChild(notification);

    // Auto-remove after 5 seconds and resume game
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
      resumeGame();
    }, 5000);
  });
}

// Function to show lightning warning
export function showLightningWarning() {
  if (lightningWarningShown) return;
  lightningWarningShown = true;

  // Import game functions dynamically to avoid circular dependencies
  import('./state.js').then(({ pauseGame, resumeGame }) => {
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
    }, 6000);
  });
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