/**
 * Class library for controlling LED's (Light Emitting Diodes). Connect the LED to a digital IO for on/off functionality. Use a PWM IO for varying brightness.
 * @description A module for controlling LED's using PWM.
 * @module j5e/led
 * @requires module:j5e/animation
 * @requires module:j5e/easing
 * @requires module:j5e/fn
 * @link https://en.wikipedia.org/wiki/Light-emitting_diode
 * @link https://en.wikipedia.org/wiki/Pulse-width_modulation
 */

import { getIO, normalizeDevice, constrain, map, timer } from "j5e/fn";
import { inOutSine, outSine } from "j5e/easing";
import Animation from "j5e/animation";

/**
 * The Led class constructs objects that represent a single Led attached to the physical board. Connect the LED to a digital IO for on/off functionality. Use a PWM IO for varying brightness.
 * @classdesc The LED class allows for control of Light Emitting Diodes
 * @async
 */
class LED {

  #state = {
    sink: false,
    isRunning: false,
    value: 0,
    direction: 1,
    interval: null
  };

  /**
   * Instantiate an LED
   * @param {number|string|object} io - Pin identifier or IO Options (See {@link https://j5e.dev/core-concepts/instantiation/|instantiation})
   * @example
   * // Using a pin number
   * import LED from "j5e/led";
   *
   * const led = await new LED(12);
   * led.on();
   *
   * @example
   * // Using a pin identifier string
   * import LED from "j5e/led";
   *
   * const led = await new LED("A1");
   * led.on();
   *
   * @example
   * // Using device options
   * import LED from "j5e/led";
   *
   * const led = await new LED(12);
   * led.configure({
   *   pwm: true
   * });
   * led.on();
   */
  constructor(io) {
    return (async() => {

      this.io = await getIO(io, "PWM", "Output");
      this.LOW = 0;

      if (this.io.resolution) {
        this.HIGH = (1 << this.io.resolution) - 1;
      } else {
        this.HIGH = 1;
      }

      this.configure();

      return this;
    })();
  }

  /**
   * Configure an LED
   * @returns {LED} The instance on which the method was called
   * @param {object} options - Device configuration options
   * @param {number} [options.sink=false] - True if an element is wired for sink drive
   * @example
   * import LED from "j5e/led";
   *
   * const led = await new LED(14);
   * led.configure({
   *   sink: true
   * });
   *
   * // With sink: true, led.on() sets pin 14 low
   * led.on();
   */
  configure(options = {}) {
    options = normalizeDevice(options);

    if (typeof options.sink !== "undefined") {
      this.#state.sink = options.sink;
    }

    return this;
  }

  /**
   * The current value of the LED
   * @type {number}
   * @readonly
   */
  get value() {
    return this.#state.value;
  }

  /**
   * Wether the LED is on
   * @type {boolean}
   * @readonly
   */
  get isOn() {
    return !!this.#state.value;
  }

  /**
   * True if the LED is blinking, pulsing or animating
   * @type {boolean}
   * @readonly
   */
  get isRunning() {
    return this.#state.isRunning;
  };

  /**
   * Internal method that writes the current LED value to the IO
   * @access private
   */
  write() {
    let value = constrain(this.#state.value, 0, 1);
    if (this.#state.sink) {
      value = 1 - value;
    }
    value = map(value, 0, 1, this.LOW, this.HIGH);
    this.io.write(value);
  }

  /**
   * Turn an led on
   * @returns {LED} The instance on which the method was called
   * @example
   * import LED from "j5e/led";
   *
   * const led = await new LED(12);
   * led.on();
   */
  on() {
    this.#state.value = 1;
    this.write();
    return this;
  }

  /**
   * Turn an led off
   * @return {LED}
   * @example
   * import LED from "j5e/led";
   * import {timer} from "j5e/fn";
   *
   * const led = await new LED(12);
   * led.on();
   *
   * // Wait one second and turn the led off
   * timer.setTimeout(function() {
   *   led.off();
   * }, 1000);
   */
  off() {
    this.#state.value = 0;
    this.write();
    return this;
  }

  /**
   * Toggle the on/off state of an led
   * @return {LED}
   * @example
   * import LED from "j5e/led";
   * import {timer} from "j5e/fn";
   *
   * const led = await new LED(12);
   * led.toggle(); // It's on!
   *
   * // Wait one second and turn the led off
   * timer.setTimeout(function() {
   *   led.toggle(); // It's off!
   * }, 1000)
   */
  toggle() {
    return this[this.isOn ? "off" : "on"]();
  }

  /**
   * Blink the LED on a fixed interval
   * @param {Number} duration=100 - Time in ms on, time in ms off
   * @param {Function} callback - Method to call on blink
   * @return {LED}
   * @example
   * import LED from "j5e/led";
   *
   * const led = await new LED(12);
   * led.blink(1000);
   */
  blink(duration = 100, callback) {
    // Avoid traffic jams
    this.stop();

    if (typeof duration === "function") {
      callback = duration;
      duration = 100;
    }

    this.#state.isRunning = true;

    this.#state.interval = timer.setInterval(() => {
      this.toggle();
      if (typeof callback === "function") {
        callback();
      }
    }, duration);

    return this;
  }

  /**
   * Set the brightness of an led
   * @param {Number} value - Brightness value [0, 1]
   * @return {LED}
   * @example
   * import LED from "j5e/led";
   *
   * const led = await new LED(12, {
   *   pwm: true
   * });
   * led.brightness(0.5);
   */
  brightness(value) {
    this.#state.value = value;
    this.write();
    return this;
  }

  /**
   * Set the brightness of an led 0-100
   * @param {Integer} value - Brightness value [0, 100]
   * @return {LED}
   * @example
   * import LED from "j5e/led";
   *
   * const led = await new LED(12, {
   *   pwm: true
   * });
   * led.intensity(50);
   */
  intensity(value) {
    this.#state.value = map(value, 0, 100, 0, 1);
    this.io.write(value);
    return this;
  }

  /**
   * Fade an led from its current value to a new value (Requires ```pwm: true```)
   * @param {Number} val Target brightness value
   * @param {Number} [time=1000] Time in ms that a fade will take
   * @param {function} [callback] A function to run when the fade is complete
   * @return {LED}
   * @example
   * import LED from "j5e/led";
   *
   * const led = await new LED(12, {
   *   pwm: true
   * });
   * led.fade(512);
   */
  fade(val, time = 1000, callback) {

    this.stop();

    const options = {
      duration: typeof time === "number" ? time : 1000,
      keyFrames: [null, typeof val === "number" ? val : 1],
      easing: outSine,
      oncomplete: function() {
        this.stop();
        if (typeof callback === "function") {
          callback();
        }
      }
    };

    if (typeof val === "object") {
      Object.assign(options, val);
    }

    if (typeof val === "function") {
      callback = val;
    }

    if (typeof time === "object") {
      Object.assign(options, time);
    }

    if (typeof time === "function") {
      callback = time;
    }

    this.animate(options);

    return this;
  }

  /**
   * fadeIn Fade an led in to full brightness (Requires ```pwm: true```)
   * @param {Number} [time=1000] Time in ms that a fade will take
   * @param {function} [callback] A function to run when the fade is complete
   * @return {LED}
   * @example
   * // Fade an LED to full brightness over half a second
   * import LED from "j5e/led";
   *
   * const led = await new LED(12, {
   *   pwm: true
   * });
   * led.fadeIn(500);
   */
  fadeIn(time = 1000, callback) {
    return this.fade(1, time, callback);
  }

  /**
   * fadeOut Fade an led out until it is off (Requires ```pwm: true```)
   * @param {Number} [time=1000] Time in ms that a fade will take
   * @param {function} [callback] A function to run when the fade is complete
   * @return {LED}
   * @example
   * // Fade an LED out over half a second
   * import LED from "j5e/led";
   *
   * const led = await new LED(12, {
   *   pwm: true
   * });
   * led.on();
   * led.fadeOut(500);
   */
  fadeOut(time = 1000, callback) {
    return this.fade(0, time, callback);
  }

  /**
   * Pulse the LED in and out in a loop with specified time using ```inOutSine``` easing (Requires ```pwm: true```)
   * @param {number} [time=1000] Time in ms that a fade in/out will elapse
   * @param {function} [callback] A function to run each time the direction of pulse changes
   * @return {LED}
   * @example
   * // Pulse an LED on a half second interval
   * import LED from "j5e/led";
   *
   * const led = await new LED(12, {
   *   pwm: true
   * });
   * led.pulse(500);
   */
  pulse(time = 1000, callback) {

    let options = {
      duration: typeof time === "number" ? time : 1000,
      keyFrames: [0, 1],
      metronomic: true,
      loop: true,
      easing: inOutSine,
      onloop: function() {
        /* istanbul ignore else */
        if (typeof callback === "function") {
          callback();
        }
      }
    };

    if (typeof time === "object") {
      Object.assign(options, time);
    }

    if (typeof time === "function") {
      callback = time;
    }

    return this.animate(options);

  }

  /**
   * Animate the LED by passing in a segment options object
   * @param {Object} options (See {@link https://j5e.dev/core-concepts/animation/|animation})
   * @return {LED}
   * @example
   * // Animate an LED using an animation segment options object
   * import LED from "j5e/led";
   *
   * const led = await new LED(12, {
   *   pwm: true
   * });
   * led.animate({
   *   duration: 4000,
	 *   cuePoints: [0,  0.33, 0.66, 1],
	 *   keyFrames: [0, 0.75, 0.25, 1],
	 *   loop: true,
   *   metronomic: true
   * });
   */
  animate(options) {
    // Avoid traffic jams
    this.stop();

    this.#state.isRunning = true;

    this.#state.animation = this.#state.animation || new Animation(this);
    this.#state.animation.enqueue(options);
    return this;
  }

  /**
   * stop Stop the led from blinking, pulsing, fading, or animating
   * @return {LED}
   * @example
   * Pulse an LED and then stop after five seconds
   * import {timer} from "j5e/fn";
   * import LED from "j5e/led";
   *
   * const led = await new LED(12, {
   *   pwm: true
   * });
   * led.pulse(500);
   *
   * // Stop pulsing after five seconds
   * timer.setTimeout(function() {
   *   led.stop();
   * }, 5000);
   */
  stop() {

    if (this.#state.interval) {
      timer.clearInterval(this.#state.interval);
    }

    if (this.#state.animation) {
      this.#state.animation.stop();
    }

    this.#state.interval = null;
    this.#state.isRunning = false;

    return this;
  };

  /**
   * @param [number || object] keyFrames An array of step values or a keyFrame objects
   * @access private
   */
  normalize(keyFrames) {

    // If user passes null as the first element in keyFrames use current value
    /* istanbul ignore else */
    if (keyFrames[0] === null) {
      keyFrames[0] = {
        value: this.#state.value || 0
      };
    }

    return keyFrames.map(function(frame) {
      let value = frame;
      /* istanbul ignore else */
      if (frame !== null) {
        // frames that are just numbers represent values
        if (typeof frame === "number") {
          frame = {
            value: value,
          };
        } else {
          if (typeof frame.brightness === "number") {
            frame.value = frame.brightness;
            delete frame.brightness;
          }
          if (typeof frame.intensity === "number") {
            frame.value /= 100;
            delete frame.intensity;
          }
        }

      }
      return frame;
    });
  }

  /**
   * @position [number] value to set the led to
   * @access private
   */
  render(position) {
    this.#state.value = position[0];
    return this.write();
  };

};

export default LED;
