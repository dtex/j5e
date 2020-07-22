import Thermometer from "j5e/thermometer";
import { normalizeParams } from "j5e/fn";

/**
 * Class representing a MF52A103J3470
 * @classdesc The MF52A103J3470 class allows for reading of MF52A103J3470 thermistors°
 * @memberof module:j5e/thermometer
 * @async
 * @inheritdoc
 * @extends module:j5e/thermometer~Thermometer
 * @fires data
 * @fires change
 */
class MF52A103J3470 extends Thermometer {

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
   * <caption>Use an MF52A103J3470</caption>
   * import MF52A103J3470 from "j5e/tmp36";
   *
   * const myMF52A103J3470 = await new MF52A103J3470(12);
   *
   * myMF52A103J3470.on("change", function(data) {
   *   trace(data.C);
   * });
   */
  constructor(options) {
    return (async() => {
      options = normalizeParams(options);

      options.toCelsius = function(raw) {
        const beta = 3950;

        // 10 kOhm
        const rb = 10000;

        // Ginf = 1/Rinf
        const ginf = 120.6685;

        const rthermistor = rb * (this.resolution / raw - 1);
        const tempc = beta / (Math.log(rthermistor * ginf));

        return Math.round(tempc - Thermometer.CELSIUS_TO_KELVIN);
      };

      const sensor = await super(options);

      return sensor;
    })();

  }

}

export default MF52A103J3470;
