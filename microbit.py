from microbit import *
import math

# Enable pull-up so pin0 is HIGH until foil touches GND
pin0.set_pull(pin0.PULL_UP)

# Smoothing variables for accelerometer readings
smooth_x = 0
smooth_y = 0
smooth_z = 0
smoothing_factor = 0.3  # Higher = more responsive, lower = more stable

while True:
    # --------- Accelerometer readings ---------
    raw_x = accelerometer.get_x()  # Roll
    raw_y = accelerometer.get_y()  # Pitch
    raw_z = accelerometer.get_z()  # Up/down

    # Exponential smoothing to reduce noise
    smooth_x = smooth_x + smoothing_factor * (raw_x - smooth_x)
    smooth_y = smooth_y + smoothing_factor * (raw_y - smooth_y)
    smooth_z = smooth_z + smoothing_factor * (raw_z - smooth_z)

    x = int(smooth_x)
    y = int(smooth_y)
    z = int(smooth_z)

    # Calculate roll and pitch in degrees
    roll = math.degrees(math.atan2(x, math.sqrt(y*y + z*z)))
    pitch = math.degrees(math.atan2(-y, math.sqrt(x*x + z*z)))

    # 0 when touching, 1 when not
    touch = 1 if pin0.read_digital() == 0 else 0


    print("{:.1f},{:.1f},{}".format(roll, pitch, touch))

    sleep(50)  # 20 Hz update
