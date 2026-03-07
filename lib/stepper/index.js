/**
 * Class library for controlling stepper motors
 * @description A module for controlling stepper motors
 * @module j5e/stepper
 * @requires module:j5e/easing
 * @requires module:j5e/event
 * @requires module:j5e/fn
 */

import { getIO, normalizeDevice, timer, TAU } from "j5e/fn";
import { inSine, inOutSine, outSine } from "j5e/easing";
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
    stepType: 0,
    untis: 0,
    direction: 1,
    speed: 1,
    acceleration: 0,
    deceleration: 0,
    currentSpeed: 0,
    absolutePosition: 0,
    absoluteTarget: 0,
    target: 0,
    offset: 0,
    stepsPerRev: 200,
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
   * @param {number} [options.stepType=0] - The type of step sequence to use
   * @example
   * import Stepper from "j5e/stepper";
   *
   * const stepper = await new Stepper([16, 5, 4, 0]);
	 * stepper.configure({
   *  stepType: Stepper.STEPTYPE.HALF
   * });
   * stepper.step(100);
   */
  configure(options = {}) {
    
    options = normalizeDevice(options);

    if (options.acceleration) {
      if (typeof options.acceleration === "number") {
        options.acceleration = { rate: options.acceleration, easing: "linear" };
      }
      this.#state.acceleration = options.acceleration;
    }

    if (options.deceleration) {
      if (typeof options.deceleration === "number") {
        options.deceleration = { rate: options.deceleration, easing: "linear" };
      }
      this.#state.deceleration = options.deceleration;
    }

    if (options.stepsPerRev) {
      this.#state.stepsPerRev = options.stepsPerRev;
    }

    if (options.targetSpeed) {
      this.#state.targetSpeed = options.targetSpeed;
    }

    if (options.direction) {
      this.#state.direction = options.direction;
    }
    
    this.initialize(options);

    return this;
  }
  
  /**
    * Gets the rpm value or sets the rpm in revs per minute
    * making an internal conversion to speed in `0.01 * rad/s`
    *
    * @param {Number} rpm Revs per minute
    * 
    * NOTE: *rpm* is optional, if missing
    * the method will behave like a getter 
    *  
    * @returns {Stepper} The instance on which the method was called
    * @example
    * import Stepper from "j5e/stepper";
    *
    * const myStepper = await new Stepper([16, 5, 4, 0]);
    * myStepper.rpm(180);
    * myStepper.step(100);
    */
  rpm(rpm) {
    if (typeof rpm === "undefined") {
      return this.#state.rpm;
    }
    this.#state.rpm = rpm;
    this.#state.speed = Math.round(rpm * TAU * 100 / 60);
    return this;
  }

  /**
    * speed
    * Gets the speed value or sets the speed in `0.01 * rad/s`
    * making an internal conversion to rpm
    *
    * @param {Number} speed Speed given in `0.01 * rad/s`
    * 
    * NOTE: *speed* is optional, if missing
    * the method will behave like a getter 
    *  
    * @returns {Stepper} The instance on which the method was called
    * @example
    * import Stepper from "j5e/stepper";
    *
    * const myStepper = await new Stepper([16, 5, 4, 0]);
    * myStepper.speed(200);
    * myStepper.step(200);
    */
  speed(speed) {
    if (typeof rpm === "undefined") {
      return this.#state.speed;
    }
    this.#state.speed = speed;
    this.#state.speed = Math.round(speed / TAU / 100 * 60);
    return this;
  }

  /**
   * ccw
   * Sets the direction to counter-clockwise
   * @returns {Stepper} The instance on which the method was called
   */
  ccw() {
    this.#state.direction = 0;
    return this;
  }

  /**
   * accel
   * Sets the acceleration
   * @param {Number | Object} value - If a number is passed it is the accelearation duration, and the easing is set to linear.
   * @param {Number} value.rate The acceleration value in steps/s^2
   * @param {String} value.easing The easing function to use for acceleration
   */
  accel(value) {
    
    // No param means we are getting the value
    if (typeof value === "undefined") {
      return this.#state.acceleration;
    }
    
    // If a number is passed, that means we are using linear acceleration
    if (typeof value === "number") {
      this.acceleration = {
        rate: this.normalizeUnits(value), 
        easing: "linear" 
      };
    } else {
      this.acceleration = value;
    }

    // If the speed is not 0, stop and plan steps
    if (this.currentSpeed !== 0) {
      this.stop(false);
      let plan = this.planSteps();
      this.queue = temporal.queue(plan);
    }
  
    return this;
  }

  /**
   * decel
   * Sets the deceleration
   * @param {Number | Object} value - If a number is passed it is the deceleration duration, and the easing is set to linear.
   * @param {Number} value.rate The deceleration value in steps/s^2
   * @param {String} value.easing The easing function to use for deceleration
   */
  decel(value) {
    
    // No param means we are getting the value
    if (typeof value === "undefined") {
      return this.#state.deceleration;
    }
    
    // If a number is passed, that means we are using linear acceleration
    if (typeof value === "number") {
      this.deceleration = {
        rate: this.normalizeUnits(value), 
        easing: "linear" 
      };
    } else {
      this.deceleration = value;
    }

    this.stop(false);
    let plan = this.planSteps();
    this.queue = temporal.queue(plan);
    
    return this;
  }

  /*
   * Zero the stepper position
   */
  zero() {
    this.position(0);  
  };

  /*
   * Find the number of steps remaining
   */ 
  distanceToGo() {
    return this.absoluteTarget - this.absolutePosition;
  };

  /*
   * Set the stepper position
   * @param {Number} value - The position to set
   */
  position(value) {
  
    // Methods without params might be getting a value
    if (typeof value === "undefined") {
      return this.absolutePosition + this.offset;
    } else {

      this.stop(false);
      let newPosition = this.normalizeUnits(value);
      this.offset = newPosition - this.absolutePosition;
      
      if (this.distanceToGo()) {
        this.absoluteTarget = this.target - this.offset;
      } else {
        this.absoluteTarget = this.absolutePosition;
      }

      let plan = this.planSteps();
      this.queue = temporal.queue(plan);
      return this;
    }

  };

  /*
   * Step the stepper
   */
  step(steps, callback) {
  
    if (!this.isEnabled) {
      return false;
    }
    
    if (typeof callback === "function") {
      this.once("moveComplete", callback);
    }
    
    if (steps === 0) {
      this.emit("moveComplete", this.position());
      return;
    }
    
    this.stop(false);
    
    if (this.absoluteDirection) {
      this.target = this.position() + steps;
      this.absoluteTarget = this.absolutePosition + steps;
    } else {
      this.target = this.position() - steps;
      this.absoluteTarget = this.absolutePosition - steps;
    }

    let plan = this.planSteps();
    this.queue = temporal.queue(plan);
  };

}



// Next step add the run method https://github.com/dtex/johnny-five/blob/stepper2/lib/stepper.js#L690

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
  },
  STEPS: {
    WHOLE: [0b0101, 0b0110, 0b1010, 0b1001],
    HALF: [0b0101, 0b0100, 0b0110, 0b0010, 0b1010, 0b1000, 0b1001, 0b0001],
  }
});

export default Stepper;
