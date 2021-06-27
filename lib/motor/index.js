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
    invertPWM: false,
    isOn: false,
    currentSpeed: 0,
    direction: 0,
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
        enable: normalizeIO(io.enable),
        brake: normalizeIO(io.brake)
      };

      let pwmProvider = await getProvider(io.pwm, "PWM");
      this.io.pwm = new pwmProvider({
        pin: io.pwm.pin
      });

      await asyncForEach(["dir", "cdir", "brake", "enable"], async(pin, index) => {

        if (io[pin]) {
          let ioOptions = io[pin];
          const Provider = await getProvider(ioOptions, "builtin/digital");

          this.io[pin] = new Provider({
            pin: ioOptions.pin,
            mode: Provider.Output
          });
        }

      });

      this.LOW = 0;
      this.HIGH = (1 << this.io.pwm.resolution) - 1;

      return this;
    })();
  }

  /**
   * Configure a Motor
   * @returns {Motor} The instance on which the method was called
   * @param {object} options - Device configuration options
   * @param {boolean} [options.enabled = true] - Sets the enabled state of a motor
   * @param {number} [options.threshold=0.11] - The minimum speed [0, 1] that will make the motor move
   * @param {boolean} [options.invertPWM=false] - When true, PWM values will be inverted when directional motor is in reverse
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

      if (typeof options.braking !== "undefined") {
        this.#state.braking = options.braking;
      }

      if (this.#state.invertPWM && this.#state.direction === 1) {
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
      this.io.brake.digitalWrite(0);
    }

    // get current speed if nothing provided.
    speed = typeof speed !== "undefined" ? speed : this.speed();

    this.speed({
      speed: speed,
      braking: false
    });

    // "start" event is fired when the motor is started
    if (speed > 0) {
      this.emit("start");
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
    this.emit("stop");

    return this;
  };

  /**
   * Resumes moving the motor after stop, brake or disable at the most recent set speed
   * @return {Motor}
   */
  resume() {
    const speed = this.speed();
    this.speed(speed);
    return this;
  }

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
        speed: 0,
        saveSpeed: false,
        braking: true
      });
      this.emit("brake");

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
   * Releases the brake and calls resume
   * @return {Motor}
   */
  release() {
    if (typeof this.io.brake !== "undefined") {
      this.io.brake.write(0);
    }
    this.resume();
    this.emit("release");

    return this;
  };

  /**
   * Alias to forward
   * @see forward
   * @return {Motor}
   */
  fwd(speed) {
    this.forward(speed);
  };

  /**
   * Set the motor to spin forward. Note that "forward" is an arbitrary label. What it really means is that if they exist, the dir pin will be set low and cdir will be set high
   * @param {number} [speed] - The speed expressed as a value from 0 to 1
   * @return {Motor}
   */
  forward(speed = 1) {
    this.dir(0);
    this.start(speed);
    this.emit("forward");
    return this;
  };

  /**
   * Alias to reverse
   * @see reverse
   * @return {Motor}
   */
  rev(speed) {
    this.reverse(speed);
  };

  /**
   * Set the motor to spin in reverse. Note that "reverse" is an arbitrary label. What it really means is that if they exist, the dir pin will be set high and cdir will be set low
   * @param {number} [speed] - The speed expressed as a value from 0 to 1
   * @return {Motor}
   */
  reverse(speed = 1) {
    if (!this.io.dir) {
      throw "Reverse called on non-directional motor";
    }
    this.dir(1);
    this.start(speed);
    timer.setImmediate(() => this.emit("reverse"));
    return this;
  };

  /**
   * Internal method used to set the motor direction
   * @private
   * @param {number} [direction] - 0 = forward, 1 = reverse
   * @return {Motor}
   */
  dir(direction) {
    this.stop();
    this.#state.direction = direction;
    if (this.io.dir) {
      this.io.dir.write(direction);
    }
    if (this.io.cdir) {
      this.io.cdir.write(direction^1);
    }

    return this;
  };

};

export default Motor;
