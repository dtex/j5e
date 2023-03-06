/**
 * Class library for controlling stepper motors
 * @description A module for controlling stepper motors
 * @module j5e/stepper
 * @requires module:j5e/easing
 * @requires module:j5e/event
 * @requires module:j5e/fn
 */

import { getIO, normalizeDevice, timer } from "j5e/fn";
import { inOutSine, outSine } from "j5e/easing";
import { Emitter } from "j5e/event";

/**
 * Class representing as stepper motor
 * @classdesc The stepper is a base class for controlling stepper motors
 * @async
 * @extends Emitter
 * @fires Stepper#XXX
 * @fires Stepper#XXX
 */
class stepper extends Emitter {

  #state = {
    someStateProp: true
  };

  /**
   * Instantiate a stepper motor
   * @param {number[]|string[]|object[]} options - An array of pin numbers, pin identifiers, or complete IO options objects (See {@tutorial C-INSTANTIATING}
   * @property {boolean} XXX - True if XXX
   * @example
   * <caption>Use a stepper motor</caption>
   * import stepper from "j5e/stepper";
   *
   * const myStepper = await new stepper([12, 13, 13, 14]);
   *
   */
  constructor(io) {
    return (async() => {
      io = normalizeParams(io);
      super();

      if (Array.isArray(io)) {
        if (io.length < 2 || io.length > 4) {
          throw "Stepper expects 2, 3, or 4 pins";
        }
        io = {
          m1: io[0],
          m2: io[1],
          m3: io[2],
          m4: io[3]
        };
      }

      io.m1 = normalizeIO(io.m1);
      io.m2 = normalizeIO(io.m2);
      io.m3 = normalizeIO(io.m3);
      io.m4 = normalizeIO(io.m4);

      this.keys = ["m1", "m2", "m3", "m4"].filter(key => io[key]);

      await asyncForEach(this.keys, async(MCPin, index) => {

        let ioOptions = io[MCPin];
        const Provider = await getProvider(ioOptions, "Digital");

        this.io[MCPin] = new Provider({
          pin: ioOptions.pin
        });

      });

      this.configure();
      return this;

    })();

  }

   /**
    * Get some read only value
    * @type {boolean}
    * @readonly
    * @example
    * <caption>Getter in action</caption>
    * import XXX from "j5e/XXX";
    *
    * const myxxx = await new XXX(12);
    * console.log(myxxx.someReadOnlyProperty)
    */
   get someReadOnlyProperty() {
     return Boolean(this.io.xxx);
   }
 
   /**
    * Get some readable/writable value
    * @type {number}
    * @example
    * <caption>Getter in action</caption>
    * import XXX from "j5e/XXX";
    *
    * const myxxx = await new XXX(12);
    * console.log(myxxx.someReadOnlyProperty)
    *
    * @example
    * <caption>Setter in action</caption>
    * import XXX from "j5e/XXX";
    *
    * const myxxx = await new XXX(12);
    * myxxx.someReadWriteProperty = 11;
    */
   get someReadWriteProperty() {
     return this.#state.xxx;
   }
 
   set someReadWriteProperty(newValue) {
     this.#state.xxx = Number(newValue);
   }
 
   /**
   * Configure the stepper
   * @returns {Stepper} The instance on which the method was called
   * @param {object} options - Device configuration options
   * @param {number} [options.stepType=0] - True if an element is common anode
   * @example
   * import RGB from "j5e/rgb";
   *
   * const rgb = await new RGB([13, 12, 14]);
	 * rgb.color("#663399");
	 * rgb.blink();
   */
  configure(options = {}) {
    options = normalizeDevice(options);

    if (typeof options.sink !== "undefined") {
      this.#state.sink = true;
    }

    this.initialize(options);

    return this;
  }
  
  /**
    * doSomething
    * @return {XXX}
    * @example
    * import XXX from "j5e/XXX";
    *
    * const myXXX = await new XXX(12);
    * myXXX.doSomething();
    */
   doSomething() {
     return this;
   }
 
 }

Object.defineProperties(Stepper, {
  DEVICES: {
    value: [/* Intentionally empty */, "DRIVER", "TWO_WIRE", "THREE_WIRE", "FOUR_WIRE"]
  },
  DEVICE: {
    value: Object.freeze({
      DRIVER: 1,
      TWO_WIRE: 2,
      THREE_WIRE: 3,
      FOUR_WIRE: 4
    })
  },
  TYPE: {
    value: Object.freeze({
      DRIVER: 1,
      TWO_WIRE: 2,
      THREE_WIRE: 3,
      FOUR_WIRE: 4
    })
  },
  RUNSTATE: {
    value: Object.freeze({
      STOP: 0,
      ACCEL: 1,
      DECEL: 2,
      RUN: 3
    })
  },
  DIRECTION: {
    value: Object.freeze({
      CCW: 0,
      CW: 1
    })
  },
  UNITS: {
    value: Object.freeze({
      STEPS: 0,
      DEGREES: 1,
      RADS: 2,
      RADIANS: 2,
      REVS: 3,
      REVOLUTIONS: 3,
      ROTATIONS: 3
    })
  },
  STEPTYPE: {
    value: Object.freeze({
      WHOLE: 0,
      HALF: 1,
      QUARTER: 2,
      EIGHTH: 3,
      SIXTEENTH: 4,
      THIRTYSECOND: 5,
      SIXTYFOURTH: 6,
      ONETWENTYEIGHTH: 7
    })
  }
});

export default Stepper;
