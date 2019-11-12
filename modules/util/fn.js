/* Normalize parameters passed on device intialization
 * normalizeParams(ioOpts [,deviceOpts])
 * ioOpts: pin || options object
 * deviceOpts optional device options
 */
const normalizeParams = function(ioOpts, deviceOpts={}) {
  if (typeof ioOpts === "number" || typeof ioOpts === "string") {
    ioOpts = {pin: ioOpts};
  }
  if (typeof deviceOpts === "function") {
    ioOpts.io = deviceOpts;
    deviceOpts = {};
  }
  return { ioOpts, deviceOpts}
};

/* Contrain values to a range */
const constrain = function(value, low, high) {
  if (value > high) value = high;
  if (value < low) value = low;
  return value;
}

const getProvider = async function(ioOpts, defaultProvider) {
  if (!ioOpts.io || typeof ioOpts.io === "string") {
    const Provider = await import(ioOpts.io || defaultProvider);
    return Provider.default;
  } else {
    return ioOpts.io;
  }
}

const timer = {
  setInterval: function(callback, duration) {
    if (global && global.setInterval) {
      return global.setInterval(callback, duration);
    }
    if (System && System.setInterval) {
      return System.setInterval(callback, duration);
    }
  },
  clearInterval: function(identifier) {
    if (global && global.clearInterval) {
      return global.clearInterval(identifier);
    }
    if (System && System.clearInterval) {
      return System.clearInterval(identifier);
    }
  }
};

export { 
  constrain,
  getProvider,
  normalizeParams,
  timer
};

