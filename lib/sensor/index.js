/**
 * For working with generic sensor devices
 * @module j5e/sensor
 * @requires module:j5e/withinable
 * @requires module:j5e/fn
 */

import Withinable from "j5e/withinable";
import { normalizeDevice, normalizeIO, getProvider, timer, map, fmap, constrain } from "j5e/fn";

/**
 * Class representing a generic sensor
 * @classdesc The Sensor class allows for input from sensor devices that connect to an ADC
 * @async
 * @extends module:j5e/withinable~Withinable
 */
class Sensor extends Withinable {

  #state = {
    intervalId: null,
    enabled: null,
    isScaled: false,
    raw: null,
    value: null,
    median: null,
    previousInterval: 100,
    last: null,
    samples: []
  };

  /**
   * Instantiate a sensor
   * @param {number|string|object} io - Pin identifier or IO Options (See {@tutorial C-INSTANTIATING})
   * @example
   * <caption>Using a pin number</caption>
   * import Sensor from "j5e/sensor";
   *
   * const sensor = await new Sensor(12);
   * sensor.on("change", data => {
   *  trace(data);
   * });
   *
   * @example
   * <caption>Using a pin identifier</caption>
   * import Sensor from "j5e/sensor";
   *
   * const sensor = await new Sensor("A1");
   * sensor.on("change", data => {
   *  trace(data);
   * });
   */
  constructor(io) {
    return (async() => {
      io = normalizeIO(io);
      super();

      const Provider = await getProvider(io, "builtin/analog");
      this.io = new Provider({
        pin: io.pin,
      });

      this.configure({
        interval: 100
      });

      return this;

    })();

  }

  /**
   * Configure a Sensor
   * @returns {Sensor} The instance on which the method was called
   * @param {object} options - Device configuration options
   * @param {number} [options.aref=3.3] - Analog reference voltage
   * @param {boolean} [options.enabled=true] - Wether the device is currently performing reads every <interval>ms
   * @param {number} [options.interval=100] - Interval between readings in millseconds
   * @param {number[]} [options.limit=null] - Limit the output range
   * @param {number[]} [options.range=[0, N]] - The input range of the sensor
   * @param {number[]} [options.scale=[0, N]] - The output range for the sensor's value
   * @param {number} [options.threshold=1] - The minimum amount of change required to emit a "change" event
   * @example
   * <caption>Passing in Cofiguration Options</caption>
   import Sensor from "j5e/sensor";
   *
   * const sensor = await new Sensor({
   *  pin: 12
   * });
   *
   * sensor.configure({
   *  interval: 500
   * });
   *
   * sensor.on("change", data => {
   *  trace(data);
   * });
   */
  configure(options = {}) {
    options = normalizeDevice(options);

    this.#state.aref = options.aref || 3.3;
    this.#state.range = options.range || [0, 2 ** this.io.resolution - 1];
    this.#state.scale = options.scale || [0, 2 ** this.io.resolution - 1];
    this.#state.limit = options.limit || null;
    this.#state.smoothing = options.smoothing || 10;
    this.#state.threshold = options.threshold || 1;

    if (typeof options.interval !== "undefined") {
      this.interval = options.interval;
    }

    if (typeof options.enabled !== "undefined") {
      if (options.enabled === false) {
        this.disable();
      } else {
        this.enable();
      }
    }

    return this;
  }

  /**
   * Limits the output range
   * @type {number[]}
   */
  get limit() {
    return this.#state.limit;
  }

  set limit(newLimit) {
    this.#state.limit = newLimit;
  }

  /**
   * The minimum amount of change required to emit a "change" event
   * @type {number}
   */
  get threshold() {
    return this.#state.threshold;
  }

  set threshold(newThreshold) {
    this.#state.threshold = newThreshold;
  }

  /**
   * The interval between readings (in ms)
   * @type {number}
   */
  get interval() {
    return this.#state.interval;
  }

  set interval(newInterval) {

    this.#state.interval = newInterval;

    if (this.#state.intervalId) {
      timer.clearInterval(this.#state.intervalId);
    }

    if (this.#state.interval !== 0) {
      this.#state.intervalId = timer.setInterval(this.eventProcessing.bind(this), newInterval);
    }
  }

  /**
   * The number of samples to take before finding the median
   * @type {number}
   */
  get smoothing() {
    return this.#state.smoothing;
  }

  set smoothing(newSmoothing) {
    this.#state.smoothing = newSmoothing;
  }

  /**
   * The reference voltage
   * @type {number}
   */
  get aref() {
    return this.#state.aref;
  }

  /**
   * The number of samples to take before finding the median
   * @type {number}
   */
  get samples() {
    return this.#state.samples;
  }

  /**
   * The input range of the sensor
   * @type {number[]}
   * @readonly
   */
  get range() {
    return this.#state.range;
  }

  /**
   * Get the most recent raw ADC reading
   * @type {number}
   * @readonly
   */
  get raw() {
    return this.#state.raw;
  }

  /**
   * Get the most recent median ADC reading
   * @type {number}
   * @readonly
   */
  get median() {
    return this.#state.median;
  }

  /**
   * The maximum possible ADC reading
   * @type {number}
   * @readonly
   */
  get resolution() {
    return 2 ** this.io.resolution - 1;
  }

  /**
   * Get the most recent scaled raw reading
   * @type {number}
   * @readonly
   */
  get scaled() {
    let mapped, constrained;
    if (this.#state.scale && this.#state.raw !== null) {
      mapped = fmap(this.#state.raw, this.#state.range[0], this.#state.range[1], this.#state.scale[0], this.#state.scale[1]);
      constrained = constrain(mapped, this.#state.scale[0], this.#state.scale[1]);
      return constrained;
    }
    return this.#state.raw;
  }

  /**
   * @property Get the most recent scaled median value
   * @type {number}
   * @readonly
   */
  get value() {
    return this.scaled;
  }

  /**
   * Enable a disabled sensor.
   * @return {Object} instance
   * @example
   * import Sensor from "j5e/sensor";
   * const sensor = await new Sensor(12);
   *
   * sensor.disable();
   *
   * // Wait 5 seconds and then take readings
   * timer.setTimeout(function() {
   *  sensor.enable();
   * });
   */
  enable() {

    if (!this.#state.enabled) {
      this.interval = this.#state.interval || this.#state.previousInterval;
      this.#state.enabled = true;
    }
    return this;
  }

  /**
   * Disable an enabled sensor.
   * @return {Object} instance
   * @example
   * import Sensor from "j5e/sensor";
   * const sensor = await new Sensor(12);
   *
   * // Take reading for 5 seconds and then stop
   * timer.setTimeout(function() {
   *  sensor.disable();
   * });
   */
  disable() {
    if (this.#state.enabled || this.#state.enabled === null) {
      this.#state.enabled = false;
      this.#state.previousInterval = this.#state.interval;
      this.interval = 0;
    }

    return this;
  }

  /**
   * Synchronous read of a sensor.
   * @return {Number} sensor value
   * @example
   * import Sensor from "j5e/sensor";
   * const sensor = await new Sensor(12);
   *
   * let myValue = sensor.read();
   */
  read() {
    this.#state.raw = this.io.read();
    return this.#state.raw;
  }

  /**
   * Sample a sensor
   * @access private
   */
  sample() {
    this.read();
    this.#state.samples.push(this.value);

    if (this.#state.samples.length >= this.smoothing) {
      // Filter the accumulated sample values to reduce analog reading noise
      this.#state.median = median(this.samples);

      this.emitEvents();

      //Reset samples
      this.#state.samples = [];
    }

  }

  /**
   * Internal method for emitting events
   * @access private
   */
  emitEvents() {
    let err = null;
    let boundary;
    // Filter the accumulated sample values to reduce analog reading noise

    const roundMedian = Math.round(this.#state.median);
    this.emit("data", roundMedian);

    // If the filtered (#state.median) value for this interval is at least ± the
    // configured threshold from last, fire change events
    if (this.#state.median <= (this.#state.last - this.threshold) || this.#state.median >= (this.#state.last + this.threshold)) {
      this.emit("change", roundMedian);
      // Update the instance-local `last` value (only) when a new change event
      // has been emitted.  For comparison in the next interval
      this.#state.last = this.#state.median;
    }

    if (this.limit) {
      if (this.#state.median <= this.limit[0]) {
        boundary = "lower";
      }
      if (this.#state.median >= this.limit[1]) {
        boundary = "upper";
      }

      if (boundary) {
        this.emit("limit", {
          boundary,
          value: roundMedian
        });
        this.emit(`limit:${boundary}`, roundMedian);
      }
    }
  }

  /**
   * Internal method for processing reads
   * @access private
   */
  eventProcessing() {

    this.sample();
    this.emit("raw", this.#state.raw);

  }

  /**
   * scale/scaleTo Set a value scaling range
   *
   * @param  {Number} low  Lowerbound
   * @param  {Number} high Upperbound
   * @return {Object} instance
   *
   * @param  {Array} [ low, high]  Lowerbound
   * @return {Object} instance
   * @example
   * import Sensor from "j5e/sensor";
   * const sensor = await new Sensor(12);
   *
   * // Scale all future values to 8-bit range
   * sensor.scale([0, 255]);
   */
  scale(low, high) {
    if (typeof low === "undefined") {
      return this.#state.scale;
    } else {
      this.isScaled = true;

      this.#state.scale = Array.isArray(low) ?
        low : [low, high];

      return this;
    }
  }

  /**
   * scaleTo Scales value to integer representation
   * @param  {Number} low  An array containing a lower and upper bound
   *
   * @param  {Number} low  A number to use as a lower bound
   * @param  {Number} high A number to use as an upper bound
   * @return {Number}      The scaled value
   * @example
   * import Sensor from "j5e/sensor";
   * const sensor = await new Sensor(12);
   *
   * // Scale the returned value to 8-bit range
   * sensor.scaleTo([0, 255]);
   */
  scaleTo(low, high) {
    const scale = Array.isArray(low) ? low : [low, high];
    return map(this.#state.raw, 0, this.resolution, scale[0], scale[1]);
  }

  /**
   * fscaleTo Scales value to single precision float representation
   * @param  {Number} low  An array containing a lower and upper bound
   *
   * @param  {Number} low  A number to use as a lower bound
   * @param  {Number} high A number to use as an upper bound
   * @return {Number}      The scaled value
   * @example
   * import Sensor from "j5e/sensor";
   * const sensor = await new Sensor(12);
   *
   * // Scale the returned value to float between 0 and 1
   * sensor.fscaleTo([0, 1]);
   */
  fscaleTo(low, high) {
    const scale = Array.isArray(low) ? low : [low, high];
    return fmap(this.#state.raw, 0, this.resolution, scale[0], scale[1]);
  }

}

export default Sensor;

// To reduce noise in sensor readings, sort collected samples
// from high to low and select the value in the center.
function median(input) {
  // faster than default comparitor (even for small n)
  const sorted = input.sort((a, b) => a - b);
  const len = sorted.length;
  const half = Math.floor(len / 2);

  // If the length is odd, return the midpoint m
  // If the length is even, return average of m & m + 1
  return len % 2 ? sorted[half] : (sorted[half - 1] + sorted[half]) / 2;
};
