/**
 * Class Light
 * @module j5e/light
 * @requires module:j5e/sensor
 * @requires module:j5e/fn
 */

import Sensor from "j5e/sensor";
import { constrain, fmap, toFixed, normalizeDevice, normalizeIO } from "j5e/fn";

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

  #state = {
    value: null
  }

  /**
   * Instantiate a light sensor
   * @param {number|string|object} io - Pin identifier or IO Options (See {@tutorial C-INSTANTIATING})
   * @param {object} [options] - Device configuration options
   * @param {number} [options.aref=3.3] - Analog reference voltage
   * @param {boolean} [options.enabled=true] - Wether the device is currently performing reads every <interval>ms
   * @param {number} [options.interval=100] - Interval between readings in millseconds
   * @param {number[]} [options.limit=null] - Limit the output range
   * @param {number[]} [options.range=[0, N]] - The input range of the sensor
   * @param {number[]} [options.scale=[0, N]] - The output range for the sensor's value
   * @param {number} [options.threshold=1] - The minimum amount of change required to emit a "change" event
   * @property {number} level - Get the light level scaled to [0, 1] to two decimal places
   * @example
   * <caption>Use a photoresistor</caption>
   * import Light from "j5e/light";
   *
   * const light = await new Light(12);
   *
   * light.on("change", data => {
   *   trace(light.level);
   * })
   *
   */
  constructor(io, options) {
    return (async() => {
      io = normalizeIO(io);
      options = normalizeDevice(options);

      const sensor = await super(io, options);

      if (options.toLux) {
        this.toLux = options.toLux;
      }

      return sensor;
    })();

  }

  /**
   * Return the current value, scaled [0,1]
   * @type {number}
   * @readonly
   */
  get level() {
    let mapped, constrained;

    mapped = fmap(this.raw, this.scale()[0], this.scale()[1], 0, 1);
    constrained = toFixed(constrain(mapped, 0, 1), 2);
    return constrained;
  }

}

export default Light;
