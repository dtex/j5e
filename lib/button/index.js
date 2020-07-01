/**
 * For working with buttons
 * @module j5e/button
 * @requires module:j5e/event
 * @requires module:j5e/fn
 */

import { Emitter } from "j5e/event";
import {debounce, normalizeParams, getProvider, timer} from "j5e/fn";

const aliases = {
  down: ["down", "press"],
  up: ["up", "release"]
};

/** 
 * Class representing a button
 * @classdesc The Button class allows for control of digital buttons
 * @async
 * @extends Emitter
 * @fires Button#open
 * @fires Button#close
 */
class Button extends Emitter {
  
  #state = {
    holdtime: null,
    last: null,
    isPullup: null,
    interval: null
  };

  /**
   * Instantiate a button
   * @param {object} options - A pin number, pin identifier or a complete IO options object (See {@tutorial C-INSTANTIATING}
   * @param {boolean} [options.invert=false] - Inverts the up and down values
   * @param {boolean} [options.isPullup=false] - Initialize as a pullup button
   * @param {boolean} [options.isPulldown=false] - Initialize as a pulldown button
   * @param {number} [options.holdtime=500] - The amount of time a button must be held down before emitting an hold event
   * @property {boolean} isClosed - True if the button is being pressed
   * @property {boolean} isOpen - True if the button is not being pressed
   * @property {number} downValue - Get the raw downValue (depends on invert, isPullup and isPulldown)
   * @property {number} upValue - Get the raw upValue (depends on invert, isPullup and, isPulldown)
   * @property {number} holdtime - Get/Set the holdtime
   * @example
   * <caption>Use a button to control an LED</caption>
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
  constructor(options) { 
    return (async () => {

      let raw;
      let invert = false;
      
      options = normalizeParams(options);
      super();
      
      const Provider = await getProvider(options, "builtin/digital");
      
      let mode = Provider.Input;
      if (!options.isPullup) mode = Provider.InputPullUp;
      if (!options.isPulldown) mode = Provider.InputPullDown;
      
      this.io = new Provider({
        pin: options.pin,
        mode,
        edge: Provider.Rising | Provider.Falling,
        onReadable: () => { this.trigger(); }
      });

      Object.defineProperties(this, {
        isClosed: {
          get: () => {
            return this.io.read() === this.downValue;
          }
        },
        isOpen: {
          get: () => {
            return this.io.read() === this.upValue;
          }
        },
        downValue: {
          get: () => {
            return 1 ^ this.isPullup ^ this.invert;
          }
        },
        upValue: {
          get: () => {
            return 0 ^ this.isPullup ^ this.invert;
          }
        },
        holdtime: {
          get: () => {
            return this.#state.holdtime;
          },
          set: (newHoldtime) => {
            this.#state.holdtime = newHoldtime;
          }
        }
      });

      if (typeof options.invert !== "undefined") {
        this.invert = options.invert;
      }

      if (typeof options.isPullup !== "undefined") {
        this.#state.isPullup = options.isPullup;
      }
      if (typeof options.isPulldown !== "undefined") {
        this.#state.isPulldown = options.isPulldown;
      }

      this.#state.holdtime = options.holdtime || 500;

      this.#state.last = this.upValue;
      
      // Create a debounce boundary on event triggers
      // this avoids button events firing on
      // press noise and false positives
      // this.trigger = debounce(send, 7);
      this.trigger = debounce(this.processRead.bind(this), 7);
      return this;
    })();
    
  }

  intialize(options, callback) { }

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