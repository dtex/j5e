/**
 * Utilities used in most IO modules.
 * @module j5e/fn
 * @ignore
 */

/** Get the io instance
 * @param {(object|string|object|IO)} ioOpts - A pin number, pin identifier or a complete IO options object
 * @param {string} [ioType] - type of IO
 */
export async function getIO(ioOpts, ioDefaults) {
  if (typeof ioDefaults === "string") {
    ioDefaults = {
      type: ioDefaults
    };
  }
  // && typeof "ioOpts.constructor.name !== "undefined"" is because of https://github.com/Moddable-OpenSource/moddable/issues/914
  if (typeof ioOpts === "object" && ioOpts.constructor.name !== "Object" && typeof ioOpts.constructor.name !== "undefined") {
    // This is an IO instance
    return ioOpts;
  }

  ioOpts = normalizeIO(ioOpts, ioDefaults);
  const Provider = await getProvider(ioOpts, ioDefaults.type);

  ["edge", "mode", "type"].forEach(key => {
    if (ioOpts[key]) {
      if (!Array.isArray(ioOpts[key])) {
        ioOpts[key] = [ioOpts[key]];
      }

      ioOpts[key] = ioOpts[key].map(prop => {
        if (typeof prop === "string") {
          return Provider[prop];
        } else {
          return prop;
        }
      });
      ioOpts[key] = ioOpts[key].reduce((acc, curr) => {
        return acc + curr;
      }, 0);
    }
  });

  const io = await new Provider(ioOpts);
  return io;
};

/** Normalize parameters passed on device instantiation
 * @param {(number|string|object)} ioOpts - A pin number, pin identifier or a complete IO options object
 * @param {(number|string)} [ioOpts.pin] - If passing an object, a pin number or pin identifier
 * @param {(string|constructor)} [ioOpts.io] - If passing an object, a string specifying a path to the IO provider or a constructor
 * @param {object} [deviceOpts={}] - An object containing device options
 * @ignore
 */
export function normalizeParams(options = {}) {
  return normalizeDevice(normalizeIO(options));
};

/** Normalize IO parameters
 * @param {(number|string|object)} options - A pin number, pin identifier, a complete IO options object, or an IO instance
 * @param {(number|string)} [ioOpts.pin] - If passing an object, a pin number or pin identifier
 * @param {(string|constructor)} [ioOpts.io] - If passing an object, a string specifying a path to the IO provider or a constructor
 * @ignore
 */
export function normalizeIO(ioOptions = null, ioDefaults = {}) {

  if (ioOptions === null) {
    return ioOptions;
  }

  if (typeof ioOptions === "number" || typeof ioOptions === "string") {
    ioOptions = { pin: ioOptions };
  }
  if (typeof ioDefaults === "number" || typeof ioDefaults === "string") {
    ioDefaults = { mode: ioDefaults };
  }
  if (Array.isArray(ioOptions)) {
    ioOptions = { pins: ioOptions };
  }

  ioOptions = Object.assign(ioDefaults, ioOptions);
  return ioOptions;
};

/** Normalize Device parameter
 * @param {object} [options={}] - An object containing device options
 * @ignore
 */
export function normalizeDevice(options = {}) {
  return options;
};

/** Normalize Multi-pin Device parameter
 * @param {object} [options={}] - An object containing device options
 * @ignore
 */
export function normalizeMulti(options = {}) {
  if (!Array.isArray(options)) {
    let { io, pins, ...rest } = options;
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
 * Truncates the returned value to an integer
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
  return (((value - fromLow) * (toHigh - toLow) / (fromHigh - fromLow) + toLow) | 0);
};

/**
 * Like map, but does not truncate the returned value
 *
 * @param {Number} value    - value to map
 * @param {Number} fromLow  - low end of originating range
 * @param {Number} fromHigh - high end of originating range
 * @param {Number} toLow    - low end of target range
 * @param {Number} toHigh   - high end of target range
 * @return {Number}
 */
export function fmap(value, fromLow, fromHigh, toLow, toHigh) {
  return (value - fromLow) * (toHigh - toLow) / (fromHigh - fromLow) + toLow;
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
  if (value > high) {
    value = high;
  }
  if (value < low) {
    value = low;
  }
  return value;
};

/** Asynchronously load a provider. This allows users to simply pass a path or skip specifying a provider altogether (uses builtins).
 * @param {object} ioOpts - An IO options object
 * @param {string|io} [ioOpts.io] - The path to the IO class or an io instance
 * @param {string} defaultProvider - The default provider to use if none was passed in the io object
 * @ignore
 */
export async function getProvider(ioOpts, ioType) {
  if (!ioOpts) {
    return null;
  }
  if (ioOpts.io) {
    if (typeof ioOpts.io === "string") {
      const Provider = await import(ioOpts.io);
      return Provider;
    } else {
      return ioOpts.io;
    }
  }
  return defaultProvider(ioType);
}

/** Divine the default provider and return constructor for desired io type
 * @param {string} ioType - The desired io type
 * @ignore
 */
export async function defaultProvider(ioType) {
  let defaultProvider = device.io;
  return defaultProvider[ioType];
}

/** Wrapper for setInterval, clearInterval, and setImmediate. This is necessary so we can use the Global methods in node.js and the System methods in XS.
 * @namespace timer
 */
export const timer = Object.freeze({

  /**
   * Execute a callback on a recurring interval
   * @function setInterval
   * @memberof timer
   * @param {function} callback
   * @param {Number} duration
   * @returns {Interval}
   * @example
   * // Blink an LED (We're pretending Led.blink() doesn't exist here)
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
   * // Blink an LED for one second and then stop (We're pretending Led.blink() doesn't exist here)
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
    if (typeof System !== "undefined" && System.clearInterval) {
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
   * // Blink an LED for one second and then stop
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
   * // Clear a debounce timeout
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
  clearTimeout(identifier) {
    if (global && global.clearTimeout) {
      return global.clearTimeout(identifier);
    }
    if (typeof System !== "undefined" && System.clearTimeout && identifier) {
      return System.clearTimeout(identifier);
    }
  },
  /**
   * Execute a callback on next tick
   * @function setImmediate
   * @memberof timer
   * @param {function} callback
   */
  setImmediate(callback) {
    if (typeof process !== "undefined" && global.setImmediate) {
      global.setImmediate(callback);
    }
    if (typeof System !== "undefined" && System.setTimeout) {
      System.setTimeout(callback);
    }
  },
  /** Blocking pause, used when we need to wait a very short period of time
   * i.e. waiting for a peripheral to respond to a command
   * @param {number} ms - Number of milliseconds to wait
   */
  sleep(ms) {
    new Promise(resolve => this.setTimeout(resolve, ms));
  }

});

/** Debounce a function so that it is not invoked unless it stops being called for N milliseconds
 * @function debounce
 * @param {function} func The function to be debounced
 * @param {number} wait The number of milliseconds to wait
 * @param {boolean} [immediate]  Triggers the function on the leading edge
 * @returns {function}
 * @author David Walsh
 * @see {@link https://davidwalsh.name/javascript-debounce-function} For more information
 */
export function debounce(func, wait, immediate) {
  let timeout;
  return () => {
    const args = arguments;

    const later = () => {
      timeout = null;
      if (!immediate) {
        func.apply(this, args);
      };
    };

    let callNow = immediate && !timeout;

    timer.clearTimeout(timeout);
    timeout = timer.setTimeout(later, wait);

    if (callNow) {
      func.apply(this, args);
    }
  };
};


/** Format a number such that it has a given number of digits after the
 * decimal point
 *
 * @param {Number} number - The number to format
 * @param {Number} [digits = 0] - The number of digits after the decimal point
 * @return {Number} Formatted number
 * @example
 * Fn.toFixed(5.4564, 2); // -> 5.46
 * @example
 * Fn.toFixed(1.5, 2); // -> 1.5
 */
export function toFixed(number, digits) {
  return +(number || 0).toFixed(digits);
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
