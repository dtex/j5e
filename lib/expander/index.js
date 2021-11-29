/**
 * Base class for expanders
 * @module j5e/expander
 * @requires module:j5e/fn
 */

import { normalizeIO, getProvider, toFixed } from "j5e/fn";

/**
 * Base class for expanders
 * @private
 */
class Expander {

  /**
   * IO maps each type of IO by index to its bit on our capabilities check
   * For example, an expander pin that supports Digital, Analog and Serial will have a
   * capabilities value of (0b1 | 0b100 | 0b1000000) or 0x45 or 69
   * @private
   */
  static IO = ["Digital", "DigitalBank", "Analog", "PWM", "I2C", "SMBus", "Serial", "SPI", "PulseCount", "TCP", "Listener", "UDP"];

  /**
   * Instantiate an expander
   * @param {(number[]|string[]|object)} options - The expander options object
   * @param {object} options.pins - Pin map with capabilities
   */
  constructor() {
    return (async() => {
      return this;
    })();
  }

  /**
   * Reserve a pin by identifier
   * @param {(number|string)} pin - Pin identifier
   */
  reservePin(pinArray) {
    if (!Array.isArray(pinArray)) {
      pinArray = [pinArray];
    }

    pinArray.forEach(pin => {

      if (typeof pin === "undefined") {
        return;
      }

      if (!this.pins[pin]) {
        throw `Pin ${pin} is not defined for this expander`;
      }

      if (this.pins[pin].locked) {
        throw `Pin ${pin} is already in use`;
      } else {
        this.pins[pin].locked = true;
      }
    });

  }

  /**
   * Reserve a pin by identifier
   * @param {(number|string)} pin - Pin identifier
   */
  releasePin(pinArray) {
    if (!Array.isArray(pinArray)) {
      pinArray = [pinArray];
    }

    pinArray.forEach(pin => {
      if (this.pins[pin].locked) {
        this.pins[pin].locked = false;
      }
    });
  }

}

export default Expander;


/*
 PCA9685: {
    ADDRESSES: {
      value: [0x40]
    },
    REGISTER: {
      value: {
        MODE1: 0x00,
        PRESCALE: 0xFE,
        BASE: 0x06
      }
    },
    initialize: {
      value(options) {
        const state = priv.get(this);

        // 7.3.5 PWM frequency PRE_SCALE
        //
        // These number correspond to:
        // min PWM frequency: 24 Hz
        // max PWM frequency: 1526 Hz
        state.frequency = Fn.constrain(options.frequency || 1526, 24, 1526);

        this.address = options.address || this.ADDRESSES[0];
        this.pwmRange = options.pwmRange || [0, 4095];

        Object.defineProperties(this, {
          prescale: {
            get() {
              // PCA9685 has an on-board 25MHz clock source

              // 7.3.5 PWM frequency PRE_SCALE
              return Math.round(25000000 / (4096 * state.frequency)) - 1;
            }
          },
          frequency: {
            get() {
              return state.frequency;
            }
          }
        });


        options.address = this.address;

        this.io.i2cConfig(options);

        // Reset
        this.io.i2cWriteReg(this.address, this.REGISTER.MODE1, 0x00);
        // Sleep
        this.io.i2cWriteReg(this.address, this.REGISTER.MODE1, 0x10);
        // Set prescalar
        this.io.i2cWriteReg(this.address, this.REGISTER.PRESCALE, this.prescale);
        // Wake up
        this.io.i2cWriteReg(this.address, this.REGISTER.MODE1, 0x00);
        // Wait 5 microseconds for restart
        sleep.micro(5);
        // Auto-increment
        this.io.i2cWriteReg(this.address, this.REGISTER.MODE1, 0xa0);

        Object.assign(this.MODES, this.io.MODES);

        for (let i = 0; i < 16; i++) {
          this.pins.push({
            supportedModes: [
              this.MODES.OUTPUT,
              this.MODES.PWM,
              this.MODES.SERVO,
            ],
            mode: 0,
            value: 0,
            report: 0,
            analogChannel: 127
          });

          this.pinMode(i, this.MODES.OUTPUT);
          this.digitalWrite(i, this.LOW);
        }

        this.name = "PCA9685";
        this.isReady = true;

        this.emit("connect");
        this.emit("ready");
      }
    },
    normalize: {
      value(pin) {
        return this.io.name.includes("Tessel 2") ? pin - 1 : pin;
      }
    },
    pinMode: {
      value(pin, mode) {
        if (this.pins[pin] === undefined) {
          throw new RangeError(`Invalid PCA9685 pin: ${pin}`);
        }
        this.pins[pin].mode = mode;
      }
    },
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
    servoWrite: {
      value(pin, value) {

        let off;

        if (value < 544) {
          value = Fn.constrain(value, 0, 180);
          off = Fn.map(value, 0, 180, this.pwmRange[0] / 4, this.pwmRange[1] / 4);
        } else {
          off = value / 4;
        }

        off |= 0;

        this.io.i2cWrite(this.address, [
          this.REGISTER.BASE + 4 * pin,
          0, 0,
          off, off >> 8
        ]);
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