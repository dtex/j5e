import Thermometer from "j5e/thermometer";
import { normalizeDevice, normalizeIO } from "j5e/fn";

/**
 * Class representing a TMP36
 * @classdesc The TMP36 class allows for reading of TMP36 thermistors. Accuracy is within ~1°
 * @memberof module:j5e/thermometer
 * @async
 * @inheritdoc
 * @extends module:j5e/thermometer~Thermometer
 * @fires data
 * @fires change
 */

class TMP36 extends Thermometer {

  /**
   * Instantiate a TMP36 Thermometer
   * @param {number|string|object} io - Pin identifier or IO Options (See {@tutorial C-INSTANTIATING})
   * @example
   * <caption>Use a TMP36</caption>
   * import TMP36 from "j5e/tmp36";
   *
   * const myTMP36 = await new TMP36(12);
   *
   * myTMP36.on("change", function(data) {
   *   trace(data.C);
   * });
   */
  constructor(io) {
    return (async() => {
      io = normalizeIO(io);

      const sensor = await super(io);

      sensor.configure({
        toCelsius: function(raw) {
          // Analog Reference Voltage

          const mV = this.aref * 1000 * raw / this.resolution;

          // tempC = (mV / 10) - 50
          //
          // Page 3
          // Table 1
          // Accuracy 1°C
          return Math.round((mV / 10) - 50);
        }
      });

      return sensor;
    })();

  }

  /**
   * Configure a TMP36
   * @returns {TMP36} The instance on which the method was called
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
   * <caption>Passing in Cofiguration Options</caption>
   import Thermometer from "j5e/thermometer";
   *
   * const thermometer = await new Thermometer({
   *  pin: 14
   * });
   *
   * myThermometer.configure({
   *   toCelsius: function(raw) {
   *     return raw / 16;
   *   }
   * }) ;
   *
   * thermometer.on("change", data => {
   *  trace(thermometer.celsius);
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

export default TMP36;
