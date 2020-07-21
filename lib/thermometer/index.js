/**
 * Class template
 * @module j5e/thermometer
 * @requires module:j5e/withinable
 * @requires module:j5e/fn
 */

import Sensor from "j5e/sensor";
import { normalizeParams, toFixed } from "j5e/fn";

/**
 * Class representing a thermistor
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
   * @param {function} options.toCelsius - A function that will be used to calculate the degrees in celisus from this.raw (expects one param). Will not be used if toCelsius is already defined on a subclass. All other getters are based on degrees Celsius so they do not need to be provided.
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
  constructor(options) {
    return (async() => {
      options = normalizeParams(options);

      const sensor = await super(options);

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






















//   LM35: {
//     toCelsius: {
//       value(raw) {
//         // VOUT = 1500 mV at 150°C
//         // VOUT = 250 mV at 25°C
//         // VOUT = –550 mV at –55°C

//         const mV = this.aref * 1000 * raw / 1023;

//         // 10mV = 1°C
//         //
//         // Page 1
//         return round(mV / 10);
//       }
//     }
//   },

//   LM335: {
//     toCelsius: {
//       value(raw) {
//         // OUTPUT 10mV/°K

//         const mV = this.aref * 1000 * raw / 1023;

//         // Page 1
//         return round((mV / 10) - CELSIUS_TO_KELVIN);
//       }
//     }
//   },

//   TMP36: {
//     toCelsius: {
//       value(raw) {
//         // Analog Reference Voltage
//         const mV = this.aref * 1000 * raw / 1023;

//         // tempC = (mV / 10) - 50
//         //
//         // Page 3
//         // Table 1
//         // Accuracy 1°C
//         return round((mV / 10) - 50);
//       }
//     }
//   },

//   TMP102: {
//     initialize: {
//       value(options, callback) {
//         const { Drivers } = require("./sip");
//         const address = Drivers.addressResolver(this, options);

//         this.io.i2cConfig(options);

//         // Addressing is unclear.

//         this.io.i2cRead(address, 0x00, 2, data => {
//           // Based on the example code from https://www.sparkfun.com/products/11931
//           let raw = ((data[0] << 8) | data[1]) >> 4;

//           // The tmp102 does twos compliment but has the negative bit in the wrong spot, so test for it and correct if needed
//           if (raw & (1 << 11)) {
//             raw |= 0xF800; // Set bits 11 to 15 to 1s to get this reading into real twos compliment
//           }

//           // twos compliment
//           raw = raw >> 15 ? ((raw ^ 0xFFFF) + 1) * -1 : raw;

//           callback(raw);
//         });
//       }
//     },
//     toCelsius: {
//       value(raw) {
//         // 6.5 Electrical Characteristics
//         // –25°C to 85°C ±0.5
//         return toFixed(raw / 16, 1);
//       }
//     },
//   },

//   GROVE: {
//     toCelsius: {
//       value(raw) {
//         // http://www.seeedstudio.com/wiki/Grove_-_Temperature_Sensor
//         const adcres = 1023;
//         // Beta parameter
//         const beta = 3975;
//         // 10 kOhm (sensor resistance)
//         const rb = 10000;
//         // Ginf = 1/Rinf
//         // var ginf = 120.6685;
//         // Reference Temperature 25°C
//         const tempr = 298.15;

//         const rthermistor = (adcres - raw) * rb / raw;
//         const tempc = 1 / (log(rthermistor / rb) / beta + 1 / tempr) - CELSIUS_TO_KELVIN;

//         return round(tempc);
//       }
//     }
//   },

//   // MF52A103J3470
//     toCelsius: {
//       value(value) {
//         const adcres = 1023;
//         const beta = 3950;
//         const rb = 10000; // 10 kOhm
//         const ginf = 120.6685; // Ginf = 1/Rinf

//         const rthermistor = rb * (adcres / value - 1);
//         const tempc = beta / (log(rthermistor * ginf));

//         return round(tempc - CELSIUS_TO_KELVIN);
//       }
//     }
//   },



















