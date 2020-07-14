/**
 * Class Light
 * @module j5e/light
 * @requires module:j5e/sensor
 * @requires module:j5e/fn
 */

import Sensor from "j5e/sensor";
import { toFixed, normalizeParams } from "j5e/fn";

/**
 * Class representing a light sensor
 * @classdesc The Light class allows for control of photoresistors
 * @async
 * @inheritdoc
 * @extends module:j5e/sensor~Sensor
 * @fires data
 * @fires change
 */
class Light extends Sensor {

  /**
   * Instantiate a light sensor
   * @param {object} options - A pin number, pin identifier or a complete IO options object (See {@tutorial C-INSTANTIATING}
   * @param {number} [options.interval=100] - Interval between readings in millseconds
   * @param {number[]} [options.range=[0, N]] - The input range of the sensor
   * @param {number[]} [options.scale=[0, N]] - The output range for the sensor's value
   * @param {number[]} [options.limit=null] - Limit the output range
   * @param {number} [options.threshold=1] - The minimum amount fo change required to emit a "change" event
   * @param {boolean} [options.enabled=true] - Wether the device is currently performing reads based on the interval value
   * @property {number} value - Get the most recent scaled median value
   * @property {number} scaled - Get the most recent scaled raw value
   * @property {number} raw - Get the most recent raw ADC reading
   * @property {number} resolution - The maximum possible ADC reading
   * @property {number} smoothing - The number of samples to take before finding the median value
   * @example
   * <caption>Use a photoresistor</caption>
   * import Light from "j5e/light";
   *
   * const light = await new Light(12);
   *
   * light.on("change", data => {
   *   trace(data);
   * })
   *
   */
  constructor(options) {
    return (async() => {
      options = normalizeParams(options);
      const sensor = await super(options);

      Object.defineProperties(sensor, {
        level: {
          get() {
            return toFixed(sensor.scaleTo(0, 100) / 100, 2);
          }
        }
      });

      if (options.toLux) {
        this.toLux = options.toLux;
      }

      return sensor;
    })();

  }

}

export default Light;
