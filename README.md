## Colorado Sky Runner ##
## Owen - Ronan - Nate ##

<img width="1500" height="814" alt="Screenshot 2025-09-15 at 11 23 00 AM" src="https://github.com/user-attachments/assets/48486455-3b3f-4f6a-9dc7-d87a7867fc4d" />


## Install Instrcutions
- Clone Repo
- Install all assets in assets.txt
- Run server.py

Overview:
SaveTheBirds is a custom input prototype for a bird-themed game. The project explores how embodied controls (glove-mounted Micro:bits) can simulate a day in the life of an endangered bird species in an engaging and socially impactful way. Inspired by the game StarFox, our game emphasizes bird conservation and migration themes, blending fun gameplay with meaningful and educational context.
At this stage in our project, the main focus is on the controller rather than the full game. The glove-mounted Micro:bits provide tilt feedback through the accelerometer, radio signals to communicate with the game, and a rough visual game design will demonstrate how these inputs affect the birds movement and gameplay.

Current Features:
- Glove-Mounted Micro:bit
- Wrist tilt controls banking left/right.
- Forward/backward tilt maps to climbing/diving.
- Flapping motion with arms  = flap / ascend.
- Arms down/gliding motion = dive / descend.

Basic Screen Mock:
- Displays a bird icon that responds to tilt and visual input. Moving through 3D space avoids obstacles etc…

Planned Features:
- Vision-based input (using webcam + AI recognition)
- Detects the flapping gestures, facial expressions, or posture to trigger special actions.

Setup (Prototype Stage):

Wear the glove controllers:
- Attach a Micro:bit to each glove and power them with their batteries.

Connect the receiver Micro:bit\:
- Plug a third Micro:bit into your computer via USB.
- This Micro:bit listens for radio signals from the glove controllers.

Run the prototype program:
- Launch the screen mock on your computer.
- The bird icon should respond to glove tilt and flapping motions.

Test controls:
- Tilt wrists left/right = bank the bird.
- Tilt forward/backward = climb/dive.
- Flap arms = ascend.
- Glide arms down = descend.
