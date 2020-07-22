import Thermometer from "j5e/thermometer";
import { normalizeParams } from "j5e/fn";

/**
 * Class representing an lm35
 * @classdesc The LM35 class allows for reading of LM35 thermistors
 * @memberof module:j5e/thermometer
 * @async
 * @inheritdoc
 * @extends module:j5e/thermometer~Thermometer
 * @fires data
 * @fires change
 */
class LM35 extends Thermometer {

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
   * <caption>Use a LM35</caption>
   * import LM35 from "j5e/lm35";
   *
   * const myLM35 = await new LM35(12);
   *
   * myLM35.on("change", function(data) {
   *   trace(data.C);
   * });
   */
  constructor(options) {
    return (async() => {
      options = normalizeParams(options);

      options.toCelsius = function(raw) {
        // VOUT = 1500 mV at 150°C
        // VOUT = 250 mV at 25°C
        // VOUT = –550 mV at –55°C

        const mV = this.aref * 1000 * raw / this.resolution;

        // 10mV = 1°C
        //
        // Page 1
        return Math.round(mV / 10);
      };

      const sensor = await super(options);

      return sensor;
    })();

  }

}

export default LM35;
