/**
 * For working with switches
 * @module j5e/switch
 * @description A module for working with switches. It will emit open and close events when the state of a mechanical switch changes.
 * @requires module:j5e/event
 * @requires module:j5e/fn
 * @link https://en.wikipedia.org/wiki/Switch
 */

import { Emitter } from "j5e/event";
import { normalizeDevice, normalizeIO, getProvider } from "j5e/fn";

/**
 * Class representing a switch
 * @classdesc The Switch class allows for control of digital switches
 * @async
 * @extends module:j5e/event.Emitter
 * @fires Switch#open
 * @fires Switch#close
 */
class Switch extends Emitter {

  #state = {
    isPullup: null,
    normallyClosed: null
  };

  /**
   * Instantiate a switch
   * @param {number|string|object} io - Pin identifier or IO Options (See {@link https://j5e.dev/core-concepts/instantiation/|instantiation})
   * @param {number|string} [io.mode=Input] - Device configuration options. If a number, a valid value based on the Provider's constants. If a string, one of "Input", "InputPullUp", or "InputPullDown"
   * @example
   * // Use a switch to control an LED
   * import Switch from "j5e/switch";
   * import LED from "j5e/led";
   *
   * const mySwitch = await new Switch(12);
   * const led = await new LED(13);
   *
   * mySwitch.on("open", function() {
   *   led.off();
   * });
   *
   * mySwitch.on("close", function() {
   *   led.on();
   * });
   */
  constructor(io) {
    return (async() => {
      io = normalizeIO(io);
      super();

      const Provider = await getProvider(io, "Digital");

      let mode = Provider.Input;
      if (typeof io.mode !== "undefined") {
        if (typeof io.mode === "string") {
          mode = Provider[io.mode];
        } else {
          mode = io.mode;
        }
      }

      this.#state.isPullup = mode === Provider.InputPullUp;

      this.io = new Provider({
        pin: io.pin,
        mode,
        edge: Provider.Rising | Provider.Falling,
        onReadable: () => {
          this.emit(this.isOpen ? "open" : "close");
        }
      });

      this.configure();

      return this;
    })();

  }

  /**
   * True if the switch is closed (current is flowing)
   * @returns {boolean}
   * @readonly
   */
  get isClosed() {
    return (Boolean(this.io.read()) ^ this.#state.isPullup);
  }

  /**
   * True if the switch is open (current is not flowing)
   * @returns {boolean}
   * @readonly
   */
  get isOpen() {
    return !(Boolean(this.io.read()) ^ this.#state.isPullup);
  }

  /**
   * Configure a switch - Noop
   * @returns {Switch} The instance on which the method was called
   * @param {object} options - Device configuration options
   * @private
   * @example
   * import Button from "j5e/button";
   * import LED from "j5e/led";
   *
   * const button = await new Button(14);
   * button.configure();
   *
   * button.on("open", function() {
   *  led.off();
   * });
   *
   * button.on("close", function() {
   *  led.on();
   * });
   */
  configure(options = {}) {

    return this;

  }

}

export default Switch;
