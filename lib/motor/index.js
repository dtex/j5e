/**
 * Class library for managing Motors.
 * @module j5e/motor
 * @requires module:j5e/event
 * @requires module:j5e/fn
 */

import { Emitter } from "j5e/event";
import { constrain, map, asyncForEach, normalizeDevice, normalizeIO, getProvider, timer } from "j5e/fn";

/**
 * The Motor class constructs objects that represent a single non-directional DC Motor (usually) attached to a motor controller.
 * @classdesc The Motor class allows for control of non-directional DC Motors
 * @async
 */
class Motor extends Emitter {

  #state = {
    device: "NONDIRECTIONAL",
    threshold: 0.11,
    isOn: false,
    currentSpeed: 0,
    enabled: true
  };

  /**
   * Instantiate a Motor
   * @param {number|string|number[]|string[]|object[]|object} io - A pin identifier or motor IO options object (See {@tutorial C-INSTANTIATING})
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
   */
  constructor(io) {
    return (async() => {

      super();

      if (Array.isArray(io)) {
        io = {
          pwm: io[0]
        };
      } else {
        if (!io.pwm) {
          io = { pwm: io };
        }
      }

      this.io = {
        pwm: normalizeIO(io.pwm),
        enable: normalizeIO(io.enable),
        brake: normalizeIO(io.brake)
      };

      let pwmProvider = await getProvider(io.pwm, "PWM");

      this.io.pwm = new pwmProvider({
        pin: io.pwm.pin
      });

      this.LOW = 0;
      this.HIGH = (1 << this.io.pwm.resolution) - 1;

      this.configure();

      return this;
    })();
  }

  /**
   * Configure a Motor
   * @returns {Motor} The instance on which the method was called
   * @param {object} options - Device configuration options
   * @param {boolean} [options.enabled = true] - Sets the enabled state of a motor
   * @param {number} [options.threshold=0.11] - The minimum speed [0, 1] that will make the motor move
   * @example
   * import Motor from "j5e/motor";
   *
   * const motor = await new Motor(12);
	 * motor.configure({
   *   enabled: false
   * });
   * motor.forward(); // No signal is sent
   */
  configure(options = {}) {
    options = normalizeDevice(options);

    if (typeof options.threshold !== "undefined") {
      this.#state.threshold = options.threshold;
    };

    if (typeof options.enabled !== "undefined") {
      this.enabled = options.enabled;
    } else {
      this.enable();
    };

    return this;
  }

  /**
   * Whether current is flowing. This does not necessarily mean the motor is turning.
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
   * Whether the motor is enabled
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
   * const motor = await new Motor([13, 12]);
	 * motor.disable();
   * window.setTimeout(() => {
   *   motor.enable();
   * }, 5000);
   */
  enable() {
    this.enabled = true;
  }

  /**
   * Disable a motor. If there is an enable pin, set its value to low
   * @return {Motor}
   * @example
   * <caption>Disable a motor</caption>
   * import Motor from "j5e/motor";
   *
   * const motor = await new Motor([13, 12]);
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
   * Brakes the motor - Note that not all motor controllers support braking. If there is no brake pin, brake() behaves the same as stop() and the motor will coast to a stop
   * @param {number} [duration] - Time in millseconds to hold the brake
   * @return {Motor}
   */
  brake(duration) {
    if (!this.io.brake) {
      this.stop();
    } else {
      this.io.brake.write(1);
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
   * @return {Motor}
   */
  resume() {
    const speed = this.speed();
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
    this.start(speed);
    timer.setImmediate(() => this.emit("forward"));
    return this;
  };

  dir(speed) {
    speed = speed || this.speed();
    return this;
  };

  resume() {
    const speed = this.speed();
    this.speed({
      speed
    });
    return this;
  }
};

export default Motor;
