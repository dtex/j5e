/**
 * Base class for expanders
 * @module j5e/expander
 * @requires module:j5e/fn
 */

import Expander from "j5e/expander";
import { constrain, normalizeIO, getProvider, timer } from "j5e/fn";

/**
 * Class representing an expander
 * @classdesc The expander class functions as a base class for all expanders
 */
class PCA9685 extends Expander {

  #state = {
    PWMfrequency: 1526,
    pwmRange: [0, 4095],
    prescalar: 3
  }

  static REGISTER = {
    MODE1: 0x00,
    MODE2: 0x01,
    SUBADR1: 0x02,
    SUBADR2: 0x03,
    SUBADR3: 0x04,
    ALLCALLADR: 0x05,
    PRESCALE: 0xFE,
    BASE: 0x06
  };

  /**
   * Instantiate a PCA9685 expander
   * @param {(number[]|string[]|object)} io - The pin numbers, pin identifiers or a complete IO options object
   * @param {(number[]|string[])} [io.pins] - If passing an object, the pin numbers or pin identifiers for data (sda) and clock (scl) in a 2 element array
   * @param {(number|string)} [io.data] - The pin number or pin identifier for I²C data (sda)
   * @param {(number|string)} [io.clock] - The pin number or pin identifier for I²C clock (scl)
   * @param {(number|address)} [io.address = 0x40] - The I²C address of the PCA9685
   * @param {(number|string)} [io.hz = 100_000] - The clock frequency on the I²C bus
   */
  constructor(io) {
    return (async() => {

      io = normalizeIO(io);

      if (Array.isArray(io.pins)) {
        io.data = io.pins[0];
        io.clock = io.pins[1];
      }

      let expander = await super();
      
      const Provider = await getProvider(io, "I2C");
      this.#state.address = io.address || 0x40;

      expander.resolution = 12;
      expander.prescalar = 3;
      expander.io = new Provider({
        data: io.data,
        clock: io.clock,
        port: io.port || null,
        address: this.#state.address,
        hz: io.hz || 100_000,
        onReadable: (count) => {
          this.processData(count);
        }
      });

      expander.Digital = class extends Digital {
        constructor(io) {
          super(io, expander);
        }
      };

      expander.pins = {
        "0": { io: 0x09 },
        "1": { io: 0x09 },
        "2": { io: 0x09 },
        "3": { io: 0x09 },
        "4": { io: 0x09 },
        "5": { io: 0x09 },
        "6": { io: 0x09 },
        "7": { io: 0x09 },
        "8": { io: 0x09 },
        "9": { io: 0x09 },
        "10": { io: 0x09 },
        "11": { io: 0x09 },
        "12": { io: 0x09 },
        "13": { io: 0x09 },
        "14": { io: 0x09 },
        "15": { io: 0x09 }
      };

      return expander;
    })();
  }

  /**
  * Frequency of PWM pulses
  * @type {number}
  */
  get frequency() {
    return this.frequency;
  }

  set frequency(hz) {
    this.#state.PWMfrequency = constrain(hz, 24, 1526);
    let x = this.#state.frequency;
    this.#state.prescalar = Math.round(25000000 / (4096 * x)) - 1;
    this.initialize();
  }

  /**
   * Initialize the expander
   * @private
   */
  initialize() {
    // Reset
    this.write([PCA9685.REGISTER.MODE1, 0x00]);
    // Sleep
    this.write([PCA9685.REGISTER.MODE1, 0x10]);
    // Set prescalar
    this.write([PCA9685.REGISTER.PRESCALE, this.prescalar]);
    // Wake up
    this.write([PCA9685.REGISTER.MODE1, 0x00]);
    // Wait 5 microseconds for restart (I don't think we can count on a hi-res timer so pausing 1 millisecond is the best we can do)
    timer.sleep(1);
    // Auto-increment
    this.write([PCA9685.REGISTER.MODE1, 0xa0]);
  }

  write(data) {
    trace(data);
    trace("\n");
    this.io.write(new Uint8Array(data));
  }

}

class Digital {

  static Output = 8;

  #state = {
    pin: null
  }

  constructor(options, expander) {

    if ((options.pin < 0) || (options.pin > 15)) {
      throw new RangeError("invalid pin");
    }

    if (options.mode !== Digital.Output) {
      throw new RangeError("invalid mode");
    }

    expander.reservePin(options.pin);
    this.#state.expander = expander;
    this.#state.pin = options.pin;

  }

  write(value) {
    let on, off;

    if (value === 0) {
      // Special value for signal fully off.
      on = 0;
      off = 4096;
    }

    if (value === 1) {
      // Special value for signal fully on.
      on = 4096;
      off = 0;
    }

    this.#state.expander.write([
      PCA9685.REGISTER.BASE + 4 * this.#state.pin,
      on & 0xFF, on >> 8 & 0xFF,
      off & 0xFF, off >> 8 & 0xFF
    ]);

    this.#state.value = value;

  }

}



export default PCA9685;


/*
 PCA9685: {
    
    digitalWrite: {
      value(pin, value) {
        this.pwmWrite(pin, value ? 255 : 0);
      }
    },
    analogWrite: {
      value(pin, value) {
        this.pwmWrite(pin, value);
      }
    },
    pwmWrite: {
      value(pin, value) {

        if (this.pins[pin] === undefined) {
          throw new RangeError(`Invalid PCA9685 pin: ${pin}`);
        }

        value = Fn.constrain(value, 0, 255);

        let on = 0;
        let off = this.pwmRange[1] * value / 255;

        if (value === 0) {
          // Special value for signal fully off.
          on = 0;
          off = 4096;
        }

        if (value === 255) {
          // Special value for signal fully on.
          on = 4096;
          off = 0;
        }

        this.io.i2cWrite(this.address, [
          this.REGISTER.BASE + 4 * pin,
          on, on >> 8,
          off, off >> 8
        ]);

        this.pins[pin].value = value;
      }
    }
  },*/