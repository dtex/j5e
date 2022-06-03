/**
 * @module j5e/mf52a103j3470
 * @description A module for measuring temperature using a MF52A103J3470 thermistor.
 * @requires module:j5e/thermometer
 * @requires module:j5e/fn
 * @link https://en.wikipedia.org/wiki/Thermistor
 */

import Thermometer from "j5e/thermometer";
import { normalizeDevice, normalizeIO } from "j5e/fn";

/**
 * Class representing a MF52A103J3470
 * @classdesc The MF52A103J3470 class allows for reading of MF52A103J3470 thermistors°
 * @memberof module:j5e/mf52a103j3470
 * @async
 * @extends module:j5e/thermometer~Thermometer
 * @fires data
 * @fires change
 */

class MF52A103J3470 extends Thermometer {

  /**
   * Instantiate an MF52A103J3470 Thermometer
   * @param {number|string|object} io - Pin identifier or IO Options (See {@link https://j5e.dev/core-concepts/instantiation/|instantiation})
   * @example
   * // Use an MF52A103J3470
   * import MF52A103J3470 from "j5e/tmp36";
   *
   * const myMF52A103J3470 = await new MF52A103J3470(12);
   *
   * myMF52A103J3470.on("change", function(data) {
   *   trace(data.C);
   * });
   */
  constructor(io, options) {
    return (async() => {
      io = normalizeIO(io);

      const sensor = await super(io, options);

      sensor.configure({
        toCelsius: function(raw) {
          const beta = 3950;

          // 10 kOhm
          const rb = 10000;

          // Ginf = 1/Rinf
          const ginf = 120.6685;

          const rthermistor = rb * (this.resolution / raw - 1);
          const tempc = beta / (Math.log(rthermistor * ginf));

          return Math.round(tempc - Thermometer.CELSIUS_TO_KELVIN);
        }
      });

      return sensor;
    })();

  }

  /**
   * Configure an MF52A103J3470
   * @returns {MF52A103J3470} The instance on which the method was called
   * @inheritdoc
   * @example
   * // Passing in Cofiguration Options
   import MF52A103J3470 from "j5e/mf52a103j3470";
   *
   * const thermometer = await new MF52A103J3470({
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

export default MF52A103J3470;
