import Thermometer from "j5e/thermometer";
import { normalizeDevice, normalizeIO } from "j5e/fn";

/**
 * Class representing an lm335
 * @classdesc The LM335 class allows for reading of LM335 thermistors
 * @memberof module:j5e/thermometer
 * @async
 * @inheritdoc
 * @extends module:j5e/thermometer~Thermometer
 * @fires data
 * @fires change
 */
class LM335 extends Thermometer {

  /**
   * Instantiate an LM335 Thermometer
   * @param {number|string|object} io - Pin identifier or IO Options (See {@tutorial C-INSTANTIATING})
   * @param {object} options - Device configuration options
   * @param {number} [options.aref=3.3] - Analog reference voltage
   * @param {boolean} [options.enabled=true] - Wether the device is currently performing reads every <interval>ms
   * @param {number} [options.interval=100] - Interval between readings in millseconds
   * @param {number[]} [options.limit=null] - Limit the output range
   * @param {number[]} [options.range=[0, N]] - The input range of the sensor
   * @param {number[]} [options.scale=[0, N]] - The output range for the sensor's value
   * @param {number} [options.threshold=1] - The minimum amount of change required to emit a "change" event
   * @example
   * <caption>Use a LM335</caption>
   * import LM335 from "j5e/lm335";
   *
   * const myLM335 = await new LM335(12);
   *
   * myLM335.on("change", function(data) {
   *   trace(data.C);
   * });
   */
  constructor(io, options) {
    return (async() => {
      io = normalizeIO(io);
      options = normalizeDevice(options);

      options.toCelsius = function(raw) {
        // OUTPUT 10mV/°K
        const mV = this.aref * 1000 * raw / this.resolution;

        // Page 1
        return Math.round((mV / 10) - Thermometer.CELSIUS_TO_KELVIN);
      };

      const sensor = await super(io, options);

      return sensor;
    })();

  }

}

export default LM335;
