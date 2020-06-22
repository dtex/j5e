/**
 * For working with generic sensor devices
 * @module j5e/sensor
 * @requires j5e/event
 * @requires module:j5e/fn
 */

import { Emitter } from "j5e/event";
import {normalizeParams, getProvider, timer, fmap, constrain} from "j5e/fn";

/** 
 * Class representing a generic sensor
 * @classdesc The Sensor class allows for input from sensor devices that connect to an ADC
 * @async
 * @extends Emitter
 */
class Sensor extends Emitter {
  
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
   * @param {object} io - A pin number, pin identifier or a complete IO options object (See {@tutorial C-INSTANTIATING}
   * @param {object} device - An optional object containing device specific options
   * @param {number} [device.interval=100] - Inteval between readings in millseconds
   * @param {number[]} [device.range=[0, N]] - The input range of the sensor
   * @param {number[]} [device.scale=[0, N]] - The output range for the sensor's value
   * @param {number[]} [device.limit=null] - 
   * @param {number} [device.threshold=1] - The minimum amount fo change required to emit a "change" event
   * @param {boolean} [device.enabled=true] - Wether the device is currently performing reads based on the interval value
   * @property {number} value - Get the most recent scaled median value
   * @property {number} scaled - Get the most recent scaled raw value
   * @property {number} raw - Get the most recent raw ADC reading
   * @property {number} resolution - The maximum possible ADC reading
   * @property {number} smoothing - The number of samples to take before finding the median value
   */
  constructor(io, device) { 
    return (async () => {
      const {ioOpts, deviceOpts} = normalizeParams(io, device);
      super();

      const Provider = await getProvider(ioOpts, "builtin/analog");
      this.io = new Provider({
        pin: ioOpts.pin,
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
        resolution: {
          get() {
            return 2 ** this.io.resolution - 1;
          }
        },
        scaled: {
          get() {
            let mapped;
            let constrained;
          
            if (this.#state.scale && this.#state.raw !== null) {
              mapped = fmap(this.#state.raw, this.#state.range[0], this.#state.range[1], this.#state.scale[0], this.#state.scale[1]);
              constrained = constrain(mapped, this.#state.scale[0], this.#state.scale[1]);
              return constrained;
            }
            return this.#state.raw;
          }
        }   
      });

      if (typeof deviceOpts.interval !== "undefined") {
        this.#state.interval = deviceOpts.interval;
      }

      this.#state.range = deviceOpts.range || [0, 2 ** this.io.resolution - 1];
      this.#state.scale = deviceOpts.scale || [0, 2 ** this.io.resolution - 1];
      this.#state.limit = deviceOpts.limit || null;
      this.#state.threshold = deviceOpts.threshold === undefined ? 1 : deviceOpts.threshold;
      
      if (deviceOpts.enabled === false) {
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
