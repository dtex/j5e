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

/* Wrapper for dynamic module loading */
const loadModule = function(module) {
  import(module).then((loaded) => {
    return loaded;
  });
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
  loadModule,
  normalizeParams,
  setInterval
};

