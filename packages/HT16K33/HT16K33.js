/**
 * HT16K33 module - For controlling HT16K33 I2C LED matrix backpacks
 * @module j5e/HT16K33
 */

import Matrix from "@j5e/matrix";
import {normalizeParams, getProvider} from "@j5e/fn";

/** 
 * Class representing an HT16K33
 * @classdesc The HT16K33 class allows for control of HT16K33 I2C LED matrix backpacks
 * @extends Matrix
 */
class HT16K33 extends Matrix {

  /** @constant
   * @type {object}
   */
  OP = {
    SHUTDOWN: 0x20,
    BRIGHTNESS: 0xE0,
    BLINK: 0x80
  };

  state = {};

  /**
   * Instantiate an HT16K33 LED matrix backpack
   */
  constructor(io, device) {
    return (async () => {
      const {ioOpts, deviceOpts} = normalizeParams(io, device);

      await super(io, device);

      const Provider = await getProvider(ioOpts, "builtin/i2c");
      
      this.io = new Provider({
        sda: ioOpts.sda,
        scl: ioOpts.scl,
        address: ioOpts.address || 0x70,
      });
      
      Object.assign(this.state, deviceOpts);

      this.initializ(deviceOpts);
      
    })();
  }

  initializ(opts) {
    
    this.buffer = Array(this.state.rows).fill([]);
    super.on();
    
    // Turn off blinking during initialization, in case it was left on.
    this.blink(device, false);
    this.brightness(device, 100);
    this.clear(device);

  }

  /*
  * Send data to the HT16K33
   * @param {Number} opcode Operation code.
   * @param {Number} data   Data.
  */
  send(opcode, data) {
    this.io.write(this.state.address, [opcode | data]);
    return this;
  }

}

export default HT16K33;