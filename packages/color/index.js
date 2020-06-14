/**
 * Detect colors
 * @module j5e/color
 * @requires module:@j5e/event
 * @requires module:@j5e/fn
 */

import { Emitter } from "@j5e/event";
import {normalizeParams, getProvider, pad, timer} from "@j5e/fn";

/** 
 * Class representing a color sensor
 * @classdesc The Color Sensor class
 * @async
 * @extends Emitter
 * @fires Color#data
 * @fires Color#change
 */
class Color extends Emitter {

  static colors = ["red", "green", "blue"];

  #state = {
    
  };
  
  /**
   * Instantiate a color sensor
   * @param {(number|string|object)} io - A pin number, pin identifier or a complete IO options object (See {@tutorial C-INSTANTIATING}
   * @param {object} [device={}] - An object containing device options
   * @param {number} [device.freq=25] - Desired frequency for data reads. Note this is different than Johnny-Five in that it is the frequency of reads, not the interval between reads.
   */
   constructor(io, device) { 
    return (async () => {
      
      const {ioOpts, deviceOpts} = normalizeParams(io, device);
      super();

      const Provider = await getProvider(ioOpts, "builtin/i2c");
      
      this.io = new Provider(ioOpts);
      
      this.#state.freq = deviceOpts.freq || 25;
      this.#state.raw = 0;
      this.#state.last = null;
      
      Object.defineProperties(this, {
        value: {
          get: function() {
            return this.#state.raw;
          }
        },
        rgb: {
          get: function() {
            return this.toRGB(raw).reduce(function(accum, value, index) {
              accum[colors[index]] = value;
              return accum;
            }, {});
          }
        }
      });

      trace("\nA\n");
      trace(typeof this.initialize);
      trace("\nA\n");
      this.initialize(deviceOpts, function(data) {
        raw = data;
      });
      
      return this;
    })();
  
    // timer.setInterval(() => {
    //   if (this.#state.raw === undefined) {
    //     return;
    //   }
  
    //   let data = {
    //     rgb: this.rgb,
    //   };
  
    //   this.emit("data", data);
  
    //   if (raw !== last) {
    //     last = raw;
    //     this.emit("change", data);
    //   }
    // }, 1000/this.#state.freq);
    
  }

  /*
   * Initializes the device
   * @abstract
   */
  initialize(opts, dataHandler) {
    trace("Color initialize\n");
  }
  
  /*
   * Convert raw value to RGB
   * @param {object} raw - RGB Object
   * @returns {RGB Object}
   */
  toRGB(raw) {
    return raw;
  }

  /*
   * Converts and RGB object to hex value
   * @param {object} rgb - RGB Object
   * @returns {String}
   */
  hexCode(rgb) {
    if (rgb.red === undefined || rgb.green === undefined || rgb.blue === undefined) {
      return null;
    }
    return rgb.length === 0 ? "unknown" : colors.reduce(function(accum, name) {
      return accum += pad(rgb[name].toString(16), 2);
    }, "");
  }

}

export default Color;