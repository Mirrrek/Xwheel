var HID = require('node-hid');
const SerialPort = require('serialport');

const settings = {
    xSensitivity: 25,    // wheel value per 10 ms
    ySensitivity: 5     // pixels per 10 ms
}

var cache = {
    W: false,
    S: false,
    A: false,
    D: false,
    Shift: false,
    Ctrl: false,
    Space: false,
    Mx: 0,
    My: 0,
    LMB: false,
    RMB: false,
    Q: false,
    E: false,
    X: false,
    C: false
}

var data = {
    W: false,
    S: false,
    A: false,
    D: false,
    Shift: false,
    Ctrl: false,
    Space: false,
    Mx: 0,
    My: 0,
    LMB: false,
    RMB: false,
    Q: false,
    E: false,
    X: false,
    C: false
}

console.log('Searching for arduino...');

SerialPort.list().then((ports) => {
    // Find the arduino
    var arduinoDeviceInfo;
    ports.forEach((port) => {
        if (port.vendorId == 2341) {
            arduinoDeviceInfo = port;
        }
    });

    // Check if the arduino is plugged in
    if (!arduinoDeviceInfo) {
        throw new Error('Arduino not found.');
    }

    console.log('Arduino found. (' + arduinoDeviceInfo.path.toString() + ')');

    // Get the interface
    const arduinoDevice = new SerialPort(arduinoDeviceInfo.path.toString(), { baudRate: 9600 });

    console.log('Searching for wheel...');

    // Find the wheel
    const wheelDeviceInfo = HID.devices().filter((x) => x.productId == 46677)[0];

    // Check if the wheel is plugged in
    if (!wheelDeviceInfo) {
        throw new Error('Wheel not found.');
    }

    console.log('Wheel found. (' + wheelDeviceInfo.path + ')');

    // Get the interface
    const wheelDevice = new HID.HID(wheelDeviceInfo.path);

    // Listen to data
    wheelDevice.on('data', (x) => {
        data = {
            W: x[5] < 200,
            S: x[4] < 200,
            A: x[8] == 255,
            D: x[7] == 255,
            Shift: x[11] == 255,
            Ctrl: x[12] == 255,
            Space: x[13] == 255,
            Mx: x[3] - 128,
            My: floorZero((x[10] - x[9]) / 2),
            LMB: x[16] == 255,
            RMB: x[15] == 255,
            Q: x[1] == 228,
            E: x[1] == 232,
            X: x[0] == 64,
            C: x[0] == 128
        };
    });

    console.log('Ready!');

    // Update the input
    setInterval(() => {
        // Movement
        if (data.W != cache.W) {
            arduinoDevice.write(Buffer.from([data.W ? 0x01 : 0x02, 0x77]));
        }
        if (data.S != cache.S) {
            arduinoDevice.write(Buffer.from([data.S ? 0x01 : 0x02, 0x73]));
        }
        if (data.A != cache.A) {
            arduinoDevice.write(Buffer.from([data.A ? 0x01 : 0x02, 0x61]));
        }
        if (data.D != cache.D) {
            arduinoDevice.write(Buffer.from([data.D ? 0x01 : 0x02, 0x64]));
        }
        if (data.Shift != cache.Shift) {
            arduinoDevice.write(Buffer.from([data.Shift ? 0x01 : 0x02, 0x81]));
        }
        if (data.Ctrl != cache.Ctrl) {
            arduinoDevice.write(Buffer.from([data.Ctrl ? 0x01 : 0x02, 0x80]));
        }
        if (data.Space != cache.Space) {
            arduinoDevice.write(Buffer.from([data.Space ? 0x01 : 0x02, 0x20]));
        }
        if (data.Mx != 0) {
            arduinoDevice.write(Buffer.from([0x03, valueTo8bit(data.Mx, settings.xSensitivity)]));
        }
        if (data.My != 0) {
            arduinoDevice.write(Buffer.from([0x04, valueTo8bit(data.My, settings.ySensitivity)]));
        }
        // Abilities
        if (data.LMB != cache.LMB) {
            arduinoDevice.write(Buffer.from([data.LMB ? 0x05 : 0x06, 0x00]));
        }
        if (data.RMB != cache.RMB) {
            arduinoDevice.write(Buffer.from([data.RMB ? 0x05 : 0x06, 0x01]));
        }
        if (data.Q != cache.Q) {
            arduinoDevice.write(Buffer.from([data.Q ? 0x01 : 0x02, 0x71]));
        }
        if (data.E != cache.E) {
            arduinoDevice.write(Buffer.from([data.E ? 0x01 : 0x02, 0x65]));
        }
        if (data.X != cache.X) {
            arduinoDevice.write(Buffer.from([data.X ? 0x01 : 0x02, 0x78]));
        }
        if (data.C != cache.C) {
            arduinoDevice.write(Buffer.from([data.C ? 0x01 : 0x02, 0x63]));
        }

        cache = data;
    }, 10);

    function valueTo8bit(value, sensitivity) {
        const negative = value < 0;
        value = Math.abs(value);
        if (value < sensitivity) { return 0; }
        value = Math.pow(value / 128, 1.5) * 128;
        if (negative) {
            return floorZero(Math.max(Math.min(128 - (value / 100 * sensitivity) + 128, 255), 1)) || 1;
        } else {
            return floorZero(Math.max(Math.min(value / 100 * sensitivity, 127), 1)) || 1;
        }
    }
    
    function floorZero(value) {
        if (value < 0) {
            return Math.floor(value) + 1;
        } else {
            return Math.floor(value);
        }
    }
});