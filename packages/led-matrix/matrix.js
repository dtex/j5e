/**
 * Led module - For controlling LED's
 * @module j5e/matrix
 */

import {normalizeParams, getProvider} from "@j5e/fn";

/** 
 * Class representing an Matrix
 * @classdesc The Matrix class allows for control of LED matrices
 */
class Matrix {

  state = {
    rotation: 1,
    columns: 8,
    rows: 8
  };

  /**
   * Instantiate a matrix
   * @async
   * @param {object} io - A pin number, pin identifier or a complete IO options object
   * @param {(number|string)} [io.sda] - The data pin number or pin identifier
   * @param {(number|string)} [io.scl] - The clock pin number or pin identifier
   * @param {(number|string)} [io.address] - the I2C address
   * @param {object} [device={}] - An object containing device options
   * @param {boolean} [device.sink=false] - True if the device is wired for sink drive
   */
  constructor(io, device) {
    return (async () => {
      
      const {ioOpts, deviceOpts} = normalizeParams(io, device);

      // Object.defineProperties(this, {
      //   value: {
      //     get: function() {
      //       return this.#state.value;
      //     }
      //   },
      //   mode: {
      //     get: function() {
      //       return this.#state.mode;
      //     }
      //   },
      //   isOn: {
      //     get: function() {
      //       return !!this.#state.value;
      //     }
      //   },
      //   isRunning: {
      //     get: function() {
      //       return this.#state.isRunning;
      //     }
      //   }
      // });

      return this;
    })();
  }

  /**
   * Initialize the component
   * @abstract
   * @access private  
   * @param {object} [opts={}] - An object containing device options
   */
  initializ(opts) {
    throw new Error('initialize must be implemented by subclass!');  
  }

  /**
   * Send instructions to the Matrix
   * @abstract
   * @access private  
   * @param {Number} opcode Operation code.
   * @param {Number} data   Data.
   */
  send(optcode, data) {
    throw new Error('initize must be implemented by subclass!');  
  }

  /**
   * Turn the Matrix on
   * @return {Matrix}  Returns this to allow for chaining.
   */
  on() {
    this.send(this.OP.SHUTDOWN, 1);
    return this;
  };

};

export default Matrix;