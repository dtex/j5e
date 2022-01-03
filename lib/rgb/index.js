/**
 * @description A module for controlling RGB LED's using PWM on 3 pins, one for each color.
 * @module j5e/rgb
 * @requires module:j5e/animation
 * @requires module:j5e/easing
 * @requires module:j5e/fn
 * @link https://en.wikipedia.org/wiki/Light-emitting_diode
 * @link https://en.wikipedia.org/wiki/Pulse-width_modulation
 * @link https://en.wikipedia.org/wiki/RGB_color_model
 */

import { normalizeIO, normalizeDevice, normalizeMulti, constrain, map, getProvider, timer, asyncForEach } from "j5e/fn";
import { inOutSine, outSine } from "j5e/easing";
import Animation from "j5e/animation";

/**
 * Class representing an RGB LED
 * @classdesc The RGB class allows for control of RGB LED's
 * @async
 */
class RGB {

  #state = {
    // red, green, and blue store the raw color set via .color()
    red: 0,
    green: 0,
    blue: 0,
    intensity: 100,
    sink: false,
    interval: null,
    // values takes state into account, such as on/off and intensity
    values: {
      red: 0,
      green: 0,
      blue: 0
    }
  };

  static colors = ["red", "green", "blue"];

  /**
   * Instantiate an RGB LED
   * @param {number[]|string[]|object[]|object} io - An array of pin identifiers or IO Options in RGB order, or an RGB IO options object (See {@link https://j5e.dev/core-concepts/instantiation/|instantiation})
   * @param {object} [io.red] - Pin identifier or IO Options for the red channel
   * @param {object} [io.green] - Pin identifier or IO Options for the green channel
   * @param {object} [io.blue] - Pin identifier or IO Options for the blue channel
   * @example
   * // Using an array of pin numbers
   * import RGB from "j5e/rgb";
   *
   * const rgb = await new RGB([13, 12, 14]);
	 * rgb.color("#663399");
	 * rgb.blink();
   *
   * @example
   * // Using an array of pin identifiers
   * import RGB from "j5e/rgb";
   *
   * const rgb = await new RGB(["A1", "A3", "A4"]);
	 * rgb.color("#663399");
	 * rgb.blink();
   *
   * @example
   * // Using an array of option objects
   * import RGB from "j5e/rgb";
   * import PCA9685 from "PCA9685Expander"
   *
   * const rgb = await new RGB([
   *   { pin: 0, io: PCA9685 },
   *   { pin: 1, io: PCA9685 },
   *   { pin: 2, io: PCA9685 }
   * ]);
	 * rgb.color("#663399");
	 * rgb.blink();
   *
   * @example
   * // Using an RGB options object
   * import RGB from "j5e/rgb";
   * import PCA9685 from "PCA9685Expander"
   *
   * const rgb = await new RGB({
   *   red: 0,
   *   green: {
   *     io: PCA9685
   *     pin: 1
   *   },
   *   blue: 3
   * });
	 * rgb.color("#663399");
	 * rgb.blink();
   *
   */
  constructor(io) {
    return (async() => {

      if (Array.isArray(io)) {
        if (io.length !== 3) {
          throw "RGB expects three pins";
        }
        io = {
          red: io[0],
          green: io[1],
          blue: io[2]
        };
      }

      io.red = normalizeIO(io.red);
      io.green = normalizeIO(io.green);
      io.blue = normalizeIO(io.blue);

      this.LOW = {
        red: 0,
        green: 0,
        blue: 0
      };
      this.io = {};
      this.HIGH = {};

      this.keys = ["red", "green", "blue"];

      await asyncForEach(RGB.colors, async(color, index) => {

        let ioOptions = io[color];
        const Provider = await getProvider(ioOptions, "PWM");

        this.io[color] = new Provider({
          pin: ioOptions.pin
        });

        if (this.io[color].resolution) {
          this.HIGH[color] = (1 << this.io[color].resolution) - 1;
        } else {
          this.HIGH[color] = 1;
        }

        this.#state[color] = this.HIGH[color];
      });

      this.configure();

      this.off();
      return this;

    })();
  }

  /**
   * Configure an RGB LED
   * @returns {RGB} The instance on which the method was called
   * @param {object} options - Device configuration options
   * @param {number} [options.sink=false] - True if an element is common anode
   * @example
   * import RGB from "j5e/rgb";
   *
   * const rgb = await new RGB([13, 12, 14]);
	 * rgb.color("#663399");
	 * rgb.blink();
   */
  configure(options = {}) {
    options = normalizeDevice(options);

    if (typeof options.sink !== "undefined") {
      this.#state.sink = true;
    }

    this.initialize(options);

    return this;
  }

  /**
   * If the RGB is on
   * @type {boolean}
   * @readonly
   */
  get isOn() {
    return RGB.colors.some((color) => {
      return this.#state[color] > 0;
    });
  }

  /**
   * If the RGB is pulsing, blinking or running an animation
   * @type {boolean}
   * @readonly
   */
  get isRunning() {
    return !!this.#state.interval;
  }

  /**
   * If the RGB is wired for common anode
   * @type {boolean}
   * @readonly
   */
  get isAnode() {
    return this.#state.isAnode;
  }

  /**
   * The current RGB values
   * @type {number[]}
   * @readonly
   */
  get values() {
    return Object.assign({}, this.#state.values);
  }

  initialize(options) {

  }

  /**
   * Internal method that writes the current LED value to the IO
   * @private
   */
  write(colors) {
    RGB.colors.forEach((color, index) => {

      let value = constrain(colors[color], 0, 1);

      if (this.#state.sink) {
        value = 1 - value;
      }

      value = map(value, 0, 1, this.LOW[color], this.HIGH[color]);

      this.io[color].write(value);
    });

  }

  /**
   * internal method use to update the color in the private state
   * @private
   */
  update(colors) {

    colors = colors || this.color();
    this.#state.values = this.toScaledRGB(this.#state.intensity, colors);
    this.write(this.#state.values);

    Object.assign(this.#state, colors);
  }

  /**
   * Control an RGB LED's color value. Accepts Hexadecimal strings, an array of color values, and RGB object or a separate argument for each color.
   *
   * @param  {String|Array|Object|Number} red Hexadecimal color string, Array of color values, RGB object {red, green, blue}, or the value of the red channel [0, 1]
   * @param {Number} [green] The value of the green channel [0, 1]
   * @param {Number} [blue] The value of the blue channel [0, 1]
   *
   * @return {RGB}
   * @example
   * // Use a hex value to make it purple
   * import RGB from "j5e/rgb";
   *
   * const rgb = await new RGB([13, 12, 14]);
	 * rgb.color("#663399");
   *
   * @example
   * // Use an RGB String to make it purple
   * import RGB from "j5e/rgb";
   *
   * const rgb = await new RGB([13, 12, 14]);
	 * rgb.color("rgb(0.4, 0.2, 0.6)");
   *
   * @example
   * // Use an RGBA String to make it darker purple
   * import RGB from "j5e/rgb";
   *
   * const rgb = await new RGB([13, 12, 14]);
	 * rgb.color("rgba(0.4, 0.2, 0.6, 50%)");
   *
   * @example
   * // Use an array to make it purple
   * import RGB from "j5e/rgb";
   *
   * const rgb = await new RGB([13, 12, 14]);
	 * rgb.color([0.4, 0.2, 0.6]);
   *
   * @example
   * // Use an object to make it purple
   * import RGB from "j5e/rgb";
   *
   * const rgb = await new RGB([13, 12, 14]);
	 * rgb.color({
   *   red: 0.4,
   *   green: 0.2,
   *   blue: 0.6
   * });
   *
   * @example
   * // Use seperate Red, Green, and Blue arguments to make it purple
   * import RGB from "j5e/rgb";
   *
   * const rgb = await new RGB([13, 12, 14]);
	 * rgb.color(0.4, 0.2, 0.6);
   */
  color(red, green, blue) {

    let colors;

    if (arguments.length === 0) {
      // Return a copy of the state values,
      // not a reference to the state object itself.
      colors = this.isOn ? this.#state : state.prev;
      const result = RGB.colors.reduce((current, color) => {
        return (current[color] = Math.round(colors[color]), current);
      }, {});
      return result;
    }

    let update = this.toRGB(red, green, blue);

    // Validate all color values before writing any values
    RGB.colors.forEach(color => {
      let value = update[color];

      if (value == null) {
        throw new Error("RGB.color: invalid color ([" + [update.red, update.green, update.blue].join(",") + "])");
      }

      value = constrain(value, 0, 1);
      update[color] = value;
    });

    this.update(update);

    return this;
  };

  /**
   * Turn an RGB LED on with whatever the current color value is
   * @return {RGB}
   * @example
   * // Make it on
   * import RGB from "j5e/rgb";
   *
   * const rgb = await new RGB([13, 12, 14]);
	 * rgb.on(); // Default color is white
   */
  on() {
    let colors;
    if (!this.isOn) {
      colors = this.#state.prev || {
        red: 1,
        green: 1,
        blue: 1
      };

      this.#state.prev = null;
      this.update(colors);
    }

    return this;
  }

  /**
   * Turn an RGB LED off
   * @return {RGB}
   * @example
   * // Make it purple for five seconds
   * import RGB from "j5e/rgb";
   * import {timer} from "j5e/fn";
   *
   * const rgb = await new RGB([13, 12, 14]);
	 * rgb.color("#663399");
   *
   * time.setTimeout(function() {
   *   rgb.off();
   * }, 5000);
   */
  off() {

    if (this.isOn) {
      this.#state.prev = RGB.colors.reduce((current, color) => {
        return (current[color] = this.#state[color], current);
      }, {});

      RGB.colors.forEach(color => {
        this.#state.values[color] = this.LOW[color];
      });

      this.update({
        red: 0,
        green: 0,
        blue: 0
      });

    }
    return this;
  }

  /**
   * Toggle the on/off state of an RGB LED
   * @return {RGB}
   * @example
   * // Make it purple for five seconds
   * import RGB from "j5e/rgb";
   * import {timer} from "j5e/fn";
   *
   * const rgb = await new RGB([13, 12, 14]);
	 * rgb.toggle(); // Turns RGB LED on
   *
   * time.setTimeout(function() {
   *   rgb.toggle(); // Turns it off
   * }, 5000);
   */
  toggle() {
    return this[this.isOn ? "off" : "on"]();
  }

  /**
   * Blink an RGB LED on a fixed interval
   * @param {Number} duration=100 - Time in ms on, time in ms off
   * @param {Function} callback - Method to call on blink
   * @return {RGB}
   * @example
   * // Make it blink
   * import RGB from "j5e/rgb";
   *
   * const rgb = await new RGB([13, 12, 14]);
	 * rgb.color("#663399");
   * rgb.blink();
   *
   * @example
   * // Make it blink slowly
   * import RGB from "j5e/rgb";
   *
   * const rgb = await new RGB([13, 12, 14]);
	 * rgb.color("#663399");
   * rgb.blink(5000);
   */
  blink(duration = 100, callback) {
    // Avoid traffic jams
    this.stop();

    if (typeof duration === "function") {
      callback = duration;
      duration = 100;
    }

    this.#state.interval = timer.setInterval(() => {
      this.toggle();
      if (typeof callback === "function") {
        callback();
      }
    }, duration);

    return this;
  }

  /**
   * fade Fade an RGB LED from its current value to a new value
   * @param {Number[]|String|Object} val Hexadecimal color string, CSS color name, Array of color values, RGB object {red, green, blue}
   * @param {Number} [time=1000] Time in ms that a fade will take
   * @param {function} [callback] A function to run when the fade is complete
   * @return {RGB}
   * @example
   * // Fade on to purple
   * import RGB from "j5e/rgb";
   *
   * const rgb = await new RGB([13, 12, 14]);
   * rgb.fade("#663399");
   *
   * @example
   * // Fade on to purple over 3 seconds
   * import RGB from "j5e/rgb";
   *
   * const rgb = await new RGB([13, 12, 14]);
   * rgb.fade("#663399", 3000);
   *
   * @example
   * // Fade on to purple over 3 seconds and then blink
   * import RGB from "j5e/rgb";
   *
   * const rgb = await new RGB([13, 12, 14]);
   * rgb.fade("#663399", 3000, function() {
   *   rgb.blink();
   * });
   */
  fade(val, time = 1000, callback) {

    this.stop();

    const options = {
      duration: typeof time === "number" ? time : 1000,
      keyFrames: [null, val || "#ffffff"],
      easing: outSine,
      oncomplete: function() {
        this.stop();
        if (typeof callback === "function") {
          callback();
        }
      }
    };

    if (typeof val === "function") {
      callback = val;
    }

    if (typeof time === "function") {
      callback = time;
    }

    this.animate(options);

    return this;
  }

  /**
   * Fade an RGB LED to full brightness
   * @param {Number} [time=1000] Time in ms that a fade will take
   * @param {function} [callback] A function to run when the fade is complete
   * @return {RGB}
   * @example
   * // Fade an RGB LED to white over half a second
   * import RGB from "j5e/rgb";
   *
   * const rgb = await new RGB([13, 12, 14]);
   * rgb.fadeIn(500);
   */
  fadeIn(time = 1000, callback) {
    return this.fade([1, 1, 1], time, callback);
  }

  /**
   * Fade an RGB LED off
   * @param {Number} [time=1000] Time in ms that a fade will take
   * @param {function} [callback] A function to run when the fade is complete
   * @return {RGB}
   * @example
   * // Fade out an RGB LED over half a second
   * import RGB from "j5e/rgb";
   *
   * const rgb = await new RGB([13, 12, 14]);
   * rgb.color("#663399");
   * rgb.fadeOut(500);
   */
  fadeOut(time = 1000, callback) {
    return this.fade([0, 0, 0], time, callback);
  }

  /**
   * Pulse an RGB LED on a fixed interval
   * @param {Number} duration=1000 - Time in ms on, time in ms off
   * @param {Function} callback - Method to call on pulse
   * @return {RGB}
   * @example
   * // Make it pulse
   * import RGB from "j5e/rgb";
   *
   * const rgb = await new RGB([13, 12, 14]);
	 * rgb.color("#663399");
   * rgb.pulse();
   *
   * @example
   * // Make it pulse slowly
   * import RGB from "j5e/rgb";
   *
   * const rgb = await new RGB([13, 12, 14]);
	 * rgb.color("#663399");
   * rgb.pulse(5000);
   */
  pulse(time = 1000, callback) {

    var options = {
      duration: typeof time === "number" ? time : 1000,
      cuePoints: [0, 1],
      keyFrames: [[0, 0, 0], [1, 1, 1]],
      metronomic: true,
      loop: true,
      easing: inOutSine,
      onloop: function() {
        /* istanbul ignore else */
        if (typeof callback === "function") {
          callback();
        }
      }
    };

    if (typeof time === "object") {
      Object.assign(options, time);
    }

    if (typeof time === "function") {
      callback = time;
    }
    return this.animate(options);
  }

  /**
   * Animate an RGB LED
   * @param {Object} options (See {@link https://j5e.dev/core-concepts/animation/|animation})
   * @return {RGB}
   * @example
   * // Animate an RGB LED using an animation segment options object
   * import RGB from "j5e/rgb";
   *
   * const rgb = await new RGB([13, 12, 14]);
   * rgb.animate({
   *   duration: 4000,
	 *   cuePoints: [0,  0.33, 0.66, 1],
	 *   keyFrames: ["#000000", "#FF0000", "#00FFFF", "#FFFFFF"],
	 *   loop: true,
   *   metronomic: true
   * });
   */
  animate(options) {
    // Avoid traffic jams
    this.stop();

    this.#state.isRunning = true;

    this.#state.animation = this.#state.animation || new Animation(this);
    this.#state.animation.enqueue(options);
    return this;
  }

  /**
   * Stop the RGB LED from pulsing, blinking, fading, or animating
   * @return {RGB}
   * @example
   * // Make it pulse for five seconds and then stop
   * import RGB from "j5e/rgb";
   * import {timer} from "j5e/fn";
   *
   * const rgb = await new RGB([13, 12, 14]);
	 * rgb.color("#663399");
   * rgb.pulse(250);
   * timer.setTimeout(function() {
   *   rgb.stop();
   * }, 5000);
   */
  stop() {

    if (this.#state.interval) {
      timer.clearInterval(this.#state.interval);
    }

    if (this.#state.animation) {
      this.#state.animation.stop();
    }

    this.#state.interval = null;

    return this;
  }

  intensity(intensity) {
    if (arguments.length === 0) {
      return this.#state.intensity;
    }

    this.#state.intensity = constrain(intensity, 0, 100);

    this.update();

    return this;
  };

  /**
   * toScaledRGB
   * Scale the output values based on the current intensity
   * @private
   */
  toScaledRGB(intensity, colors) {
    var scale = intensity / 100;

    return RGB.colors.reduce(function(current, color) {
      return (current[color] = colors[color] * scale, current);
    }, {});
  }

  /**
   * toRGB
   * Convert a color to an object
   * @private
   */
  toRGB(red, green, blue) {
    let update = {};
    let flags = 0;
    let input;

    if (typeof red !== "undefined") {
      // 0b100
      flags |= 1 << 2;
    }

    if (typeof green !== "undefined") {
      // 0b010
      flags |= 1 << 1;
    }

    if (typeof blue !== "undefined") {
      // 0b001
      flags |= 1 << 0;
    }

    if ((flags | 0x04) === 0x04) {
      input = red;

      if (input == null) {
        throw new Error("Invalid color (" + input + ")");
      }

      /* istanbul ignore else */
      if (Array.isArray(input)) {
        // color([Byte, Byte, Byte])
        update = {
          red: input[0],
          green: input[1],
          blue: input[2]
        };
      } else if (typeof input === "object") {
        // color({
        //   red: Byte,
        //   green: Byte,
        //   blue: Byte
        // });
        update = {
          red: input.red,
          green: input.green,
          blue: input.blue
        };
      } else if (typeof input === "string") {

        // color("#ffffff") or color("ffffff")
        let re = new RegExp("^#?[0-9A-Fa-f]{6}$");
        if (re.test(input)) {

          // remove the leading # if there is one
          if (input.length === 7 && input[0] === "#") {
            input = input.slice(1);
          }

          update = {
            red: parseInt(input.slice(0, 2), 16) / 255,
            green: parseInt(input.slice(2, 4), 16) / 255,
            blue: parseInt(input.slice(4, 6), 16) / 255
          };
        } else {
          // color("rgba(r, g, b, a)") or color("rgb(r, g, b)")
          // color("rgba(r g b a)") or color("rgb(r g b)")
          if (/^rgb/.test(input)) {
            const args = input.match(/^rgba?\(([^)]+)\)$/)[1].split(/[\s,]+/);

            // If the values were %...
            if (this.isPercentString(args[0])) {
              args[0] = Math.round((parseInt(value, 10) / 100));
              args[1] = Math.round((parseInt(value, 10) / 100));
              args[2] = Math.round((parseInt(value, 10) / 100));
            }

            update = {
              red: parseInt(args[0], 10),
              green: parseInt(args[1], 10),
              blue: parseInt(args[2], 10)
            };

            // If rgba(...)
            if (args.length > 3) {
              if (this.isPercentString(args[3])) {
                args[3] = parseInt(args[3], 10) / 100;
              }
              update = this.toScaledRGB(100 * parseFloat(args[3]), update);
            }
          } else {
            // color name
            return this.toRGB(converter.keyword.rgb(input.toLowerCase()));
          }
        }
      }
    } else {
      // color(red, green, blue)
      update = {
        red: red,
        green: green,
        blue: blue
      };
    }

    return update;
  }

  /**
   * normalize
   * @private
   * @param [number || object] keyFrames An array of step values or a keyFrame objects
   */
  normalize(keyFrames) {
    // If user passes null as the first element in keyFrames use current value
    if (keyFrames[0] === null) {
      keyFrames[0] = this.#state.values;
    }

    return keyFrames.reduce((accum, frame) => {
      let normalized = {};
      const value = frame;
      let color = null;
      let intensity = this.#state.intensity;

      if (frame !== null) {
        // Frames that are just numbers are not allowed
        // because it is ambiguous.
        if (typeof value === "number") {
          throw new Error("RGB LEDs expect a complete keyFrame object or hexadecimal string value");
        }

        if (typeof value === "string") {
          color = value;
        }

        if (Array.isArray(value)) {
          color = value;
        } else {

          if (typeof value === "object") {
            if (typeof value.color !== "undefined") {
              color = value.color;
            } else {
              color = value;
            }
          }
        }

        if (typeof frame.intensity === "number") {
          intensity = frame.intensity;
          delete frame.intensity;
        }

        normalized.easing = frame.easing;
        normalized.value = this.toScaledRGB(intensity, this.toRGB(color));
      } else {
        normalized = frame;
      }

      accum.push(normalized);

      return accum;
    }, []);
  }

  /**
   * render
   * @private
   */
  render(frames) {
    return this.color(frames[0]);
  };

  /**
   * isPercentString
   * @private
   * @returns boolean
   */
  isPercentString(input) {
    return typeof input === "string" && input.endsWith("%");
  }

}

export default RGB;
