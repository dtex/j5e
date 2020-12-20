/**
 * Class library for managing Motors.
 * @module j5e/motor
 * @requires module:j5e/event
 * @requires module:j5e/fn
 */

import { Emitter } from "j5e/event";
import { asyncForEach, normalizeDevice, normalizeIO, getProvider, timer } from "j5e/fn";

/**
 * The Motor class constructs objects that represent a single DC Motor (usually) attached to a motor controller.
 * @classdesc The Motor class allows for control of DC Motors
 * @async
 */
class Motor extends Emitter {

  #state = {
    device: "NONDIRECTIONAL",
    threshold: 30,
    invertPWM: false,
    isOn: false,
    direction: 1,
    currentSpeed: 0,
    enabled: true
  };

  /**
   * Instantiate a Motor
   * @param {number|string|number[]|string[]|object[]|object} io - A pin identifier, an array of pin identifiers or IO Options in PWM, DIR, CDIR order, or a motor IO options object (See {@tutorial C-INSTANTIATING})
   * @example
   * <caption>Using a pin number</caption>
   * import Motor from "j5e/motor";
   *
   * const motor = await new Motor(12);
   * motor.fwd();
   *
   * @example
   * <caption>Using an options object</caption>
   * import Motor from "j5e/motor";
   *
   * const motor = await new Motor({
   *   pin: 12
   * });
   * motor.fwd();
   *
   * @example
   * <caption>Initializing 2 pin, Bi-Directional DC Motors</caption>
   * import Motor from "j5e/motor";
   *
   * const motor = await new Motor([ 3, 12 ]);
   * motor.fwd();
   *
   * @example
   * <caption>Initializing 2 pin, Bi-Directional DC Motors with an object</caption>
   * import Motor from "j5e/motor";
   *
   * const motor = await new Motor({
   *   pins: [ 3, 12 ]
   * });
   * motor.fwd();
   *
   * @example
   * <caption>Initializing 2 pin, Bi-Directional DC Motors with explicit pins</caption>
   * import Motor from "j5e/motor";
   *
   * const motor = await new Motor({
   *   pins: {
   *     pwm: 3,
   *     dir: 12
   *   }
   * });
   * motor.fwd();
   *
   * @example
   * <caption>Initializing 3 pin, Bi-Directional DC Motors</caption>
   * import Motor from "j5e/motor";
   *
   * const motor = await new Motor([ 3, 12, 11 ]);
   * motor.fwd();
   *
   * @example
   * <caption>Initializing 3 pin, Bi-Directional DC Motors with an object</caption>
   * import Motor from "j5e/motor";
   *
   * const motor = await new Motor({
   *   pins: [ 3, 12, 11 ]
   * });
   * motor.fwd();
   *
   * @example
   * <caption>Initializing 3 pin, Bi-Directional DC Motors with explicit pins</caption>
   * import Motor from "j5e/motor";
   *
   * const motor = await new Motor({
   *   pins: {
   *     pwm: 3,
   *     dir: 12,
   *     cdir: 11
   *   }
   * });
   * motor.fwd();
   *
   * @example
   * <caption>Initializing Bi-Directional DC Motors with inverted speed for reverse. Most likely used for non-commercial H-Bridge controllers</caption>
   * import Motor from "j5e/motor";
   *
   * const motor = await new Motor({
   *   pins: [3, 23],
   *   invertPWM: true
   * });
   * motor.fwd();
   */
  constructor(io) {
    return (async() => {

      super();

      if (Array.isArray(io)) {
        io = {
          pwm: io[0],
          dir: io[1],
          cdir: io[2]
        };
      } else {
        if (!io.pwm) {
          io = { pwm: io };
        }
      }

      this.io = {
        pwm: normalizeIO(io.pwm),
        dir: normalizeIO(io.dir),
        cdir: normalizeIO(io.cdir),
        brake: normalizeIO(io.brake),
        current: normalizeIO(io.current),
      };

      // Derive device based on pins passed
      this.#state.device = "NONDIRECTIONAL";
      if (this.io.dir) {
        this.#state.device = "DIRECTIONAL";
      }
      if (this.io.cdir) {
        this.#state.device = "CDIR";
      }

      let pwmProvider = await getProvider(io.pwm, "builtin/pwm");

      this.io.pwm = new pwmProvider({
        pin: io.pwm.pin
      });

      this.LOW = 0;
      this.HIGH = (1 << this.io.pwm.resolution) - 1;

      await asyncForEach(["dir", "cdir", "brake"], async(pin, index) => {

        if (io[pin]) {
          let ioOptions = io[pin];
          const Provider = await getProvider(ioOptions, "builtin/digital");

          this.io[pin] = new Provider({
            pin: ioOptions.pin
          });
        }

      });

      if (io.current) {
        let ioOptions = io.current;
        const Provider = await getProvider(ioOptions, "builtin/analog");

        this.io.current = new Provider({
          pin: ioOptions.pin
        });
      }

      this.configure();

      return this;
    })();
  }

  /**
   * Configure a Motor
   * @returns {Motor} The instance on which the method was called
   * @param {object} options - Device configuration options
   * @param {boolean} [options.enabled = true] - Sets the enabled state of a motor
   * @param {boolean} [options.invertPWM=false] - True if a PWM signal should be inverted for reverse
   * @param {number} [options.threshold=30] - The minimum PWM value that will make the motor move
   * @example
   * import Motor from "j5e/motor";
   *
   * const motor = await new Motor(12);
	 * motor.forward();
   */
  configure(options = {}) {
    options = normalizeDevice(options);

    if (typeof options.threshold !== "undefined") {
      this.#state.threshold = options.threshold;
    };

    if (typeof options.invertPWM !== "undefined") {
      this.#state.invertPWM = options.invertPWM;
    };

    if (typeof options.enabled !== "undefined") {
      this.enabled = options.enabled;
    } else {
      this.enable();
    };

    return this;
  }

  /**
   * Wether current is flowing. This does not necessarily mean the motor is turning.
   * @type {boolean}
   * @readonly
   */
  get isOn() {
    return this.#state.isOn;
  }

  /**
   * The Motor's current speed
   * @type {number}
   * @readonly
   */
  get currentSpeed() {
    return this.#state.currentSpeed;
  }

  /**
   * Wether the motor is enabled
   * @type {boolean}
   * @readonly
   */
  get enabled() {
    return this.#state.enabled;
  }

  set enabled(enable) {
    if (this.io.enable) {
      this.io.enable.write(enable);
    }
    this.#state.enabled = enable;
  }

  /**
   * Enable a motor. If there is an enable pin, set its value to high
   * @return {Motor}
   * @example
   * <caption>Enable a motor</caption>
   * import Motor from "j5e/motor";
   *
   * const motor = await new Motor([13, 12, 14]);
	 * motor.disable();
   * window.setTimeout(() => {
   *   motor.enable();
   * }, 5000);
   */
  enable() {
    this.enabled = true;
  }

  /**
   * Enable a motor. If there is an enable pin, set its value to low
   * @return {Motor}
   * @example
   * <caption>Disable a motor</caption>
   * import Motor from "j5e/motor";
   *
   * const motor = await new Motor([13, 12, 14]);
	 * motor.disable();
   */
  disable() {
    this.enabled = false;
  };

};

export default Motor;


// Motor.prototype.setPin = function(pin, value) {
//   this.io.digitalWrite(pin, value);
// };

// Motor.prototype.setPWM = function(pin, value) {
//   this.io.analogWrite(pin, Fn.map(value, 0, 255, 0, this.board.RESOLUTION.PWM));
// };

// Motor.prototype.speed = function(options) {
//   var state = priv.get(this);

//   if (typeof options === "undefined") {
//     return state.currentSpeed;
//   } else {

//     if (typeof options === "number") {
//       options = {
//         speed: options
//       };
//     }

//     options.speed = Board.constrain(options.speed, 0, 255);

//     options.saveSpeed = typeof options.saveSpeed !== "undefined" ?
//       options.saveSpeed : true;

//     if (options.speed < this.threshold) {
//       options.speed = 0;
//     }

//     state.isOn = options.speed === 0 ? false : true;

//     if (options.saveSpeed) {
//       state.currentSpeed = options.speed;
//     }

//     if (options.braking) {
//       state.braking = true;
//     }

//     if (this.invertPWM && this.direction.value === 1) {
//       options.speed ^= 0xff;
//     }

//     this.setPWM(this.pins.pwm, options.speed);

//     return this;
//   }

// };

// // start a motor - essentially just switch it on like a normal motor
// Motor.prototype.start = function(speed) {
//   // Send a signal to turn on the motor and run at given speed in whatever
//   // direction is currently set.
//   if (this.pins.brake && this.braking) {
//     this.setPin(this.pins.brake, 0);
//   }

//   // get current speed if nothing provided.
//   speed = typeof speed !== "undefined" ?
//     speed : this.speed();

//   this.speed({
//     speed: speed,
//     braking: false
//   });

//   // "start" event is fired when the motor is started
//   if (speed > 0) {
//     process.nextTick(() => this.emit("start"));
//   }

//   return this;
// };

// Motor.prototype.stop = function() {
//   this.speed({
//     speed: 0,
//     saveSpeed: false
//   });
//   process.nextTick(() => this.emit("stop"));

//   return this;
// };

// Motor.prototype.brake = function(duration) {
//   if (typeof this.pins.brake === "undefined") {
//     if (this.board.io.name !== "Mock") {
//       console.log("Non-braking motor type");
//     }
//     this.stop();
//   } else {
//     this.setPin(this.pins.brake, 1);
//     this.setPin(this.pins.dir, 1);
//     this.speed({
//       speed: 255,
//       saveSpeed: false,
//       braking: true
//     });
//     process.nextTick(() => this.emit("brake"));

//     if (duration) {
//       var motor = this;
//       this.board.wait(duration, function() {
//         motor.resume();
//       });
//     }
//   }

//   return this;
// };

// Motor.prototype.release = function() {
//   this.resume();
//   process.nextTick(() => this.emit("release"));

//   return this;
// };

// Motor.prototype.resume = function() {
//   var speed = this.speed();
//   this.dir(this.direction);
//   this.start(speed);

//   return this;
// };





// [
//   /**
//    * forward Turn the Motor in its forward direction
//    * fwd Turn the Motor in its forward direction
//    *
//    * @param  {Number} 0-255, 0 is stopped, 255 is fastest
//    * @return {Object} this
//    */
//   {
//     name: "forward",
//     abbr: "fwd",
//     value: 1
//   },
//   /**
//    * reverse Turn the Motor in its reverse direction
//    * rev Turn the Motor in its reverse direction
//    *
//    * @param  {Number} 0-255, 0 is stopped, 255 is fastest
//    * @return {Object} this
//    */
//   {
//     name: "reverse",
//     abbr: "rev",
//     value: 0
//   }
// ].forEach(dir => {
//   Motor.prototype[dir.name] = Motor.prototype[dir.abbr] = function(speed) {
//     this.dir(dir);
//     this.start(speed);
//     return this;
//   };
// });

const Devices = {
  NONDIRECTIONAL: {
    pins: {
      get() {
        if (this.settings.pin) {
          return {
            pwm: this.settings.pin
          };
        } else {
          return this.settings.pins || {};
        }
      }
    },
    dir: {
      writable: true,
      configurable: true,
      value(speed) {
        speed = speed || this.speed();
        return this;
      }
    },
    resume: {
      value() {
        const speed = this.speed();
        this.speed({
          speed
        });
        return this;
      }
    }
  },
  DIRECTIONAL: {
    pins: {
      get() {
        if (Array.isArray(this.settings.pins)) {
          return {
            pwm: this.settings.pins[0],
            dir: this.settings.pins[1]
          };
        } else {
          return this.settings.pins;
        }
      }
    },
    dir: {
      writable: true,
      configurable: true,
      value(dir) {

        this.stop();

        this.setPin(this.pins.dir, dir.value);
        this.direction = dir;

        process.nextTick(() => this.emit(dir.name));

        return this;
      }
    }
  },
  CDIR: {
    pins: {
      get() {
        if (Array.isArray(this.settings.pins)) {
          return {
            pwm: this.settings.pins[0],
            dir: this.settings.pins[1],
            cdir: this.settings.pins[2]
          };
        } else {
          return this.settings.pins;
        }
      }
    },
    dir: {
      value(dir) {

        this.stop();
        this.direction = dir;

        this.setPin(this.pins.cdir, 1 ^ dir.value);
        this.setPin(this.pins.dir, dir.value);

        process.nextTick(() => this.emit(dir.name));

        return this;
      }
    },
    brake: {
      value(duration) {

        this.speed({
          speed: 0,
          saveSpeed: false
        });
        this.setPin(this.pins.dir, 1, 127);
        this.setPin(this.pins.cdir, 1, 128, 127);
        this.speed({
          speed: 255,
          saveSpeed: false,
          braking: true
        });

        process.nextTick(() => this.emit("brake"));

        if (duration) {
          this.board.wait(duration, () => this.stop());
        }

        return this;
      }
    }
  }
};
