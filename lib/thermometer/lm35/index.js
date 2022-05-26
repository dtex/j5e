/**
 * @module j5e/lm35
 * @description A module for measuring temperature using a LM35 thermistor.
 * @requires module:j5e/thermometer
 * @requires module:j5e/fn
 * @link https://en.wikipedia.org/wiki/Thermistor
 */

import Thermometer from "j5e/thermometer";
import { normalizeDevice, normalizeIO } from "j5e/fn";

/**
 * Class representing an lm35
 * @classdesc The LM35 class allows for reading of LM35 thermistors
 * @memberof module:j5e/lm35
 * @async
 * @extends module:j5e/thermometer~Thermometer
 * @fires data
 * @fires change
 */

class LM35 extends Thermometer {

  /**
   * Instantiate an lm35 Thermometer
   * @param {number|string|object} io - Pin identifier or IO Options (See {@link https://j5e.dev/core-concepts/instantiation/|instantiation})
   * @example
   * // Use a LM35
   * import LM35 from "j5e/lm35";
   *
   * (async() => {
   *   const myLM35 = await new LM35(12);
   *
   *   myLM35.on("change", function(data) {
   *     trace(data.C);
   *   });
   * })();
   */
  constructor(io) {
    return (async() => {
      io = normalizeIO(io);

      const sensor = await super(io);

      sensor.configure({
        toCelsius: function(raw) {
          // VOUT = 1500 mV at 150°C
          // VOUT = 250 mV at 25°C
          // VOUT = –550 mV at –55°C

          const mV = this.aref * 1000 * raw / this.resolution;

          // 10mV = 1°C
          //
          // Page 1
          return Math.round(mV / 10);
        }
      });

      return sensor;
    })();

  }

  /**
   * Configure an LM35
   * @returns {LM35} The instance on which the method was called
   * @inheritdoc
   * @example
   * // Passing in Cofiguration Options
   * import LM35 from "j5e/lm35";
   *
   * (async() => {
   *   const thermometer = await new LM35({
   *     pin: 14
   *   });
   *
   *   thermometer.on("change", data => {
   *     trace(thermometer.celsius);
   *   });
   * })();
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

export default LM35;
