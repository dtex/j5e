/**
 * Detect colors
 * @module j5e/isl29125
 * @requires module:@j5e/color
 */

import Color from "@j5e/color";
import { constrain, normalizeParams } from "@j5e/fn";

/** 
 * Class representing an ISL29125 sensor
 * @classdesc The Color Sensor class
 * @async
 */
class ISL29125 extends Color {

  static REGISTER = {
    RESET: 0x00,
    CONFIG1: 0x01, // mode/lux range
    CONFIG2: 0x02, // ir adjust/filtering
    CONFIG3: 0x03, // interrupt control
    READ: 0x09     // Same as "GREEN DATA - LOW BYTE"
  }
  
  /**
   * Instantiate an ISL29125 color sensor
   * @param {(number|string|object)} io - A pin number, pin identifier or a complete IO options object (See {@tutorial C-INSTANTIATING}
   * @param {object} [device={}] - An object containing device options
   * @param {number} [device.freq=25] - Desired frequency for data reads. Note this is different than Johnny-Five in that it is the frequency of reads, not the interval between reads.
   */
   constructor(io, device) { 
    return (async () => {
      const {ioOpts, deviceOpts} = normalizeParams(io, device);
      ioOpts.address = ioOpts.address || 0x44;
      ioOpts.hz = ioOpts.hz || 600000;
      super(ioOpts, deviceOpts);

      return this;
    })();  
  }

  /*
   * Initializes the device
   */
  initialize(opts, dataHandler) {
    
    // Reset chip
    this.io.write(Uint8Array.of(ISL29125.REGISTER.RESET, 0x46));
    
    // RGB | 10K Lux | 16bits
    this.io.write(Uint8Array.of(ISL29125.REGISTER.CONFIG1, 0x05 | 0x08 | 0x00));

    // High adjust
    this.io.write(Uint8Array.of(ISL29125.REGISTER.CONFIG2, 0x3F));

    // No Interrupts
    this.io.write(Uint8Array.of(ISL29125.REGISTER.CONFIG3, 0x00));
    
  }

  read() {
    
    this.io.write(ISL29125.REGISTER.READ);
    let data = this.io.read(6);
    let value = "";

    // Register order: GLSB, GMSB, RLSB, RMSB, BLSB, BMSB
    const g = (data[1] << 8) | data[0];
    const r = (data[3] << 8) | data[2];
    const b = (data[5] << 8) | data[4];

    const rgb = [r >> 2, g >> 2, b >> 2].map(function(value) {
      return constrain(value, 0, 255);
    });

    for (let i = 0; i < 3; i++) {
      value += this.pad(rgb[i].toString(16), 2);
    }

    trace(value);

  }
  
  /*
   * Convert raw value to RGB
   * @param {object} raw - RGB Object
   * @returns {RGB Object}
   */
  toRGB(raw) {
    return raw;
  }

}

export default ISL29125;