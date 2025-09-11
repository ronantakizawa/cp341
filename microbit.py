# Fighter Jet Controller using MicroBit Accelerometer
# Sends roll and pitch angles for controlling a 3D fighter jet

from microbit import *
import math

# Smoothing variables for accelerometer readings
smooth_x = 0
smooth_y = 0
smooth_z = 0
smoothing_factor = 0.3  # Higher = more responsive, lower = more stable

while True:
    # Read raw accelerometer values (in milli-g, -1000 to 1000)
    raw_x = accelerometer.get_x()  # Roll (left/right tilt)
    raw_y = accelerometer.get_y()  # Pitch (forward/backward tilt)
    raw_z = accelerometer.get_z()  # Up/down
    
    # Apply exponential smoothing to reduce noise
    smooth_x = smooth_x + smoothing_factor * (raw_x - smooth_x)
    smooth_y = smooth_y + smoothing_factor * (raw_y - smooth_y)
    smooth_z = smooth_z + smoothing_factor * (raw_z - smooth_z)
    
    # Use smoothed values for angle calculations
    x = int(smooth_x)
    y = int(smooth_y)
    z = int(smooth_z)
    
    # Calculate roll angle (rotation around x-axis) in degrees
    # When tilting left, x becomes negative, when tilting right, x becomes positive
    roll = math.atan2(x, math.sqrt(y*y + z*z)) * 180 / math.pi
    
    # Calculate pitch angle (rotation around y-axis) in degrees  
    # When tilting forward, y becomes positive, when tilting back, y becomes negative
    pitch = math.atan2(-y, math.sqrt(x*x + z*z)) * 180 / math.pi
    
    # Send angles as comma-separated values: roll,pitch
    # Roll: negative = left tilt, positive = right tilt
    # Pitch: negative = backward tilt, positive = forward tilt
    print("{:.1f},{:.1f}".format(roll, pitch))
    
    sleep(50)  # 20 times per second for smooth control