const normalizeParams = function(io, pin) {
  
  let deviceOpts = pin;
  let ioOpts = io;
  
  if (typeof io === "function") ioOpts = { io };
  if (typeof pin === "undefined") deviceOpts = {};
  if (typeof pin === "number" || typeof pin === "string") ioOpts.pin = pin;

  return { ioOpts, deviceOpts}
};

export { normalizeParams };

