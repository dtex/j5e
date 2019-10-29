const normalizeParams = function(io, pin) {
  
  let deviceOpts = {};
  let ioOpts = io;
  
  if (typeof io === "function") ioOpts = { io };
  if (typeof pin === "number" || typeof pin === "string") ioOpts.pin = pin;

  if (typeof pin === "undefined") deviceOpts = {};
  if (typeof pin === "object") deviceOpts = pin;

  return { ioOpts, deviceOpts}
};

const constrain = function(value, low, high) {
  if (value > high) value = high;
  if (value < low) value = low;
  return value;
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
  normalizeParams,
  setInterval
};

