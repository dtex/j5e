/* Normalize parameters passed on device intialization
 * normalizeParams(ioOpts [,deviceOpts])
 * ioOpts: pin || options object
 * deviceOpts optional device options
 */
const normalizeParams = function(ioOpts, deviceOpts) {
  if (typeof ioOpts === "number" || typeof ioOpts === "string") ioOpts = {pin: ioOpts};
  if (typeof deviceOpts === "undefined") deviceOpts = {};
  return { ioOpts, deviceOpts}
};

/* Contrain values to a range */
const constrain = function(value, low, high) {
  if (value > high) value = high;
  if (value < low) value = low;
  return value;
}

const getProvider = async function(ioOpts, defaultProvider, opts) {
  if (!ioOpts.provider || typeof ioOpts.provider === "string") {
    const Provider = await import(ioOpts.provider || defaultProvider);
    return Provider.default;
  } else {
    return ioOpts.provider;
  }
}

const setInterval = function() {
  if (typeof System !== "undefined") {
    return System.setInterval;
  }
  return GLOBAL.setInterval;
}

const clearInterval = function() {
  if (typeof System !== "undefined") {
    return System.clearInterval;
  }
  return GLOBAL.clearInterval;
}

export { 
  clearInterval,
  constrain,
  getProvider,
  normalizeParams,
  setInterval
};

