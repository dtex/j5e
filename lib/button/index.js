/**
 * For working with buttons
 * @module j5e/button
 * @description A module for working with buttons.
 * @requires module:j5e/event
 * @requires module:j5e/fn
 * @link https://en.wikipedia.org/wiki/Push-button
 */

import { Emitter } from "j5e/event";
import { getIO, debounce, normalizeDevice, timer } from "j5e/fn";

/**
 * Class representing a button
 * @classdesc The Button class allows for control of digital buttons
 * @async
 * @extends module:j5e/event.Emitter
 * @fires Button#open
 * @fires Button#close
 */
class Button extends Emitter {

  #state = {
    holdtime: null,
    last: null,
    isPullup: null,
    normallyClosed: null,
    interval: null
  };

  /**
   * Instantiate a button
   * @param {number|string|object} io - Pin identifier or IO Options (See {@link https://j5e.dev/core-concepts/instantiation/|instantiation})
   * @example
   * // Use a button to control an LED
   * import Button from "j5e/button";
   * import LED from "j5e/led";
   *
   * const button = await new Button(12);
   * const led = await new LED(13);
   *
   * button.on("open", function() {
   *   led.off();
   * });
   *
   * button.on("close", function() {
   *   led.on();
   * });
   */
  constructor(io) {
    return (async() => {

      super();

      this.#state.isPullup = io.mode === "InputPullUp";

      this.io = await getIO(io, {
        type: "Digital",
        mode: "Input",
        edge: ["Rising", "Falling"],
        onReadable: () => {
          this.trigger();
        }
      });

      this.configure({
        debounce: 7,
        holdtime: 500,
        normallyClosed: false
      });

      this.#state.last = this.upValue;

      return this;
    })();

  }

  /**
   * Configure a button
   * @returns {Button} The instance on which the method was called
   * @param {object} options - Device configuration options
   * @param {number} [options.holdtime=500] - The amount of time a button must be held down before emitting an hold event
   * @param {number} [options.debounce=7] - The amount of time in milliseconds to delay button events firing. Cleans up "noisy" state changes
   * @param {string} [options.type="NO"] - The type of button, "NO" for normally open, "NC" for normally closed
   * @example
   * import Button from "j5e/button";
   * import LED from "j5e/led";
   *
   * const button = await new Button(14);
   * button.configure({
   *   debounce: 20
   * });
   *
   * button.on("open", function() {
   *   led.off();
   * });
   *
   * button.on("close", function() {
   *   led.on();
   * });
   */
  configure(options) {
    options = normalizeDevice(options);

    if (typeof options.normallyClosed !== "undefined") {
      this.#state.normallyClosed = options.normallyClosed;
    }
    this.#state.holdtime = options.holdtime || this.#state.holdtime;
    this.#state.debounce = options.debounce || this.#state.debounce;

    this.trigger = debounce(this.processRead.bind(this), this.#state.debounce);

    return this;
  }

  /**
   * True if the button is being pressed
   * @type {boolean}
   * @readonly
   */
  get isClosed() {
    return this.io.read() === this.downValue;
  }

  /**
   * True if the button is not being pressed
   * @type {boolean}
   * @readonly
   */
  get isOpen() {
    return this.io.read() === this.upValue;
  }

  /**
   * Get the raw downValue (depends on type and io input mode)
   * @type {number}
   * @readonly
   */
  get downValue() {
    return 1 ^ this.#state.isPullup ^ this.#state.normallyClosed;
  }

  /**
   * Get the raw upValue (depends on type and io input mode)
   * @type {number}
   * @readonly
   */
  get upValue() {
    return 0 ^ this.#state.isPullup ^ this.#state.normallyClosed;
  }

  /**
   * The length of time a button must be held before firing a hold event (in ms)
   * @type {number}
   */
  get holdtime() {
    return this.#state.holdtime;
  }

  set holdtime(newHoldtime) {
    this.#state.holdtime = newHoldtime;
  }

  intialize() { }

  processRead() {
    if (this.isOpen) {
      this.emit("open");
      timer.clearTimeout(this.#state.interval);
    } else {
      this.emit("close");
      this.#state.interval = timer.setTimeout(() => {
        this.#state.interval = null;
        if (this.isClosed) {
          this.emit("hold");
        }
      }, this.#state.holdtime);
    }
  }
}

export default Button;
