All j5e devices (LED's, Motors, Sensors, etc) are instantiated using the same pattern:
````js
const instanceName = new DeviceClass(ioOptions, deviceOptions);
````
The deviceOptions argument is just an object literal, varies with the type of device being instantiated and is frequently optional. The ioOptions argument on the other hand is required and can take a number of different forms. Let's break down ioOptions in more detail.

## ioOptions
In TC-53 parlance, an "I/O" is a single GPIO instance. That GPIO Instance could be Digital, PWM, Serial, I2C, SPI or something else. **The ioOptions argument describes the configuration for the I/O instance**. This configuration could include which board to use, which pins, what data rate, etc. The details depend on your situation and provider. 

*Whoah, what's a provider?*

In the physical world a provider is a "thing" (hardware or software) that provides access to some type of I/O. The I/O could be built into the device running your JavaScript, part of a physically connected device like an expander or external microcontroller, or even part of a cloud service that controls a device located halfway around the world. 

In code a provider is a bundle of classes that work with that "thing". Providers could come from a board manufacturer, an expander library, an IoT cloud service, or a myriad of other places. The most basic providers are the **builtins** that are bundled with some platforms. In XS for the ESP8266, these providers are bundled with the [Moddable SDK](https://github.com/Moddable-OpenSource/moddable), and are part of the IO module. They give access to the ESP8266's built-in GPIO pins. Non-builtin providers are known as "external providers".

The ```ioOptions``` argument is always required and can take a few different forms: 
* **Number or String** - This is the simplest scenario and would be a single pin identifier. j5e will assume the provider is a builtin. The particular type of IO will vary by device class. For example, servo would default to ```builtin/PWM```. Button or switch would default to ```builtin/Digital```.
  ````js
  import LED from "@j5e/led";

  (async function() {
    
    // Instantiate an LED connected to 
    // builtin pin 13
    const led = await new LED(13);

    led.blink();
    
  })();
  ````
---
* **Object Literal** - Sometimes it is necessary to specify more than just a pin number to instantiate an I/O. For example if you are using an external provider, or need to set the data speed.
  ````js
  import LED from "@j5e/led";
  
  (async function() {

    // Instantiate an LED connected to 
    // an expander on pin 2
    const led = await new LED({
      io: "PCA9685/PWM",
      address: 0x40,
      pin: 2
    });

    led.blink();

  })();
  ````
---
* **An Array of Pin Identifiers** - Some devices require more than one I/O. For example, and RGB LED requires three PWM I/O's. If they all use the same provider, then you can just pass them as an array of pin identifiers.
  ````js
  import RGB from "@j5e/RGB";

  (async function() {
    
    // Instantiate an RGB LED connected to 
    // built-in pins 12, 13 and 14 
    const rgb = await new RGB([12, 13, 14]);

    led.blink();

  })();
  ````
  You could also use on object with an array on the pins property.
  ````js
  import RGB from "@j5e/RGB";

  (async function() {
    
    // Instantiate an RGB LED connected to 
    // an expander on pins 2, 3 and 4 
    const rgb = await new RGB({
      io: "PCA9685/PWM",
      address: 0x40,
      pins: [2, 3, 4]
    });

    rgb.blink();

  })();
  ````
---
* **I/O Instance** - Sometimes it may be necessary to explicitly instantiate the I/O and pass that instance on to j5e. For simplicitly, j5e tries to abstract this away, but the ability is there if you ever need it.
  ````js
  import PWM from "PCA9685/PWM";
  import LED from "@j5e/LED";
  
  (async function() {
    
    // Instantiate a PWM I/O connected to 
    // an expander on pin 2
    const ledIO = await new PWM({
      pin: 2,
      address: 0x40
    });
    
    // Instantiate an LED connected to 
    // our LED I/O
    const led = await new Led(ledIO);

    led.pulse();

  })();
  
  ````
  *Note that some je classes will not allow an I/O Instance to be passed in as an ioOption. Specifically, any j5e class that depends on callbacks for its event emitters must instantiate its own I/O Instances. The TC-53 specification does not allow for mutable callbacks on I/O instances.*
---

* **Heterogeneous Providers** - It is rare, but some devices require multiple I/O's suppplied by more than one provider. For example, a motor controller may use a PWM expander to control motor speed and a built-in digital pin to control direction. For these devices you can pass an array of pin identifiers, objects, or I/O instances. The order of the elements in the array is important and is specific to the type of device.
  ````js
  import PWM from "PCA9685/PWM";
  import Motor from "@j5e/motor";

  (async function() {

    // Instantiate a PWM I/O connected to 
    // pin 2 of an expander
    const speedIO = new PWM({
      pin: 2,
      address: 0x40
    });

    // Instantiate a motor connected to 
    // speedIO and pin 13 on builtin
    const m1 = await new Motor([ speedIO, 13 ]);
    
    m1.forward();

  })();
  ````
  