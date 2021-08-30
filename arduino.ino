#include "Keyboard.h"
#include "Mouse.h"

/*

    Data structure [bytes]:
        0: Type (0x00 : Reset [0x00], 0x01 : Press [ASCII code*], 0x02 : Release [ASCII code*], 0x03 : Move mouse X [Amount : Signed 8 bit int**], 0x04 : Move mouse Y [Amount : Signed 8 bit int**], 0x05 : Press mouse button [0x00 = LMB, 0x01 = RMB], 0x06 : Release mouse button [0x00 = LMB, 0x01 = RMB])
        1: Argument (Represented in square brackets)
        * A regular ASCII keycode, with additional modifiers found at https://www.arduino.cc/en/Reference/KeyboardModifiers
        ** 0x00 - 0x7f = 0 - 127, 0x80 = 0, 0x81 - 0xff = -127 - -1
        
*/

void setup()
{
    Serial.begin(9600);
    Mouse.begin();
    Keyboard.begin();
}

void loop()
{
    if (Serial.available() > 0)
    {
        char data[2] = {0x00, 0x00};
        Serial.readBytes(data, 2);

        switch (data[0])
        {
        case 0x00:
            Mouse.release(1 | 2 | 4);
            Keyboard.releaseAll();
            break;
        case 0x01:
            Keyboard.press(data[1]);
            break;
        case 0x02:
            Keyboard.release(data[1]);
            break;
        case 0x03:
            Mouse.move(data[1], 0);
            break;
        case 0x04:
            Mouse.move(0, data[1]);
            break;
        case 0x05:
            if (data[1] == 0x00) { Mouse.press(1); }
            if (data[1] == 0x01) { Mouse.press(2); }
            break;
        case 0x06:
            if (data[1] == 0x00) { Mouse.release(1); }
            if (data[1] == 0x01) { Mouse.release(2); }
            break;
        }
    }

    delay(10);
}