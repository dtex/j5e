/**
 * RGB module - For controlling RGB LED's
 * @module j5e/rgb
 */

import {normalizeIO, normalizeDevice, constrain, getProvider, timer, asyncForEach} from "@j5e/fn";
import {inOutSine, outSine} from "@j5e/easing";
import Animation from "@j5e/animation";

/** 
 * Class representing an RGB LED
 * @classdesc The RGB class allows for control of RGB LED's
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
   * @param {(number[]|string[]|object[])} io - An array of 3 pin identifiers, IO options, or IO instances
   * @param {(number[]|string[]|object)} [io.pins] - A pin number array, pin identifier array or a complete pins object
   * @param {(number|string)} [io.pins.red] - A pin number or pin identifier for the red channel
   * @param {(number|string)} [io.pins.green] - A pin number or pin identifier for the green channel
   * @param {(number|string)} [io.pins.blue] - A pin number or pin identifier for the blue channel
   * @param {(string|constructor|Array<string|constructor>)} [io.io=builtin/pwm] - A string specifying a path to the IO provider or a constructor, or an array of strings and/or constructors in RGB order 
   * @param {object} [device={}] - An object containing device options
   * @param {boolean} [device.sink=false] - True if the device is wired for sink drive
   */
  constructor(io, device) {
    return (async () => {
      if (!Array.isArray(io) || io.length !== 3) {
        throw "RGB expects an array of three elements for the io parameter";
      }
      let deviceOpts = normalizeDevice(device);
      if (deviceOpts.sink) {
        this.#state.sink = true;
      }

      this.LOW = {
        red: 0,
        green: 0,
        blue: 0
      };
      this.io = {};
      this.HIGH = {};

      this.keys = ["red", "green", "blue"];
    
      await asyncForEach(RGB.colors, async (color, index) => {
        let ioOpts = normalizeIO(io[index]);
        const Provider = await getProvider(ioOpts, "builtin/pwm");
        this.io[color] = await new Provider({
          pin: ioOpts.pin,
          mode: Provider.Output
        });
    
        if (this.io[color].resolution) {
          this.HIGH[color] = (1 << this.io[color].resolution) -1;
        } else {
          this.HIGH[color] = 1;
        }

        this.#state[color] = this.HIGH[color];
      });
    
      Object.defineProperties(this, {
        isOn: {
          get: function() {
            return RGB.colors.some((color) => {
              return this.#state[color] > 0;
            });
          }
        },
        isRunning: {
          get: function() {
            return !!this.#state.interval;
          }
        },
        isAnode: {
          get: function() {
            return this.#state.isAnode;
          }
        },
        values: {
          get: function() {
            return Object.assign({}, this.#state.values);
          }
        },
        update: {
          value: function(colors) {
            
            colors = colors || this.color();
            this.#state.values = this.toScaledRGB(this.#state.intensity, colors);
            this.write(this.#state.values);

            Object.assign(this.#state, colors);
          }
        }
      });

      this.initialize(deviceOpts);
      this.off();
      return this;
      
    })();
  }

  initialize(deviceOpts) {
    
  }

  /**
   * color
   *
   * @param  {String} color Hexadecimal color string or CSS color name
   * @param  {Array} color Array of color values
   * @param  {Object} color object {red, green, blue}
   *
   * @return {RGB}
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

    var update = this.toRGB(red, green, blue);

    // Validate all color values before writing any values
    RGB.colors.forEach(color => {
      let value = update[color];

      if (value == null) {
        throw new Error("RGB.color: invalid color ([" + [update.red, update.green, update.blue].join(",") + "])");
      }

      value = constrain(value, this.LOW[color], this.HIGH[color]);
      update[color] = value;
    });

    this.update(update);

    return this;
  };

  /**
   * Internal method that writes the current LED value to the IO
   */
  write(colors) {
    RGB.colors.forEach((color, index) => {
      
      let value = colors[color];
    
      if (this.#state.sink) {
        value = this.HIGH[color] - value;
      }
    
      this.io[color].write(value | 0);
    });

  }

  /**
   * Turn the led off
   * @return {Led}
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
   * Turn an led on
   * @return {Led}
   */
  on() {
    let colors;
    if (!this.isOn) {
      colors = this.#state.prev || {
        red: this.HIGH.red,
        green: this.HIGH.green,
        blue: this.HIGH.blue
      };
      
      this.#state.prev = null;  
      this.update(colors);
    }
    
    return this;
  }

  /**
   * Toggle the on/off state of an led
   * @return {Led}
   */
  toggle() {
    return this[this.isOn ? "off" : "on"]();
  }

  /**
   * Blink the LED on a fixed interval
   * @param {Number} duration=100 - Time in ms on, time in ms off
   * @param {Function} callback - Method to call on blink
   * @return {RGB}
   */
  blink(duration=100, callback) {
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
   * Pulse the LED on a fixed interval
   * @param {Number} duration=100 - Time in ms on, time in ms off
   * @param {Function} callback - Method to call on pulse
   * @return {RGB}
   */
  pulse(time=1000, callback) {
    // Avoid traffic jams
    this.stop();

    var options = {
      duration: typeof time === "number" ? time : 1000,
      cuePoints: [0, 1],
      keyFrames: [[this.LOW.red, this.LOW.green, this.LOW.blue], [this.HIGH.red, this.HIGH.green, this.HIGH.blue]],
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

    this.#state.isRunning = true;

    this.#state.animation = this.#state.animation || new Animation(this);
    this.#state.animation.enqueue(options);
    return this;
  }

  /**
   * Animate the RGB LED
   * @param {Object} options
   * @return {RGB}
   */
  animate(options) {
    // Avoid traffic jams
    this.stop();

    this.#state.isRunning = true;

    this.#state.animation = this.#state.animation || new Animation(this);
    this.#state.animation.enqueue(options);
    return this;
  }

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
   */
  toScaledRGB(intensity, colors) {
    var scale = intensity / 100;
  
    return RGB.colors.reduce(function(current, color) {
      return (current[color] = Math.round(colors[color] * scale), current);
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
        let re = new RegExp('^#?[0-9A-Fa-f]{6}$');
        if (re.test(input)) {

          // remove the leading # if there is one
          if (input.length === 7 && input[0] === "#") {
            input = input.slice(1);
          }

          update = {
            red: parseInt(input.slice(0, 2), 16),
            green: parseInt(input.slice(2, 4), 16),
            blue: parseInt(input.slice(4, 6), 16)
          };
        } else {
          // color("rgba(r, g, b, a)") or color("rgb(r, g, b)")
          // color("rgba(r g b a)") or color("rgb(r g b)")
          if (/^rgb/.test(input)) {
            var args = input.match(/^rgba?\(([^)]+)\)$/)[1].split(/[\s,]+/);

            // If the values were %...
            if (isPercentString(args[0])) {
              args.forEach(function(value, index) {
                // Only convert the first 3 values
                if (index <= 2) {
                  args[index] = Math.round((parseInt(value, 10) / 100) * 255);
                }
              });
            }

            update = {
              red: parseInt(args[0], 10),
              green: parseInt(args[1], 10),
              blue: parseInt(args[2], 10)
            };

            // If rgba(...)
            if (args.length > 3) {
              if (isPercentString(args[3])) {
                args[3] = parseInt(args[3], 10) / 100;
              }
              update = RGB.toScaledRGB(100 * parseFloat(args[3]), update);
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
   * 
   * @private
   * 
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
   *
   * @private
   * 
   * @color [object] color object
   */
  render(frames) {
    return this.color(frames[0]);
  };

}

























  

  



  


// //   /**
// //    * Pulse the Led in and out in a loop with specified time
// //    * @param {number} [time=1000] Time in ms that a fade in/out will elapse
// //    * @param {function} [callback] A function to run each time the direction of pulse changes
// //    * @return {Led}
// //    */

// //   pulse(time=1000, callback) {
    
// //     this.stop();

// //     var options = {
// //       duration: typeof time === "number" ? time : 1000,
// //       keyFrames: [this.LOW, this.HIGH],
// //       metronomic: true,
// //       loop: true,
// //       easing: inOutSine,
// //       onloop: function() {
// //         /* istanbul ignore else */
// //         if (typeof callback === "function") {
// //           callback();
// //         }
// //       }
// //     };

// //     if (typeof time === "object") {
// //       Object.assign(options, time);
// //     }

// //     if (typeof time === "function") {
// //       callback = time;
// //     }

// //     this.#state.isRunning = true;

// //     this.#state.animation = this.#state.animation || new Animation(this);
// //     this.#state.animation.enqueue(options);
// //     return this;
    
// //   }  

// //   /**
// //    * fade Fade an led in and out
// //    * @param {Number} val Target brightness value
// //    * @param {Number} [time=1000] Time in ms that a fade will take
// //    * @param {function} [callback] A function to run when the fade is complete
// //    * @return {Led}
// //    */
// //   fade(val, time=1000, callback) {
    
// //     this.stop();

// //     var options = {
// //       duration: typeof time === "number" ? time : 1000,
// //       keyFrames: [null, typeof val === "number" ? val : 0xff],
// //       easing: outSine,
// //       oncomplete: function() {
// //         this.stop();
// //         if (typeof callback === "function") {
// //           callback();
// //         }
// //       }
// //     };

// //     if (typeof val === "object") {
// //       Object.assign(options, val);
// //     }

// //     if (typeof val === "function") {
// //       callback = val;
// //     }

// //     if (typeof time === "object") {
// //       Object.assign(options, time);
// //     }

// //     if (typeof time === "function") {
// //       callback = time;
// //     }

// //     this.#state.isRunning = true;

// //     this.#state.animation = this.#state.animation || new Animation(this);
// //     this.#state.animation.enqueue(options);

// //     return this;
// //   }

// //   /**
// //    * fade Fade an led in
// //    * @param {Number} [time=1000] Time in ms that a fade will take
// //    * @param {function} [callback] A function to run when the fade is complete
// //    * @return {Led}
// //    */
// //   fadeIn(time=1000, callback) {
// //     return this.fade(this.HIGH, time, callback);
// //   }

// //   /**
// //    * fade Fade an led out
// //    * @param {Number} [time=1000] Time in ms that a fade will take
// //    * @param {function} [callback] A function to run when the fade is complete
// //    * @return {Led}
// //    */
// //   fadeOut(time=1000, callback) {
// //     return this.fade(this.LOW, time, callback);
// //   }



export default RGB;