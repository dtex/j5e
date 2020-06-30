/**
 * Utilities used in most IO modules. Typically called from other J5e methods, not by user code.
 * @module j5e/fn
 */

 /** Normalize parameters passed on device instantiation
 * @param {(number|string|object)} ioOpts - A pin number, pin identifier or a complete IO options object
 * @param {(number|string)} [ioOpts.pin] - If passing an object, a pin number or pin identifier
 * @param {(string|constructor)} [ioOpts.io] - If passing an object, a string specifying a path to the IO provider or a constructor
 * @param {object} [deviceOpts={}] - An object containing device options
 * @ignore
 */
export function normalizeParams(options={}) {
  return normalizeDevice(normalizeIO(options));
};

 /** Normalize IO parameters
 * @param {(number|string|object)} options - A pin number, pin identifier or a complete IO options object
 * @param {(number|string)} [ioOpts.pin] - If passing an object, a pin number or pin identifier
 * @param {(string|constructor)} [ioOpts.io] - If passing an object, a string specifying a path to the IO provider or a constructor
 * @ignore
 */
export function normalizeIO(pin={}) {
  if (typeof pin === "number" || typeof pin === "string") {
    return {pin};
  }
  return pin;
};

/** Normalize Device parameter
 * @param {object} [options={}] - An object containing device options
 * @ignore
 */
export function normalizeDevice(options={}) {
  return options;
};

/** Normalize Multi-pin Device parameter
 * @param {object} [options={}] - An object containing device options
 * @ignore
 */
export function normalizeMulti(options={}) {
  if (!Array.isArray(options)) {
    let {io, pins, ...rest} = options;
    // Loop through the pins property array and make sure each is an object
    pins = options.pins.map(pin => normalizeIO(pin));
    // If IO is defined on options use it as default
    if (io) {
      pins.forEach(pin => pin.io = pin.io || io);
    }

    // Copy each property that is not ```pins``` onto each member of the pins array
    return pins.map(pin => Object.assign(pin, rest));
  } else {
    return options.map(pin => normalizeIO(pin));
  }
};

/** Wait for an async forEach loop. Does not run in parallel.
 * @param {array[]} array - An input array
 * @param {function} callback - A function to execute when iteration is complete
 * @author Sebastien Chopin
 * @see {@link https://codeburst.io/javascript-async-await-with-foreach-b6ba62bbf404|Sebastien's Medium article} for more information
 * @example
 * const waitFor = (ms) => new Promise(r => setTimeout(r, ms));
 * 
 * await asyncForEach([1, 2, 3], async (num) => {
 *   await waitFor(50);
 *   console.log(num);
 * });
 * console.log('Done');
 */
export async function asyncForEach(array, callback) {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array);
  }
};

/**
 * Map a value (number) from one range to another. Based on Arduino's map().
 *
 * @param {Number} value    - value to map
 * @param {Number} fromLow  - low end of originating range
 * @param {Number} fromHigh - high end of originating range
 * @param {Number} toLow    - low end of target range
 * @param {Number} toHigh   - high end of target range
 * @return {Number} mapped value (integer)
 * @example
 * Fn.map(500, 0, 1000, 0, 255); // -> 127
 */
export function map(value, fromLow, fromHigh, toLow, toHigh) {
  return ((value - fromLow) * (toHigh - toLow) / (fromHigh - fromLow) + toLow) | 0;
};

const f32A = new Float32Array(1);
/**
 * Like map, but returns a Float32
 *
 * @param {Number} value    - value to map
 * @param {Number} fromLow  - low end of originating range
 * @param {Number} fromHigh - high end of originating range
 * @param {Number} toLow    - low end of target range
 * @param {Number} toHigh   - high end of target range
 * @return {Float32}
 */
export function fmap(value, fromLow, fromHigh, toLow, toHigh) {
  f32A[0] = (value - fromLow) * (toHigh - toLow) / (fromHigh - fromLow) + toLow;
  return f32A[0];
};

/** Constrain a value to a range. 
 * @param {number} value - An input value
 * @param {number} low - The minimum allowed value (inclusive)
 * @param {number} high - The maximum allowed value (inclusive)
 * @return {Number} constrained value
 * @example
 * constrain(120, 0, 100); // -> 100
 */
export function constrain(value, low, high) {
  if (value > high) value = high;
  if (value < low) value = low;
  return value;
};

/** Asynchronously load a provider. This allows users to simply pass a path or skip specifying a provider altogether (uses builtins).
 * @param {object} ioOpts - An IO options object
 * @param {io} [ioOpts.io] - The path to the IO class
 * @param {string} defaultProvider - The default provider to use if none was passed in the io object
 * @ignore
 */ 
 export async function getProvider(ioOpts, defaultProvider) {
  if (!ioOpts.io || typeof ioOpts.io === "string") {
    const Provider = await import(ioOpts.io || defaultProvider);
    return Provider.default;
  } else {
    return ioOpts.io;
  }
}

/** Wrapper for setInterval, clearInterval, and setImmediate. This is necessary so we can use the Global methods in node.js and the System methods in XS.
 * @namespace timer
 */
export const timer = {
  
  /**
   * Execute a callback on a recurring interval
   * @function setInterval
   * @memberof timer
   * @param {function} callback
   * @param {Number} duration
   * @returns {Interval}
   * @example
   * <caption>Blink an LED (We're pretending Led.blink() doesn't exist here)</caption>
   * import LED from "j5e/led";
   * import {timer} from "j5e/fn";
   *
   * const led = await new LED(12);
   * 
   * timer.setInterval(function() {
   *   led.toggle();
   * }, 100);
   */ 
  setInterval(callback, duration) {
    if (global && global.setInterval) {
      return global.setInterval(callback, duration);
    }
    if (typeof System !== "undefined" && System.setInterval) {
      return System.setInterval(callback, duration);
    }
  },

  /**
   * Stop a recurring interval
   * @function clearInterval
   * @memberof timer
   * @param {Interval} identifier
   * @example
   * <caption>Blink an LED for one second and then stop (We're pretending Led.blink() doesn't exist here)</caption>
   * import LED from "j5e/led";
   * import {timer} from "j5e/fn";
   *
   * const led = await new LED(12);
   * 
   * let myTimer = timer.setInterval(function() {
   *   led.toggle();
   * }, 100)
   * 
   * timer.setTimeout(function() {
   *   timer.clearInterval(myTimer);
   * }, 1000);
   */ 
  clearInterval(identifier) {
    if (global && global.clearInterval) {
      return global.clearInterval(identifier);
    }
    if (typeof System !== "undefined" && System.clearInterval) { //} && identifier.timer) {
      return System.clearInterval(identifier);
    }
  },

  /**
   * Execute a callback after a specified period of time
   * @function setInterval
   * @memberof timer
   * @param {function} callback
   * @param {Number} duration
   * @returns {Timer}
   * @example
   * <caption>Blink an LED for one second and then stop</caption>
   * import LED from "j5e/led";
   * import {timer} from "j5e/fn";
   *
   * const led = await new LED(12);
   * led.blink();
   * 
   * timer.setTimeout(function() {
   *   led.stop();
   * }, 1000);
   */ 
  setTimeout(callback, duration) {
    if (global && global.setTimeout) {
      return global.setTimeout(callback, duration);
    }
    if (typeof System !== "undefined" && System.setTimeout) {
      return System.setTimeout(callback, duration);
    }
  },
  /**
   * Stop a timeout before it occurs
   * @function clearTimeout
   * @memberof timer
   * @param {Interval} identifier
   * @example
   * <caption>Clear a debounce timeout</caption>
   * import LED from "j5e/led";
   * import {timer} from "j5e/fn";
   *
   * const debounce = (f, ms) => {
   *   let timeout;
   *   return (...args) => {
   *     if (timeout) {
   *       timer.clearTimeout(timeout);
   *     }
   *     timeout = timer.setTimeout(() => {
   *       timeout = null;
   *       f(...args);
   *     }, ms);
   *   };
   * };
   */
  clearTimeout(callback, duration) {
    if (global && global.clearTimeout) {
      return global.clearTimeout(callback, duration);
    }
    if (typeof System !== "undefined" && System.clearTimeout) {
      return System.clearTimeout(callback, duration);
    }
  },
  /**
   * Execute a callback on next tick
   * @function setImmediate
   * @memberof timer
   * @param {function} callback
   */
  setImmediate(callback) {
    if (typeof process !== "undefined" && process.setImmediate) {
      setImmediate(callback);
    }
    if (typeof System !== "undefined" && System.setTimeout) {
      System.setTimeout(callback);
    }
  }

};

/** left Pad a Number with zeros
 * @param {number} value - An input value
 * @param {number} length - The desired length
 * @return {String} The padded string
 * @example
 * pad(3, 2); // -> "03"
 */
export function pad(value, length) {
  return String(value).padStart(length, "0");
}
