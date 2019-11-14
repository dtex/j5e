/**
 * Servo module - For controlling hobby servos
 * @module j5e/servo
 */
import { Emitter } from "../util/event.js";
import {normalizeParams, getProvider, map} from "../util/fn.js";

/** 
 * Class representing a Servo
 * @classdesc The Servo class allows for control of hobby servos
 * @extends Emitter
 * @fires Servo#move:complete - Fires when a servo reaches its requested position
 */
class Servo extends Emitter {
  
  #state = {
    history: [],
    isRunning: false,
    animation: null,
    value: null
  };

  /**
   * Instantiate a Servo
   * @param {(number|string|object)} io - A pin number, pin identifier or a complete IO options object
   * @param {(number|string)} [io.pin] - If passing an object, a pin number or pin identifier
   * @param {(string|constructor)} [io.io=builtin/digital] - If passing an object, a string specifying a path to the IO provider or a constructor
   * @param {object} [device={}] - An object containing device options
   * @param {string} [device.type="standard"] - Type of servo ("standard" or "continuous")
   * @param {number[]} [device.pwmRange=[600, 2400]] - The pulse width range in microseconds
   * @param {number[]} [device.deadband=[90,90]] - The range at which a continuos motion servo will not turn
   * @param {number[]} [device.range=[0, 180]] - The allowed range of motion in degrees
   * @param {number[]} [device.deviceRange=[0, 180]] - The physical range of the servo in degrees
   * @param {number} [device.startAt="Any value within device.range"] - The desired start position of the servo
   * @param {number} [device.offset=0] - Adjust the position of the servo for trimming
   * @param {boolean} [device.invert=false] - Reverses the direction of rotation
   * @param {boolean} [device.center=false] - Center the servo on instantiation
   * @property {object[]} history - The last five position updates
   * @property {object[]} history.timestamp - Timestamp of position update
   * @property {object[]} history.target - The user requested position
   * @property {object[]} history.degrees - The actual position (factors in offset and invert)
   * @property {object} last - The most recent position update
   * @property {object[]} last.timestamp - Timestamp of position update
   * @property {object[]} last.target - The user requested position
   * @property {object[]} last.degrees - The corrected position (factors in offset and invert)
   * @property {number} position - The most recent request and corrected position (factors in offset and invert)
   */
  constructor(io, device) {
    return (async () => {
      const {ioOpts, deviceOpts} = normalizeParams(io, device);

      const Provider = await getProvider(ioOpts, "builtin/PWM");
      
      this.io = new Provider({
        pin: ioOpts.pin,
        mode: Provider.Output,
        hz: 50
      });
      
      this.#state.pwmRange = deviceOpts.pwmRange || [600, 2400];
      this.#state.deadband = deviceOpts.deadband || [90, 90];
      this.#state.offset = deviceOpts.offset || 0;
      this.#state.range = deviceOpts.range || [0 - this.offset, 180 - this.offset];
      this.#state.type = deviceOpts.type || "standard";
      this.#state.invert = deviceOpts.invert || false;

      Object.defineProperties(this, {
        history: {
          get: function() {
            return history.slice(-5);
          }
        },
        last: {
          get: function() {
            return history[history.length - 1];
          }
        },
        position: {
          get: function() {
            return history.length ? history[history.length - 1].degrees : -1;
          }
        }
      });

      this.initialize(opts);

      // If "startAt" is defined and center is falsy
      // set servo to min or max degrees
      if (typeof deviceOpts.startAt !== "undefined") {
        this.to(deviceOpts.startAt);
      } else {

        if (deviceOpts.center) {
          this.center();
        }

        if (deviceOpts.type === "continuous") {
          this.stop();
        }
      
      }

      return this;
    })();
  }

  /**
   * The initialization code for a servo
   */
  initialize(deviceOpts) {
    // No operation here... Meant to be overwritten by descendants
  }

  /**
   * Calls the write param on the IO instance for this servo.
   * @param {number} degrees - The absolute position to move a servo to
   * @returns {Servo}
   */
  update(degrees) {
    
    // If same degrees return immediately.
    if (this.last && this.last.degrees === degrees) {
      return this;
    }

    // Map value from degreeRange to pwmRange
    let microseconds = map(
      degrees,
      this.degreeRange[0], this.degreeRange[1],
      this.pwmRange[0], this.pwmRange[1]
    );

    // Restrict values to integers
    microseconds |= 0;

    this.io.write(microseconds);
  }

};

export default Servo;