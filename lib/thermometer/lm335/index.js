/**
 * @module j5e/lm335
 * @description A module for measuring temperature using a LM335 thermistor.
 * @requires module:j5e/thermometer
 * @requires module:j5e/fn
 * @link https://en.wikipedia.org/wiki/Thermistor
 */

import Thermometer from "j5e/thermometer";
import { normalizeDevice, normalizeIO } from "j5e/fn";

/**
 * Class representing an lm335
 * @classdesc The LM335 class allows for reading of LM335 thermistors
 * @memberof module:j5e/lm335
 * @async
 * @extends module:j5e/thermometer~Thermometer
 * @fires data
 * @fires change
 */

class LM335 extends Thermometer {

  /**
   * Instantiate an LM335 Thermometer
   * @param {number|string|object} io - Pin identifier or IO Options (See {@link https://j5e.dev/core-concepts/instantiation/|instantiation})
   * @example
   * // Use a LM335
   * import LM335 from "j5e/lm335";
   *
   * const myLM335 = await new LM335(12);
   *
   * myLM335.on("change", function(data) {
   *   trace(data.C);
   * });
   */
  constructor(io) {
    return (async() => {
      io = normalizeIO(io);

      const sensor = await super(io);

      sensor.configure({
        toCelsius: function(raw) {
          // OUTPUT 10mV/°K
          const mV = this.aref * 1000 * raw / this.resolution;

          // Page 1
          return Math.round((mV / 10) - Thermometer.CELSIUS_TO_KELVIN);
        }
      });

      return sensor;
    })();

  }

  /**
   * Configure an LM335
   * @returns {LM335} The instance on which the method was called
   * @param {object} options - Device configuration options
   * @param {number} [options.aref=3.3] - Analog reference voltage
   * @param {boolean} [options.enabled=true] - Wether the device is currently performing reads every <interval>ms
   * @param {number} [options.interval=100] - Interval between readings in millseconds
   * @param {number[]} [options.limit=null] - Limit the output range
   * @param {number[]} [options.range=[0, N]] - The input range of the sensor
   * @param {number[]} [options.scale=[0, N]] - The output range for the sensor's value
   * @param {number} [options.threshold=1] - The minimum amount of change required to emit a "change" event
   * @param {callback} [options.toCelsius] - Function that converts raw value to Celsius
   * @example
   * // Passing in Cofiguration Options
   import LM335 from "j5e/lm335";
   *
   * const thermometer = await new LM335({
   *   pin: 14
   * });
   *
   * thermometer.on("change", data => {
   *   trace(thermometer.celsius);
   * });
   */
  configure(options = {}) {
    options = normalizeDevice(options);

    super.configure(options);

    if (options.toCelsius) {
      this.customToCelsius = options.toCelsius;
    }

    return this;
  }

}

export default LM335;
