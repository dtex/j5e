j5e device instantiation allows for a few different patterns. On one hand we wanted to enable the simplest possible use case where the only parameter we need is the pin number, and on the other hand we needed to be able to support complex io and device initializations whose details we cannot foresee.

````js
new DeviceClass(io[, device]);
````

## The ```io``` Argument
In TC-53 parlance, an "I/O" is a single GPIO (General-Purpose Input/Output) instance. That GPIO Instance could be Digital, PWM, Serial, I2C, SPI or something else. **The ```io``` argument describes the configuration for the I/O instance**. This configuration could include which board to use, which pins, what data rate, etc. The details depend on your situation and provider. 

*Whoah, what's a provider?*

In the physical world a provider is a "thing" (hardware or software) that provides access to some type of I/O. The I/O could be built into the device running your JavaScript, part of a physically connected device like an expander or external microcontroller, or even part of a cloud service that controls a device located halfway around the world. 

In code a provider is a bundle of modules or classes that work with that "thing". Providers could come from a board manufacturer, an expander library, an IoT cloud service, an open source hero, or a myriad of other places. The most basic providers are the **builtins** that are bundled with some platforms. In XS for the ESP8266, these providers are bundled with the [Moddable SDK](https://github.com/Moddable-OpenSource/moddable), and are part of the IO module. They give access to the ESP8266's built-in GPIO pins. Non-builtin providers are known as "external providers".

The ```io``` argument is always required and can take a few different forms: 
* **Pin Identifier** - This is the simplest scenario and would be a single number of string. j5e will assume the provider is a builtin. The particular type of IO will vary by device class. For example, servo would default to ```builtin/PWM```. Button or switch would default to ```builtin/Digital```.
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
* **I/O Instance** - Sometimes it may be necessary to explicitly instantiate the I/O and pass that instance on to j5e.
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
    const led = await new LED(ledIO);

    led.pulse();

  })();
  
  ````
  *Note that some je classes will not allow an I/O Instance to be passed in as an ioOption. Specifically, any j5e class that depends on callbacks for its event emitters must instantiate its own I/O Instances. The TC-53 specification does not allow for mutable callbacks on I/O instances.*
---
* **A Homogenous Array of Pin Identifiers, Object Literals, or I/O Instances** - Some devices require more than one I/O. For example, and RGB LED requires three PWM I/O's. The order of the elements in the array is important and is specific to the type of device.
  ````js
  import RGB from "@j5e/RGB";

  (async function() {
    
    // Instantiate an RGB LED connected to 
    // built-in pins 12, 13 and 14 
    const rgb = await new RGB([12, 13, 14]);

    led.blink();

  })();
  ````
---
* **A Heterogenous Array of Pin Identifiers, Object Literals, and/or I/O Instances** - You can also use more complex combinations in your array. For example, some devices require multiple I/O's suppplied by more than one provider. A motor controller may use a PWM expander to control motor speed and a built-in digital pin to control direction. The order of the elements in the array matters and varies with the type of device.
  ````js
  import PWM from "PCA9685/PWM";
  import Motor from "@j5e/motor";

  (async function() {

    // Instantiate a PWM I/O connected to 
    // pin 2 of an expander
    const speedIO = await new PWM({
      pin: 2,
      address: 0x40
    });

    // Instantiate a motor connected to 
    // speedIO and pin 13 on builtin
    const m1 = await new Motor([ speedIO, 13 ]);
    
    m1.forward();

  })();
  ````

  ## The ```device``` Argument
  A device is something connected to your I/O. It could be a sensor, a switch, and LED, a motor, a GPS receiver, or you name it. The universe of devices is vast. Since the details of the device argument can vary greatly we won't try and cover it here, except to say that it is optional. If it is not passed, j5e will use default values for the most common devices and scenarios. If a string is passed in its place, it is understood to be the path to an I/O provider.
  * **An Object Literal** - In this scenario, the ```device``` argument is passing a device-specific configuration.
  ````js
  import Servo from "@j5e/servo";

  (async function() {

    const servo = await new Servo(13, {
      pwmRange: [700, 2300],
      offset: 3
    });

    servo.sweep();

  })();
  ````
---
