J5e device instantiation allows for a few different patterns. On one hand we want to allow the simplest possible use case where the only parameter we need is the pin number, and on the other hand we need to be able to support complex io and device instantiations whose details we cannot foresee. 

````js
new DeviceClass(ioOptions);
````

The ```ioOptions``` object follows the [TC-53 IO Class Pattern](https://github.com/EcmaTC53/spec/blob/master/docs/tc53.md#9-io-class-pattern) and accepts the same properties described in the individual IO classes. In addition, J5e can accept the `ioOptions.io` property which can be either a path or constructor in the event you do not want to use the default io provider.

*Whoah, what's a provider?*

In the physical world a provider is a "thing" (hardware or software) that provides constructors for IO instances. The IO could be built into the device running your JavaScript, part of a physically connected device like an expander or external microcontroller, or even part of a cloud service that controls a device located halfway around the world. 

In code a provider is a bundle of classes that work with that "thing". Providers could come from a board manufacturer, an expander library, an IoT cloud service, an open source hero, or a myriad of other places. For the ESP8266 and ESP32, providers are bundled with the [Moddable SDK](https://github.com/Moddable-OpenSource/moddable), and are part of that SDK's IO module. They give access to the built-in GPIO pins.

## The `ioOptions` object
In TC-53 parlance, an "IO" is a single GPIO (General-Purpose Input/Output) instance. That GPIO Instance could be Digital, PWM, Serial, I2C, SPI or something else. **The ```ioOptions``` options object describes the configuration for the IO instance**. This configuration could include which board to use, which pins, what data rate, etc. The details depend on your situation and provider. 

The options argument is always required and can take a few different forms: 
* **Pin Identifier** - This is the simplest scenario and would be a single number or string. J5e will assume the provider is built into the device.io global. The particular type of IO you need will vary by device type. For example, servo would default to ```device.io.PWM```. Button or switch would default to ```device.io.Digital```.
  ````js
  import LED from "j5e/led";

  // Instantiate an LED connected to 
  // builtin pin 13
  const led = await new LED(13);

  led.blink();
  ````

  *You may notice that we are using Top Level Await when instantiating the device. We get away with this by using an [IIFE that returns an async function](https://anthonychu.ca/post/async-await-typescript-nodejs/).*
---
* **Object Literal** - Sometimes it is necessary to specify more than just a pin number to instantiate an IO. For example if you are using an external provider, or need to set the data speed.
  ````js
  import Button from "j5e/button";
  
  // Instantiate an Button connected to 
  // pin 14
  const button = await new Button({
    pin: 2,
    mode: "inputPullUp"
  });

  button.on("press", () => { 
    // Do something
  });
  ```` 
  ---
* **IO Module Path** - It is possible to pass the path to the IO module you want to use as a string. J5e will import the module dynamically. You will need to have included that module in your manifest.json or whatever module scheme is appropriate for your environment.
  ````js
  import LED from "j5e/LED";
  
  // Instantiate an LED connected to an expander
  const led = await new LED({
    io: "PCA9685/PWM",
    address: 0x40,
    pin: 2
  });

  led.pulse();  
  ````
---
* **A Homogenous Array of Pin Identifiers** - Some devices require more than one IO. For example, an RGB LED requires three PWM IO's. The order of the elements in the array is important and is specific to the type of device.
  ````js
  import RGB from "@5e/RGB";
  // Instantiate an RGB LED connected to 
  // built-in pins 12, 13 and 14 
  const rgb = await new RGB([12, 13, 14]);

  led.blink();
  ````
---
* **A Heterogenous Array of Pin Identifiers or Object Literals** - You can also use more complex combinations in your array. For example, some devices require multiple IO's suppplied by more than one provider. A motor controller may use a PWM expander to control motor speed and a built-in digital pin to control direction. The order of the elements in the array matters and varies with the type of device.
  ````js
  import PWM from "PCA9685/PWM";
  import Motor from "j5e/motor";

  // Instantiate a PWM I/O connected to 
  // pin 2 of an expander
  // This PWM pin controls the voltage sent to the motor
  const speedIO = await new PWM({
    pin: 2,
    address: 0x40
  });

  // Instantiate a motor connected to 
  // speedIO and pin 13 on builtin
  // Pin 13 controls the direction of the motor
  const m1 = await new Motor([ speedIO, 13 ]);
    
  m1.forward();
  ````

  ---
* **A TC-53 Peripheral Class Pattern conformant options object** - The [peripheral class pattern](https://github.com/EcmaTC53/spec/blob/master/docs/tc53.md#12-peripheral-class-pattern) allows for explicit description of each of the required IO instances for a device type.
  ````js
  import Motor from "j5e/motor";

  // Instantiate a Motor
  const motor = await new Motor({
    pwm: {
      pin: 2
    },
    dir: {
      pin: 3
    }
  });

  motor.forward();
  ````

  ---
* **J5e shorthand for the peripheral class pattern**
  ````js
  import Motor from "j5e/motor";

  // Instantiate a Motor
  const motor = await new Motor({
    pwm: 2,
    dir: 3
  });
    
  motor.forward();
  ````

## The ```device``` options object
A device is something connected to your IO. It could be a sensor, a switch, and LED, a motor, a GPS receiver, or whatever. The universe of devices is vast. Since the details of the device properties can vary greatly, you need to reference the documentation for each device module to know how to use it. 

J5e will use common defaults for device configuration, but you can override the defaults by calling the device instance's `configuration` method.

* **An Object Literal** - In this scenario, the ```configure``` method is used to pass a custom configuration.
  ````js
  import Servo from "j5e/servo";

  const servo = await new Servo(12);
  servo.configure({
    pwmRange: [700, 2300],
    offset: 3
  });

  servo.sweep();
  ````

---
