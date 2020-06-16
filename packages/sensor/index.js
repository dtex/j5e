/**
 * For working with generic sensor components
 * @module j5e/sensor
 * @requires module:@j5e/event
 * @requires module:@j5e/fn
 */

import { Emitter } from "@j5e/event";
import {normalizeParams, getProvider, timer, fmap, constrain} from "@j5e/fn";

/** 
 * Class representing a sensor
 * @classdesc The Sensor class allows for input from sensor devices that connect to an ADC
 * @async
 * @extends Emitter
 */
class Sensor extends Emitter {
  
  #state = {
    intervalId: null,
    enabled: true,
    scale: null,
    range: null,
    isScaled: false,
    raw: 0,
    value: 0,
    median: 0,
    smoothing: 10,
    interval: 100,
    previousInterval: 100,
    limit: null,
    threshold: 1,
    last: null,
    samples: []
  };
  
  /**
   * Instantiate a sensor
   * @param {(number|string|object)} io - A pin number, pin identifier or a complete IO options object (See {@tutorial C-INSTANTIATING}
   * @param {object} [device={}] - An object containing device options
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
  
            if (this.#state.interval !== null) {
              this.#state.intervalId = timer.setInterval(this.eventProcessing.bind(this), newInterval);
            }
          }
        },
        value: {
          get() {
            return this.#state.value;
          },
          set(newValue) {
            this.#state.value = newValue;
          }
        },
        median: {
          get() {
            return this.#state.median;
          },
          set(newMedian) {
            this.#state.median = newMedian;
          }
        },
        samples: {
          get() {
            return this.#state.samples;
          },
          set(newSamples) {
            this.#state.samples = newSamples;
          }
        },
        smoothing: {
          get() {
            return this.#state.smoothing;
          }
        },
        last: {
          get() {
            return this.#state.last;
          },
          set(newLast) {
            this.#state.last = newLast;
          }
        },
        threshold: {
          get() {
            return this.#state.threshold;
          }
        },
        limit: {
          get() {
            return this.#state.limit;
          }
        },
        resolution: {
          get() {
            return this.io.resolution ** 2;
          }
        },
        scale: {
          get() {
            return this.#state.scale;
          },
          set(newScale) {
            this.#state.scale = newScale;
          }
        },
        isScaled: {
          get() {
            return this.#state.isScaled;
          },
          set(newIsScaled) {
            this.#state.isScaled = newIsScaled;
          }
        },
        scaled: {
          get() {
            let mapped;
            let constrain;
          
            if (this.#state.scale && this.#state.raw !== null) {
              mapped = fmap(this.#state.raw, this.#state.range[0], this.#state.range[1], this.#state.scale[0], this.#state.scale[1]);
              constrained = constrain(mapped, this.#state.scale[0], this.#state.scale[1]);
              return constrained;
            }
            return this.raw;
          }
        }   
      });

      if (typeof deviceOpts.enabled !== "undefined") {
        this.#state.enabled = Boolean(deviceOpts.enabled);
      }

      if (typeof deviceOpts.interval !== "undefined") {
        this.#state.interval = deviceOpts.interval;
      }

      this.#state.range = deviceOpts.range || [0, 2 ** this.io.resolution];
      this.#state.limit = deviceOpts.limit || null;
      this.#state.threshold = deviceOpts.threshold === undefined ? 1 : deviceOpts.threshold;
      
      if (this.#state.enabled) {
        this.interval = this.#state.interval;
      }
      
      return this;

    })();
     
  }

  /**
   * enable Enable a disabled sensor.
   *
   * @return {Object} instance
   *
   */
  enable() {
    
    if (!this.#state.enabled) {
      this.interval = this.#state.interval || this.#state.previousInterval;
    }

    return this;
  }

  /**
   * disable Disable an enabled sensor.
   *
   * @return {Object} instance
   *
   */
  disable() {
  
    if (this.#state.enabled) {
      this.#state.enabled = false;
      this.#state.previousInterval = this.#state.interval;
      this.interval = null;
    }

    return this;
  }

  eventProcessing() {
    let err = null;
    this.raw = this.io.read();
    let boundary;
    let samples = this.samples;

    samples.push(this.value);
  
    // // Keep the previous calculated value if there were no new readings
    if (samples.length >= this.smoothing) {
      // Filter the accumulated sample values to reduce analog reading noise
      this.median = median(samples);
      const roundMedian = Math.round(this.median);
      this.emit("data", roundMedian);

      // If the filtered (state.median) value for this interval is at least ± the
      // configured threshold from last, fire change events
      if (this.median <= (this.last - this.threshold) || this.median >= (this.last + this.threshold)) {
        this.emit("change", roundMedian);
        // Update the instance-local `last` value (only) when a new change event
        // has been emitted.  For comparison in the next interval
        this.last = this.median;
      }
    
      if (this.limit) {
        if (this.median <= this.limit[0]) {
          boundary = "lower";
        }
        if (this.median >= this.limit[1]) {
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
      samples = [];

    }
    
    this.emit("raw", this.raw);
    this.samples = samples;  
        
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
   *
   */
  scale(low, high) {
    this.isScaled = true;

    this.scale = Array.isArray(low) ?
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
    return fmap(this.#state.raw, 0, this.resolution ** 2, scale[0], scale[1]);
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
