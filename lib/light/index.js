/**
 * Class Light
 * @module j5e/light
 * @requires module:j5e/sensor
 * @requires module:j5e/fn
 */

import Sensor from "j5e/sensor";
import { constrain, fmap, toFixed, normalizeParams } from "j5e/fn";

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
  constructor(options) {
    return (async() => {
      options = normalizeParams(options);
      const sensor = await super(options);

      Object.defineProperties(sensor, {
        level: {
          get() {
            let mapped, constrained;

            mapped = fmap(this.raw, this.scale()[0], this.scale()[1], 0, 1);
            constrained = toFixed(constrain(mapped, 0, 1), 2);
            return constrained;

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
