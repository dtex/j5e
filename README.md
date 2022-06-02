![Node.js CI](https://github.com/dtex/j5e/workflows/Node.js%20CI/badge.svg)
## J5e
<img width="40%" align="right" alt="A robot poking its head out from inside washing machine" style="margin:0 0 35px 35px;" src="https://raw.githubusercontent.com/dtex/j5e/main/build/docs/img/J5-embedded-666x666.png" />

Control LED's, Servos, Switches, and more with J5e. It runs onboard microcontrollers like the ESP8266. Your code is 100% JavaScript. It does not require node.js, a host server or an SBC to host the app.

J5e is a device framework built upon [ECMA-419](https://www.ecma-international.org/publications-and-standards/standards/ecma-419/), the Embedded Systems API Specification for ECMAScript. ECMA-419 provides a standard interface for accessing underlying hardware interfaces (GPIO). J5e's API is based on the [Johnny-Five](https://github.com/rwaldron.johnny-five) API which has been battle tested over quite some time. 

Currently, the only provider that conforms to ECMA-419 is [Moddable's IO module for XS](https://github.com/Moddable-OpenSource/moddable/blob/public/documentation/io/io.md) which runs on the ESP32 and ESP8266. Hopefully, we will see more soon. 

**J5e in action**
````js
import LED from "j5e/led";

const led = await new LED(14);
led.blink();
````

New users should check out the [Getting Started](https://j5e.dev/getting-started/installation/) guide.

Full documentation can be found at [j5e.dev](https://j5e.dev).

Interested in contributing? Check out [CONTRIBUTING.md](https://github.com/dtex/J5e/blob/master/CONTRIBUTING.md) in this repo.

The documentation repo for J5e can be found on [github](https://github.com/dtex/j5e-docs).

