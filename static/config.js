// Configuration file for CSS styles and notification text

export const CSS_STYLES = {
  // Notification styles for warnings and alerts
  notification: `
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
  `,
  
  //button to close about pop up
  xButton:`
    position: absolute;
    top: 10px;
    right: 10px;
    background: rgba(255, 68, 68, 0.95);
    color: white;
    border-radius: 7px;
    font-size: 12px;
    font-weight: bold;
    text-align: center;
    z-index: 1000;
    width: 25px;
    height: 25px;
    box-shadow: 0 8px 40px rgba(0,0,0,0.7);
    line-height: 1.4;
    `,
  
  // Lightning flash effect
  lightningFlash: `
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: rgba(255,255,0,0.85);
    z-index: 2000;
    pointer-events: none;
    transition: opacity 0.2s;
  `,

  // Jet collision flash effect
  jetFlash: `
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: rgba(255,0,0,0.85);
    z-index: 2000;
    pointer-events: none;
    transition: opacity 0.2s;
  `,

  // Game over screen styling
  gameOverScreen: `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: rgba(220, 53, 69, 0.95);
    color: white;
    padding: 40px;
    border-radius: 15px;
    font-size: 18px;
    font-weight: bold;
    text-align: center;
    z-index: 1000;
    max-width: 600px;
    min-width: 500px;
    box-shadow: 0 8px 40px rgba(0,0,0,0.7);
    line-height: 1.6;
  `,

  // Restart button styling
  restartButton: `
    background: #4caf50;
    color: white;
    border: none;
    padding: 15px 30px;
    font-size: 18px;
    font-weight: bold;
    border-radius: 8px;
    cursor: pointer;
    margin-right: 15px;
  `,

  // Learn more button styling
  learnMoreButton: `
    background: #2196f3;
    color: white;
    border: none;
    padding: 15px 30px;
    font-size: 18px;
    font-weight: bold;
    border-radius: 8px;
    cursor: pointer;
  `
};

export const NOTIFICATION_MESSAGES = {
  lightning: 'Extreme weather events, made worse by climate change, can disorient and endanger birds.\n\nLightning, hail, and storms are a growing threat to bird migration and survival.',
  jet: 'Jets can distract the flight of birds, causing them to lose balance, temperament, and sight',
  smog: 'Smog and human air pollution can affect bird\'s breathing and vision',
  about: 'Did you know that the bird population in the United States has declined by nearly 3 billion since 1970? That\'s a loss of about 29% of all birds! Habitat loss, climate change, and pollution are major factors. This game aims to raise awareness about the importance of protecting America\'s birds by showing the harmful conditions endured by birds every day'
};

export const GAME_OVER_CONTENT = `
  <div style="font-size: 32px; margin-bottom: 20px; color: #ffebee;">
    🕊️ GAME OVER 🕊️
  </div>

  <div style="font-size: 24px; margin-bottom: 20px; color: #ffcdd2;">
    Final Score: {SCORE}
  </div>

  <div style="font-size: 16px; margin-bottom: 25px; line-height: 1.8;">
    <strong>Environmental Reality:</strong><br>
    Colorado's birds face real challenges daily:<br>
    • Air pollution from cities and wildfires<br>
    • Habitat loss from rapid development<br>
    • Climate change & urbanization disrupting migration patterns<br>
    • Light pollution confusing nocturnal birds
  </div>

  <div style="margin-bottom: 25px;">
    <strong>Make a difference for Colorado's birds:</strong><br>
    <a href="https://www.birdconservancy.org/donate/" target="_blank"
       style="color: #81c784; text-decoration: underline; font-size: 16px;">
      Donate to Bird Conservancy of the Rockies →
    </a>
  </div>

  <button id="restartGame">
    🔄 Play Again
  </button>

  <button id="learnMore">
    🌱 Learn More
  </button>
`;