# Xwheel
A bridge for steering wheel controllers. Acts like a regular mouse/keyboard.  
The code is written for the Thrustmaster Red Legend Edition, but it shouldn't be too hard to rewrite it for other steering wheels.
# Running it
The main part happens on the host computer, in Node.js. Make sure you have Node.js installed, and inside the source directory, run `npm i node-hid serialport`.
That should install the required dependencies, so once it's done, you should be good to go.  
For the Arduino code, just upload `arduino.ino` to your board. Since not all Arduinos can emulate HID input devices,
you'll need a 32u4 or SAMD based Arduino (Leonardo, Esplora, Zero, Due and MKR Family). I'm using the Pro Micro.  
If you are using the Arduino IDE, you might need to move the `arduino.ino` file to a directory called `arduino`,
since the IDE requires a project folder name to be the same as the project file name.  
As far as hardware goes, you don't need anything, at this point you can just plug the Arduino into your comuter and run the Node.js script with `node main.js` and any movement on the steering wheel should be transmitted to the Arduino, where it will be returned as a mouse/keyboard input.
# Why the Arduino
This was targeted to play VALORANT on a steering wheel, and since their anti-cheat blocks any input from the steering wheel itself,
as well as any virtual input devices, there literally must be a device that emits the scancodes.  
The Arduino uses the serial interface to receive commands from the computer,
and then resends them back as a mouse/keyboard device.
