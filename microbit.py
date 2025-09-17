from microbit import *

# Enable pull-up so pin0 is HIGH until foil touches GND
pin0.set_pull(pin0.PULL_UP)

while True:
    # --------- Accelerometer readings ---------
    raw_x = accelerometer.get_x()
    raw_y = accelerometer.get_y()
    raw_z = accelerometer.get_z()

    # --------- Foil touch sensor ---------
    if pin0.read_digital() == 1:
        touch = 1
        display.show(Image.HAPPY)   # show smiley when touching
    else:
        touch = 0
        display.clear()              # clear screen when not touching

    # --------- Output combined data ---------
    # Format: x,y,z,touch (raw unsmoothed values)
    print("{},{},{},{}".format(raw_x, raw_y, raw_z, touch))

    sleep(50)
