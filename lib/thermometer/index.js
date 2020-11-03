/**
 * Class template
 * @module j5e/thermometer
 * @requires module:j5e/withinable
 * @requires module:j5e/fn
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
   * @param {number|string|object} io - Pin identifier or IO Options (See {@tutorial C-INSTANTIATING})
   * @param {object} options - Device configuration options
   * @param {number} [options.aref=3.3] - Analog reference voltage
   * @param {boolean} [options.enabled=true] - Wether the device is currently performing reads every <interval>ms
   * @param {number} [options.interval=100] - Interval between readings in millseconds
   * @param {number[]} [options.limit=null] - Limit the output range
   * @param {number[]} [options.range=[0, N]] - The input range of the sensor
   * @param {number[]} [options.scale=[0, N]] - The output range for the sensor's value
   * @param {number} [options.threshold=1] - The minimum amount of change required to emit a "change" event
   * @param {callback} [options.toCelsius] - A function that will be used to calculate the degrees in celisus from this.raw (expects one param). Will not be used if toCelsius is already defined on a subclass. All other getters are based on degrees Celsius so they do not need to be provided.
   * @example
   * <caption>Use a thermometer</caption>
   * import Thermometer from "j5e/thermometer";
   *
   * const myThermometer = await new Thermometer(12);
   *
   * @example
   * <caption>Pass in a custom toCelsius function</caption>
   * import Thermometer from "j5e/thermometer";
   *
   * const myThermometer = await new Thermometer({
   *   pin: 12,
   *   toCelsius: function(raw) {
   *     return raw / 16;
   *   }
   * }) ;
   */
  constructor(io, options) {
    return (async() => {
      io = normalizeIO(io);
      options = normalizeDevice(options);

      const sensor = await super(io, options);

      if (options.toCelsius) {
        sensor.customToCelsius = options.toCelsius;
      }

      return sensor;
    })();

  }

  /**
   * Get degrees in celsius
   * @type {number}
   * @readonly
   * @example
   * <caption>Get degrees in celsius in action</caption>
   * import Thermometer from "j5e/thermometer";
   *
   * const myThermometer = await new Thermometer(12);
   * myThermometer.on("change", function() {
   *   console.log(myThermometer.celsius);
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
   * <caption>Get degrees in celsius in action</caption>
   * import Thermometer from "j5e/thermometer";
   *
   * const myThermometer = await new Thermometer(12);
   * myThermometer.on("change", function() {
   *   console.log(myThermometer.C);
   */
  get C() {
    return this.celsius;
  }

  /**
   * Get degrees in fahrenheit
   * @type {number}
   * @readonly
   * @example
   * <caption>Get degrees in fahrenheit in action</caption>
   * import Thermometer from "j5e/thermometer";
   *
   * const myThermometer = await new Thermometer(12);
   * myThermometer.on("change", function() {
   *   console.log(myThermometer.fahrenheit);
   */
  get fahrenheit() {
    return toFixed((this.celsius * 9 / 5) + 32, 2);
  }

  /**
   * Alias for fahrenheit
   * @type {number}
   * @readonly
   * @example
   * <caption>Get degrees in fahrenheit in action</caption>
   * import Thermometer from "j5e/thermometer";
   *
   * const myThermometer = await new Thermometer(12);
   * myThermometer.on("change", function() {
   *   console.log(myThermometer.F);
   */
  get F() {
    return this.fahrenheit;
  }

  /**
   * Get degrees in kelvin
   * @type {number}
   * @readonly
   * @example
   * <caption>Get degrees in kelvin in action</caption>
   * import Thermometer from "j5e/thermometer";
   *
   * const myThermometer = await new Thermometer(12);
   * myThermometer.on("change", function() {
   *   console.log(myThermometer.kelvin);
   */
  get kelvin() {
    return toFixed(this.celsius + Thermometer.CELSIUS_TO_KELVIN, 2);
  }

  /**
   * Alias for kelvin
   * @type {number}
   * @readonly
   * @example
   * <caption>Get degrees in kelvin in action</caption>
   * import Thermometer from "j5e/thermometer";
   *
   * const myThermometer = await new Thermometer(12);
   * myThermometer.on("change", function() {
   *   console.log(myThermometer.K);
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
