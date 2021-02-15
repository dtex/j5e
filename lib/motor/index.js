/**
 * Class library for managing Motors.
 * @module j5e/motor
 * @requires module:j5e/event
 * @requires module:j5e/fn
 */

import { Emitter } from "j5e/event";
import { constrain, map, asyncForEach, normalizeDevice, normalizeIO, getProvider, timer } from "j5e/fn";

/**
 * The Motor class constructs objects that represent a single DC Motor (usually) attached to a motor controller.
 * @classdesc The Motor class allows for control of DC Motors
 * @async
 */
class Motor extends Emitter {

  #state = {
    device: "NONDIRECTIONAL",
    threshold: 0.11,
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
        brake: normalizeIO(io.brake)
      };

      // Derive device based on pins passed
      this.#state.device = "NONDIRECTIONAL";
      if (this.io.dir) {
        this.#state.device = "DIRECTIONAL";
      }
      if (this.io.cdir) {
        this.#state.device = "CDIR";
      }

      Object.defineProperties(this, Devices[this.#state.device]);

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
            pin: ioOptions.pin,
            mode: Provider.Output
          });
        }

      });

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
   * @param {number} [options.threshold=0.11] - The minimum speed [0, 1] that will make the motor move
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
   * The current direction
   * @type {boolean}
   * @readonly
   */
  get direction() {
    return this.#state.direction;
  }

  set direction(dir) {
    this.#state.direction = dir;
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

  /**
   * Set the motor's speed
   * @param {object|number} options - Speed options or value [0, 1]
   * @param {number} options.speed - Speed [0, 1]
   * @param {number} options.saveSpeed - Wether speed should be saved
   * @param {boolean} options.braking - Wether brake is on
   * @return {Motor}
   * @private
   */
  speed(options) {

    if (typeof options === "undefined") {
      return this.#state.currentSpeed;
    } else {

      if (typeof options === "number") {
        options = {
          speed: options
        };
      }

      options.speed = constrain(options.speed, 0, 1);

      options.saveSpeed = typeof options.saveSpeed !== "undefined" ? options.saveSpeed : true;

      if (options.speed < this.#state.threshold) {
        options.speed = 0;
      }

      this.#state.isOn = options.speed === 0 ? false : true;

      if (options.saveSpeed) {
        this.#state.currentSpeed = options.speed;
      }

      if (options.braking) {
        this.#state.braking = true;
      }

      if (this.invertPWM && this.#state.direction === 1) {
        options.speed = 1 - options.speed;
      }

      if (this.#state.enabled) {
        this.io.pwm.write(map(options.speed, 0, 1, this.LOW, this.HIGH));
      }

      return this;
    }

  };

  /**
   * Start the motor
   * @param {number} speed - Speed [0, 1]
   * @return {Motor}
   */
  start(speed) {

    if (this.io.brake && this.#state.braking) {
      this.setPin(this.pins.brake, 0);
    }

    // get current speed if nothing provided.
    speed = typeof speed !== "undefined" ? speed : this.speed();

    this.speed({
      speed: speed,
      braking: false
    });

    // "start" event is fired when the motor is started
    if (speed > 0) {
      timer.setImmediate(() => this.emit("start"));
    }

    return this;
  };

  /**
   * Stop the motor
   * @return {Motor}
   */
  stop() {
    this.speed({
      speed: 0,
      saveSpeed: false
    });
    timer.setImmediate(() => this.emit("stop"));

    return this;
  };

  /**
   * Brakes the motor - Note that not all motor controller support braking. If there is no brake pin, brake() behaves the same as stop() and the motor will coast to a stop
   * @param {number} [duration] - Time in millseconds to hold the brake
   * @return {Motor}
   */
  brake(duration) {
    if (!this.io.brake) {
      this.stop();
    } else {
      this.io.brake.write(1);
      this.io.dir.write(1);
      this.speed({
        speed: 1,
        saveSpeed: false,
        braking: true
      });
      timer.setImmediate(() => this.emit("brake"));

      if (typeof duration !== "undefined") {
        let motor = this;
        timer.setTimeout(function() {
          motor.release();
        }, duration);
      }

    }

    return this;
  };

  /**
   * Resumes the current speed
   * @param {number} [duration] - Time in millseconds to hold the brake
   * @return {Motor}
   */
  resume() {
    const speed = this.speed();
    this.dir(this.#state.direction);
    this.start(speed);

    return this;
  };

  /**
   * Releases the brake and calls resume
   * @return {Motor}
   */
  release() {
    if (typeof this.io.brake !== "undefined") {
      this.io.brake.write(1);
    }
    this.resume();
    timer.setImmediate(() => this.emit("release"));

    return this;
  };

  fwd(speed) {
    this.forward(speed);
  };

  forward(speed = 1) {
    this.dir(0);
    this.start(speed);
    timer.setImmediate(() => this.emit("forward"));
    return this;
  };

  rev(speed) {
    this.reverse(speed);
  };

  reverse(speed = 1) {
    this.dir(1);
    this.start(speed);
    timer.setImmediate(() => this.emit("reverse"));
    return this;
  };



};

export default Motor;

const Devices = {
  NONDIRECTIONAL: {
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
    dir: {
      writable: true,
      configurable: true,
      value(dir) {

        this.stop();

        this.io.dir.write(dir);
        this.direction = dir;

        return this;
      }
    }
  },
  CDIR: {
    dir: {
      value(dir) {

        this.stop();
        this.direction = dir;

        this.io.cdir.write(1 ^ dir);
        this.io.dir.write(dir);

        return this;
      }
    }
  }
};
