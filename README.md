## Colorado Sky Runner ##
## Owen - Ronan - Nate ##


https://github.com/user-attachments/assets/79ed0ab1-7282-4611-81a1-29e9baa05728


## Overview ##

Colorado Sky Runner is an educational 3D flying game where you control a bird navigating the skies of Colorado Rockies! The game highlights real-world environmental and social justice challenges faced by birds, such as air pollution, wildfires, habitat loss, and climate change. Players use a BBC Micro:Bit-BirdController (and voice controls) to steer, avoid obstacles, and learn about conservation issues through interactive gameplay.

---

### Features ##

- **3D Flight Simulation:** Fly a bird through a dynamically generated Colorado Rockies landscape using Three.js.
- **Micro:Bit Integration:** Control the bird’s movement with a real Micro:Bit accelerometer and touch sensors
- **AI Voice Commands:** Adjust game speed/difficulty using your voice.
- **Environmental Hazards:** Encounter smog, thunderclouds, jets, and more — each representing real threats to birds.
- **Educational Messaging:** Game over screens and in-game messages inform and teach about Colorado’s environmental challenges -- links to conservation resources and donations.
- **Sound Effects:** Audio feedback for scoring, hazards, and game events.
- **Replayability:** Randomized obstacles, scalable difficulty, and restart buttton.

---

## Setup Instructions ##

#### 1. **Requirements**

- **Flask** (for running a local server)
- **Python 3** (for Micro:Bit serial communication)
- **BBC Micro:Bit** (for motion controls)
- **Bird Controller** (for moving the bird up and down/gliding) 
- **Modern Web Browser** (Chrome recommended for Web Speech API support)

---

#### 2. **Assets Needed**

Place these files in the `/cp341` directory:
- coloradoskyrunner.html (main HTML file)
- main.js, scene.js, bird.js, clouds.js, mountains.js, collisions.js, microbit.js, voice.js, environments.js
- microbit.py (for Micro:Bit, flashed to the device)
- `/assets/` folder containing:
  - bird.glb (3D bird model)
  - mountain.glb (3D mountain model)
  - thunder.mp3, gameover.mp3, score.mp3, jet.mp3 (audio files)
  - logo.png (game logo)
  - Any other 3D models or audio referenced in the code
 
---

#### 3. **Running the Game**

**Using Flask (Recommended for Local Development)**
- Install Flask (if you haven’t already) in your project folder:
-     python3 -m venv venv
-     source venv/bin/activate
-     pip install Flask
- Run the server:
-     python3 server.py
- Open your browser and go to:
-     http://localhost:5001

---

### How to Play ##

- **Start the Game:** Click "Connect MicroBit" to begin -- connect your MicroBit
- **Controls:**
  - **Bird Controller/MicroBit:** Tilt to steer, and connect/tap the birds wings together to flap/up/glide.
  - **Voice:** Say "faster" or "slower", to change the birds speeds/game difficulty
- **Objective:** Fly as far as possible, avoid obstacles, and collect points.
- **Obstacles:** Smog clouds, thunderclouds, jets, and mountains.
- **Game Over:** Colliding with hazards ends the game and displays an environmental message with links to bird conservation resources.
- **Replay:** Click "Play Again" on the game over screen.

---

### Social Justice & Environmental Education ##

Colorado Sky Runner is designed to raise awareness about:
- Air pollution and its impact on birds and wildlife
- Wildfires and habitat destruction to birds
- Climate change and migration disruption
- The importance of conservation efforts

---

### Troubleshooting ##

- **Speech Recognition Not Working:** Use Chrome and allow microphone access.
- **Micro:Bit Not Connecting:** Ensure drivers are installed and use a supported browser.
- **Missing Assets:** Check the `/assets/` folder for all required files.
