## cp341finalproject ##
## README – SaveTheBirds Prototype ##
## Owen - Ronan - Nate ##

Overview:
SaveTheBirds is a custom input prototype for a bird-themed game. The project explores how embodied controls (glove-mounted MicroBits) can simulate a day in the life of an endangered bird species in an engaging and socially impactful way. Inspired by the game StarFox, our game emphasizes bird conservation and migration themes, blending fun gameplay with meaningful and educational context.
At this stage in our project, the main focus is on the controller rather than the full game. The glove-mounted MicroBits provide tilt feedback through the accelerometer, radio signals to communicate with the game, and a rough visual game design will demonstrate how these inputs affect the birds movement and gameplay.

Current Features:
- Glove-Mounted Microbit
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
- Attach a MicroBit to each glove and power them with their batteries.

Connect the receiver MicroBit:
- Plug a third MicroBit into your computer via USB.
- This MicroBit listens for radio signals from the glove controllers.

Run the prototype program:
- Launch the screen mock on your computer.
- The bird icon should respond to glove tilt and flapping motions.

Test controls:
- Tilt wrists left/right = bank the bird.
- Tilt forward/backward = climb/dive.
- Flap arms = ascend.
- Glide arms down = descend.
