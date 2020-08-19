![Node.js CI](https://github.com/dtex/j5e/workflows/Node.js%20CI/badge.svg)
## J5e
<img width="40%" align="right" alt="A robot poking its head out from inside washing machine" style="margin:0 0 35px 35px;" src="https://github.com/dtex/j5e/raw/main/build/docs/img/J5-embedded-666x666.png" />

Control LED's, Servos, Switches, and more with J5e. It runs onboard microcontrollers like the ESP8266. Your code is 100% JavaScript. It does not require node.js, a host server or an SBC to host the app.

J5e is a device framework built upon [ECMA TC-53's](https://www.ecma-international.org/memento/tc53.htm) IO class pattern. The [IO class pattern](https://gist.github.com/phoddie/166c9c17b2f31d0beda9f2410a219268) is a standard interface for accessing underlying hardware interfaces (GPIO). J5e's API is based on the [Johnny-Five](https://github.com/rwaldron.johnny-five) API which has been battle tested over quite some time. 

Currently, the only provider that matches the ECMA TC-53 I/O class pattern is [Moddable's IO module for XS](https://github.com/Moddable-OpenSource/moddable/blob/public/documentation/io/io.md) which runs on the ESP8266. Hopefully, we will see more soon. 

*TC-53's emerging standard is still in flux so know there is some risk of changes in the future, but hopefully those changes will be abstracted away by J5e.*

**J5e in action**
````js
import LED from "j5e/led";

const led = await new LED(14);
led.blink();
````

New users should check out the [Getting Started](https://dtex.github.io/j5e/tutorial-A-GETSTARTED.html) guide.

Interested in contributing? Check out [CONTRIBUTING.md](https://github.com/dtex/J5e/blob/master/CONTRIBUTING.md) in the repo.

### J5e Modules
<table style="border: none;" width="100%">
  <tr>
    <td width="50%">
      <ul>
        <li><a href="https://dtex.github.io/j5e/module-j5e_animation.html">Animation</a></li>
        <li><a href="https://dtex.github.io/j5e/module-j5e_button.html">Button</a></li>
        <li><a href="https://dtex.github.io/j5e/module-j5e_easing.html">Easing</a></li>
        <li><a href="https://dtex.github.io/j5e/module-j5e_fn.html">FN (Utility Functions)</a></li>
        <li><a href="https://dtex.github.io/j5e/module-j5e_led.html">LED</a></li>
        <li><a href="https://dtex.github.io/j5e/module-j5e_light.html">Light (Photoresistors)</a></li>
      </ul>
    </td>
    <td width="50%">
      <ul>
        <li><a href="https://dtex.github.io/j5e/module-j5e_relay.html">Relay</a></li>
        <li><a href="https://dtex.github.io/j5e/module-j5e_rgb.html">RGB LED</a></li>
        <li><a href="https://dtex.github.io/j5e/module-j5e_sensor.html">Sensor</a></li>
        <li><a href="https://dtex.github.io/j5e/module-j5e_servo.html">Servo</a></li>
        <li><a href="https://dtex.github.io/j5e/module-j5e_switch.html">Switch</a></li>
        <li><a href="https://dtex.github.io/j5e/module-j5e_thermometer.html">Thermometer</a></li>
      </ul>
    </td>
  </tr>
</table>
