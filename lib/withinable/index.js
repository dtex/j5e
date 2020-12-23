import { Emitter } from "j5e/event";

/**
 * For emitting events when value is within a certain range
 * @module j5e/withinable
 * @requires module:j5e/event
 * @ignore
 */

/**
 * @extends module:j5e/event.Emitter
 * @ignore
 */
class Withinable extends Emitter {

  constructor() {
    super();
  }

  /**
   * Fire a callback when the value is within a certain range
   * @param {number[]} range - The upper and lower ends of the range to watch
   * @param {string} unit - The property to test
   * @param {function} callback - A callback to run when the event is fired.
   */
  within(range, unit, callback) {
    if (typeof range === "number") {
      range = [0, range];
    }

    if (!Array.isArray(range)) {
      throw new Error("within expected a range array");
    }

    if (typeof unit === "function") {
      callback = unit;
      unit = "value";
    }

    if (typeof this[unit] === "undefined") {
      return this;
    }

    this.on("data", () => {
      const value = this[unit];
      if (value >= range[0] && value <= range[1]) {
        callback.call(this, null, value);
      }
    });

    return this;
  }
}

export default Withinable;
