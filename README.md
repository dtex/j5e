<img width="45%" align="right" alt="A robot poking its head out from inside washing machine" src="https://github.com/dtex/j5e/raw/master/build/docs/img/J5-embedded-666x666.png" />

Control LED's, Servos, Switches, and more with J5e. It runs onboard microcontrollers like the ESP8266. Your code is 100% JavaScript. It does not require node.js, a host server or an SBC to host the app.

J5e is a device framework built upon [ECMA TC-53's](https://www.ecma-international.org/memento/tc53.htm) I/O class pattern. The [I/O class pattern](https://gist.github.com/phoddie/166c9c17b2f31d0beda9f2410a219268) is a standard interface for accessing underlying hardware interfaces (GPIO). J5e's API is based on the [Johnny-Five](https://github.com/rwaldron.johnny-five) API which has been battle tested over quite some time. 

Currently, the only provider that matches the ECMA TC-53 I/O class pattern is [Moddable's IO module for XS](https://github.com/Moddable-OpenSource/moddable/blob/public/documentation/io/io.md) which runs on the ESP8266. Hopefully, we will see more soon. 

*TC-53's emerging standard is still in flux so know there is some risk of changes in the future, but hopefully those changes will be abstracted away by J5e.*

**J5e in action**
````js
import LED from "j5e/led";

const led = await new LED(14);
led.blink();
````

New users should check out the [Getting Started](tutorial-A-GETSTARTED.html) guide.

Interested in contributing? Check out [contributing.md](https://github.com/dtex/J5e/blob/master/contributing.md) in the repo.
