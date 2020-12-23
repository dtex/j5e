/**
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
  constructor(io) {
    return (async() => {
      io = normalizeIO(io);

      const sensor = await super(io);

      return sensor;
    })();

  }

  /**
   * Configure a Light sensor
   * @returns {Light} The instance on which the method was called
   * @inheritdoc
   * @example
   * import Light from "j5e/light";
   *
   * const light = await new LED(14);
   * light.configure({
   *   interval: 50
   * });
   */
  configure(options = {}) {
    options = normalizeDevice(options);

    super.configure(options);

    if (options.toLux) {
      this.toLux = options.toLux;
    }

    return this;
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
