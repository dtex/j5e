/**
 * fn module - Utilities used in most IO modules. Typically called from other J5e methods.
 * @module j5e/fn
 */

 /** Normalize parameters passed on device instantiation
 * @param {(number|string|object)} ioOpts - A pin number, pin identifier or a complete IO options object
 * @param {(number|string)} [ioOpts.pin] - If passing an object, a pin number or pin identifier
 * @param {(string|constructor)} [ioOpts.io] - If passing an object, a string specifying a path to the IO provider or a constructor
 * @param {object} [deviceOpts={}] - An object containing device options
 */
export function normalizeParams(ioOpts={}, deviceOpts={}) {
  ioOpts = normalizeIO(ioOpts);
  deviceOpts = normalizeDevice(deviceOpts);
  return { ioOpts, deviceOpts }
};

 /** Normalize I/O parameters
 * @param {(number|string|object)} ioOpts - A pin number, pin identifier or a complete IO options object
 * @param {(number|string)} [ioOpts.pin] - If passing an object, a pin number or pin identifier
 * @param {(string|constructor)} [ioOpts.io] - If passing an object, a string specifying a path to the IO provider or a constructor
 */
export function normalizeIO(ioOpts={}) {
  //trace(typeof ioOpts)
  //trace(ioOpts);
  //console.log(typeof ioOpts)
  //console.log(ioOpts);
  if (typeof ioOpts === "number" || typeof ioOpts === "string") {
    let result = {pin: ioOpts};
    return result;
  }
  return ioOpts;
};

/** Normalize Device parameter
 * @param {object} [deviceOpts={}] - An object containing device options
 */
export function normalizeDevice(deviceOpts={}) {
  return deviceOpts;
};

/** Constrain a value to a range. 
 * @param {number} value - An input value
 * @param {number} low - The minimum allowed value (inclusive)
 * @param {number} high - The maximum allowed value (inclusive)
 */
export function constrain(value, low, high) {
  if (value > high) value = high;
  if (value < low) value = low;
  return value;
};

/** Wait for and async forEach loop
 * @param {array[]} array - An input array
 * @param {function} callback - A function to execute when iteration is complete
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
 * Fn.map(500, 0, 1000, 0, 255); // ->
 */
export function map(value, fromLow, fromHigh, toLow, toHigh) {
  return ((value - fromLow) * (toHigh - toLow) / (fromHigh - fromLow) + toLow) | 0;
};

/** Asynchronously load a provider. This allows users to simply pass a path or skip specifying a provider altogether (uses builtins).
 * @param {object} ioOpts - An IO options object
 * @param {io} [ioOpts.io] - The path to the IO class
 * @param {string} defaultProvider - The default provider to use if none was passed in the io object
 */ 
 export async function getProvider(ioOpts, defaultProvider) {
  if (!ioOpts.io || typeof ioOpts.io === "string") {
    const Provider = await import(ioOpts.io || defaultProvider);
    return Provider.default;
  } else {
    return ioOpts.io;
  }
}

/** Wrapper for setInterval and clearInterval. This is necessary so we can use the global methods in node.js and the System methods in XS.
 * @property {function} setInterval
 * @property {function} clearInterval
 */
export const timer = {
  setInterval: function(callback, duration) {
    if (global && global.setInterval) {
      return global.setInterval(callback, duration);
    }
    if (typeof System !== "undefined" && System.setInterval) {
      return System.setInterval(callback, duration);
    }
  },
  clearInterval: function(identifier) {
    if (global && global.clearInterval) {
      return global.clearInterval(identifier);
    }
    if (typeof System !== "undefined" && System.clearInterval) { //} && identifier.timer) {
      return System.clearInterval(identifier);
    }
  },
  setTimeout: function(callback, duration) {
    if (global && global.setTimeout) {
      return global.setTimeout(callback, duration);
    }
    if (typeof System !== "undefined" && System.setTimeout) {
      return System.setTimeout(callback, duration);
    }
  },
  setImmediate: function(callback) {
    if (typeof process !== "undefined" && process.setImmediate) {
      setImmediate(callback);
    }
    if (typeof System !== "undefined" && System.setTimeout) {
      System.setTimeout(callback);
    }
  }
};