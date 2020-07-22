import Thermometer from "j5e/thermometer";
import { normalizeParams } from "j5e/fn";

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
   * Instantiate a Thermometer
   * @param {number} [options.aref=3.3] - Analog reference voltage
   * @param {boolean} [options.enabled=true] - Wether the device is currently performing reads every <interval>ms
   * @param {number} [options.interval=100] - Interval between readings in millseconds
   * @param {number[]} [options.limit=null] - Limit the output range
   * @param {number[]} [options.range=[0, N]] - The input range of the sensor
   * @param {number[]} [options.scale=[0, N]] - The output range for the sensor's value
   * @param {number} [options.threshold=1] - The minimum amount of change required to emit a "change" event
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
  constructor(options) {
    return (async() => {
      options = normalizeParams(options);

      options.toCelsius = function(raw) {
        // Analog Reference Voltage

        const mV = this.aref * 1000 * raw / this.resolution;

        // tempC = (mV / 10) - 50
        //
        // Page 3
        // Table 1
        // Accuracy 1°C
        return Math.round((mV / 10) - 50);
      };

      const sensor = await super(options);

      return sensor;
    })();

  }

}

export default TMP36;
