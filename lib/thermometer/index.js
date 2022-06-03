/**
 * @module j5e/thermometer
 * @description A module for measuring temperature using a thermistor.
 * @requires module:j5e/withinable
 * @requires module:j5e/fn
 * @link https://en.wikipedia.org/wiki/Thermistor
 */

import Sensor from "j5e/sensor";
import { normalizeDevice, normalizeIO, toFixed } from "j5e/fn";

/**
 * Class representing a generic thermistor
 * @classdesc The Thermometer class allows for control of analog thermistors
 * @async
 * @inheritdoc
 * @extends module:j5e/sensor~Sensor
 * @fires data
 * @fires change
 */
class Thermometer extends Sensor {

  static CELSIUS_TO_KELVIN = 273.15;

  /**
   * Instantiate a Thermometer
   * @param {number|string|object} io - Pin identifier or IO Options (See {@link https://j5e.dev/core-concepts/instantiation/|instantiation})
   * @example
   * // Use a thermometer
   * import Thermometer from "j5e/thermometer";
   *
   * const myThermometer = await new Thermometer(12);
   *
   * @example
   * // Pass in a custom toCelsius function
   * import Thermometer from "j5e/thermometer";
   *
   * const myThermometer = await new Thermometer({
   *   pin: 12
   * });
   */
  constructor(io) {
    return (async() => {
      io = normalizeIO(io);

      const sensor = await super(io);

      sensor.configure();

      return sensor;
    })();

  }

  /**
   * Configure a Thermometer
   * @returns {Thermometer} The instance on which the method was called
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
   * // Passing in Cofiguration Options
   import Thermometer from "j5e/thermometer";
   *
   * const thermometer = await new Thermometer({
   *   pin: 14
   * });
   *
   * myThermometer.configure({
   *   toCelsius: function(raw) {
   *     return raw / 16;
   *   }
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

  /**
   * Get degrees in celsius
   * @type {number}
   * @readonly
   * @example
   * // Get degrees in celsius in action
   * import Thermometer from "j5e/thermometer";
   *
   * const myThermometer = await new Thermometer(12);
   * myThermometer.on("change", function() {
   *   console.log(myThermometer.celsius);
   * });
   */
  get celsius() {
    if (this.customToCelsius) {
      return this.customToCelsius(this.median || this.value);
    } else {
      return this.toCelsius(this.median || this.value);
    }
  }

  /**
   * Alias for celsius
   * @type {number}
   * @readonly
   * @example
   * // Get degrees in celsius in action
   * import Thermometer from "j5e/thermometer";
   *
   * const myThermometer = await new Thermometer(12);
   * myThermometer.on("change", function() {
   *   console.log(myThermometer.C);
   * });
   */
  get C() {
    return this.celsius;
  }

  /**
   * Get degrees in fahrenheit
   * @type {number}
   * @readonly
   * @example
   * // Get degrees in fahrenheit in action
   * import Thermometer from "j5e/thermometer";
   *
   * const myThermometer = await new Thermometer(12);
   * myThermometer.on("change", function() {
   *   console.log(myThermometer.fahrenheit);
   * });
   */
  get fahrenheit() {
    return toFixed((this.celsius * 9 / 5) + 32, 2);
  }

  /**
   * Alias for fahrenheit
   * @type {number}
   * @readonly
   * @example
   * // Get degrees in fahrenheit in action
   * import Thermometer from "j5e/thermometer";
   *
   * const myThermometer = await new Thermometer(12);
   * myThermometer.on("change", function() {
   *   console.log(myThermometer.F);
   * });
   */
  get F() {
    return this.fahrenheit;
  }

  /**
   * Get degrees in kelvin
   * @type {number}
   * @readonly
   * @example
   * // Get degrees in kelvin in action
   * import Thermometer from "j5e/thermometer";
   *
   * const myThermometer = await new Thermometer(12);
   * myThermometer.on("change", function() {
   *   console.log(myThermometer.kelvin);
   * });
   */
  get kelvin() {
    return toFixed(this.celsius + Thermometer.CELSIUS_TO_KELVIN, 2);
  }

  /**
   * Alias for kelvin
   * @type {number}
   * @readonly
   * @example
   * // Get degrees in kelvin in action
   * import Thermometer from "j5e/thermometer";
   *
   * const myThermometer = await new Thermometer(12);
   * myThermometer.on("change", function() {
   *   console.log(myThermometer.K);
   * });
   */
  get K() {
    return this.kelvin;
  }

  /**
   * Convert a raw reading to Celsius
   * param {number} value
   * @private
   */
  toCelsius(value) {
    return value;
  }

  /**
   * Internal method for processing reads
   * @access private
   */
  emitEvents() {
    let boundary;
    const data = {};
    data.C = data.celsius = this.celsius;
    data.F = data.fahrenheit = this.fahrenheit;
    data.K = data.kelvin = this.kelvin;
    data.raw = this.raw;

    this.emit("data", data);

    if (typeof this.last === "undefined") {
      this.last = this.median;
    }

    // If the filtered (#state.median) value for this interval is at least ± the
    // configured threshold from last, fire change events
    if (this.median <= (this.last - this.threshold) || this.median >= (this.last + this.threshold)) {
      this.emit("change", data);
      // Update the instance-local `last` value (only) when a new change event
      // has been emitted.  For comparison in the next interval
      this.last = this.median;
    }

    if (this.limit) {
      if (this.median <= this.limit[0]) {
        boundary = "lower";
      }
      if (this.median >= this.limit[1]) {
        boundary = "upper";
      }

      if (boundary) {
        this.emit("limit", {
          boundary,
          value: this.median
        });
        this.emit(`limit:${boundary}`, this.median);
      }
    }
  }

}

export default Thermometer;
