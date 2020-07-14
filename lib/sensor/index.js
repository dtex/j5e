/**
 * For working with generic sensor devices
 * @module j5e/sensor
 * @requires module:j5e/withinable
 * @requires module:j5e/fn
 */

import Withinable from "j5e/withinable";
import { normalizeParams, getProvider, timer, map, fmap, constrain } from "j5e/fn";

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
    scale: null,
    range: null,
    isScaled: false,
    raw: null,
    value: null,
    median: null,
    smoothing: 10,
    interval: null,
    previousInterval: 100,
    limit: null,
    threshold: 1,
    last: null,
    samples: []
  };

  /**
   * Instantiate a sensor
   * @param {object} options - A pin number, pin identifier or a complete IO options object (See {@tutorial C-INSTANTIATING}
   * @param {number} [options.interval=100] - Interval between readings in millseconds
   * @param {number[]} [options.range=[0, N]] - The input range of the sensor
   * @param {number[]} [options.scale=[0, N]] - The output range for the sensor's value
   * @param {number[]} [options.limit=null] - Limit the output range
   * @param {number} [options.threshold=1] - The minimum amount fo change required to emit a "change" event
   * @param {boolean} [options.enabled=true] - Wether the device is currently performing reads based on the interval value
   * @property {number} value - Get the most recent scaled median value
   * @property {number} scaled - Get the most recent scaled raw value
   * @property {number} level - Get the most recent raw value scaled to [0,1]
   * @property {number} raw - Get the most recent raw ADC reading
   * @property {number} resolution - The maximum possible ADC reading
   * @property {number} smoothing - The number of samples to take before finding the median value
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
   *
   * @example
   * <caption>Using an options object</caption>
   import Sensor from "j5e/sensor";
   *
   * const sensor = await new Sensor({
   *  pin: 12,
   *  interval: 500
   * });
   * sensor.on("change", data => {
   *  trace(data);
   * });
   */
  constructor(options) {
    return (async() => {
      options = normalizeParams(options);
      super();

      const Provider = await getProvider(options, "builtin/analog");
      this.io = new Provider({
        pin: options.pin,
      });

      Object.defineProperties(this, {
        interval: {
          get() {
            return this.#state.interval;
          },
          set(newInterval) {
            this.#state.interval = newInterval;

            if (this.#state.intervalId) {
              timer.clearInterval(this.#state.intervalId);
            }

            if (this.#state.interval !== 0) {
              this.#state.intervalId = timer.setInterval(this.eventProcessing.bind(this), newInterval);
            }
          }
        },
        value: {
          get() {
            return this.scaled;
          }
        },
        raw: {
          get() {
            return this.#state.raw;
          }
        },
        smoothing: {
          get() {
            return this.#state.smoothing;
          },
          set(newSmoothing) {
            this.#state.smoothing = newSmoothing;
          }
        },
        threshold: {
          get() {
            return this.#state.threshold;
          },
          set(newThreshold) {
            this.#state.threshold = newThreshold;
          }
        },
        limit: {
          get() {
            return this.#state.limit;
          },
          set(newLimit) {
            this.#state.limit = newLimit;
          }
        },
        resolution: {
          get() {
            return 2 ** this.io.resolution - 1;
          }
        },
        scaled: {
          get() {
            let mapped, constrained;

            if (this.#state.scale && this.#state.raw !== null) {
              mapped = fmap(this.#state.raw, this.#state.range[0], this.#state.range[1], this.#state.scale[0], this.#state.scale[1]);
              constrained = constrain(mapped, this.#state.scale[0], this.#state.scale[1]);
              return constrained;
            }
            return this.#state.raw;
          }
        }
      });

      if (typeof options.interval !== "undefined") {
        this.#state.interval = options.interval;
      }

      if (typeof options.smoothing !== "undefined") {
        this.#state.smoothing = options.smoothing;
      }

      this.#state.range = options.range || [0, 2 ** this.io.resolution - 1];
      this.#state.scale = options.scale || [0, 2 ** this.io.resolution - 1];
      this.#state.limit = options.limit || null;
      this.#state.threshold = typeof options.threshold === "undefined" ? 1 : options.threshold;

      if (options.enabled === false) {
        this.disable();
      } else {
        this.enable();
      }

      return this;

    })();

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
    if (this.#state.enabled) {
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
    return this.value;
  }

  /**
   * Internal method for processing reads
   * @access private
   */
  eventProcessing() {
    let err = null;
    this.#state.raw = this.io.read();
    let boundary;

    this.#state.samples.push(this.value);

    // // Keep the previous calculated value if there were no new readings
    if (this.#state.samples.length >= this.smoothing) {
      // Filter the accumulated sample values to reduce analog reading noise
      this.#state.median = median(this.#state.samples);
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

      //Reset samples
      this.#state.samples = [];

    }

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
    this.isScaled = true;

    this.#state.scale = Array.isArray(low) ?
      low : [low, high];

    return this;
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
