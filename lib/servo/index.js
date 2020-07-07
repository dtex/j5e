/**
 * For controlling hobby servos, continuous rotation servos
 * @module j5e/servo
 * @requires module:j5e/animation
 * @requires module:j5e/easing
 * @requires module:j5e/event
 * @requires module:j5e/fn
 */

import Animation from "j5e/animation";
import { Emitter } from "j5e/event";
import { constrain, normalizeParams, getProvider, map, fmap, timer } from "j5e/fn";
import { inOutSine } from "j5e/easing";

/**
 * Class representing a Servo
 * @classdesc The Servo class allows for control of hobby servos
 * @async
 * @extends Emitter
 * @fires move:complete - Fires when a servo reaches its requested position
 */
class Servo extends Emitter {

  #state = {
    history: [],
    isRunning: false,
    animation: null,
    value: null
  };

  /**
   * Instantiate a Servo
   * @param {object} options - A pin number, pin identifier or a complete IO options object
   * @param {(number|string)} [options.pin] - If passing an object, a pin number or pin identifier
   * @param {(string|constructor)} [options.io=builtin/pwm] - If passing an object, a string specifying a path to the IO provider or a constructor
   * @param {string} [options.type="standard"] - Type of servo ("standard" or "continuous")
   * @param {number[]} [options.pwmRange=[600, 2400]] - The pulse width range in microseconds
   * @param {number[]} [options.deadband=[90,90]] - The degree range at which a continuos motion servo will not turn
   * @param {number[]} [options.range=[0, 180]] - The allowed range of motion in degrees
   * @param {number[]} [options.deviceRange=[0, 180]] - The physical range (throw) of the servo in degrees
   * @param {number} [options.startAt="Any value within options.range"] - The desired start position of the servo
   * @param {number} [options.offset=0] - Adjust the position of the servo for trimming
   * @param {boolean} [options.invert=false] - Reverses the direction of rotation
   * @param {boolean} [options.center=false] - Center the servo on instantiation
   * @property {object[]} history - The last five position updates
   * @property {object[]} history.timestamp - Timestamp of position update
   * @property {object[]} history.target - The user requested position
   * @property {object[]} history.degrees - The actual position (factors in offset and invert)
   * @property {object} last - The most recent position update
   * @property {object[]} last.timestamp - Timestamp of position update
   * @property {object[]} last.target - The user requested position
   * @property {object[]} last.degrees - The corrected position (factors in offset and invert)
   * @property {object[]} last.pulseWidth - The corrected pulseWidth (factors in offset and invert)
   * @property {number} position - The most recent request and corrected position (factors in offset and invert)
   * @example
   * <caption>Sweep a servo back and forth</caption>
   * import Servo from "j5e/servo";
   *
   * const servo = await new Servo(12);
   * servo.sweep();
   *
   * @example
   * <caption>Move a continuos rotation servo forward</caption>
   * import Servo from "j5e/servo";
   *
   * const servo = await new Servo({ pin: 12, type: "continuous"});
   * servo.cw();
   */
  constructor(options) {
    return (async() => {
      options = normalizeParams(options);

      const Provider = await getProvider(options, "builtin/pwm");
      super();

      this.io = new Provider({
        pin: options.pin,
        mode: Provider.Output,
        hz: 50
      });

      this.#state.pwmRange = options.pwmRange || [600, 2400];
      this.#state.deviceRange = options.deviceRange || [0, 180];
      this.#state.deadband = options.deadband || [90, 90];
      this.#state.offset = options.offset || 0;
      this.#state.startAt = options.startAt || (this.#state.deviceRange[1] - this.#state.deviceRange[0]) / 2;
      this.#state.range = options.range || [0 - this.offset, 180 - this.offset];
      this.#state.type = options.type || "standard";
      this.#state.invert = options.invert || false;
      this.#state.isRunning = false;

      Object.defineProperties(this, {
        history: {
          get: function() {
            return this.#state.history.slice(-5);
          }
        },
        last: {
          get: function() {
            if (this.#state.history.length) {
              return this.#state.history[this.#state.history.length - 1];
            } else {
              return {
                timestamp: Date.now(),
                degrees: null,
                target: null
              };
            }
          }
        },
        position: {
          get: function() {
            return this.#state.history.length ? this.#state.history[this.#state.history.length - 1].degrees : -1;
          }
        }
      });

      this.initialize(options);

      if (typeof options.startAt !== "undefined") {
        this.to(options.startAt);
      } else {

        if (options.center) {
          this.center();
        }

        if (options.type === "continuous") {
          this.stop();
        }

      }

      return this;
    })();
  }

  /**
   * The initialization code for a servo
   * @ignore
   */
  initialize(options) {
    // No operation here... Meant to be overwritten by subclasses
  }

  /**
   * Calls the write param on the IO instance for this servo.
   * @param {number} pulseWidth - The target pulseWidth
   * @returns {Servo}
   * @ignore
   */
  update(degrees) {

    // If same degrees return immediately.
    if (this.last && this.last.degrees === degrees) {
      return this;
    }

    let microseconds = fmap(degrees, this.#state.deviceRange[0], this.#state.deviceRange[1], this.#state.pwmRange[0], this.#state.pwmRange[1]);

    // Presumably some IO's will support writeMicroseconds
    if (this.io.writeMicroseconds) {
      this.io.writeMicroseconds(microseconds | 0);
    } else {
      let value = fmap(microseconds, 0, 20_000, 0, 2 ** this.io.resolution - 1);
      this.io.write(value | 0);
    }

  }

  /**
   * Set the servo's position to given degree over time.
   *
   * @param {Number|Object} degrees Degrees to move servo to or an animation object (See {@tutorial D-ANIMATING})
   * @param {Number} [time] Time to spend in motion. If degrees is a number and this value is ommitted, the servo will move to the requested degrees as quickly as possible.
   * @param {Number} [rate=20] The target frame rate of the motion transiton
   * @return {Servo} instance
   * @example
   * <caption>Move a servo to 180° as quickly as possible</caption>
   * import Servo from "j5e/servo";
   *
   * const servo = await new Servo(12);
   * servo.to(180);
   *
   * @example
   * <caption>Move a servo to 180° over one second</caption>
   * import Servo from "j5e/servo";
   *
   * const servo = await new Servo(12);
   * servo.to(180, 1000);
   *
   * @example
   * <caption>Move a servo to 180° using an animation segment object</caption>
   * import Servo from "j5e/servo";
   * import { inOutQuad } from "j5e/easing";
   *
   * const servo = await new Servo(12);
   * servo.to({
   *   duration: 1000,
   *   cuePoints: [0, 1.0],
   *   keyFrames: [ null, 180 ],
   *   easing: inOutQuad
   * });
   */
  to(degrees, time, rate) {

    let options = {
      duration: 1000,
      cuePoints: [0, 1.0],
      keyFrames: [
        null,
        {
          value: typeof degrees.degrees === "number" ? degrees.degrees : this.startAt
        }
      ],
      oncomplete: () => {
        // Enforce async execution for user "oncomplete"
        timer.setImmediate(() => {
          if (typeof degrees.oncomplete === "function") {
            degrees.oncomplete();
          }
          this.emit("move:complete");
        });
      }
    };

    if (typeof degrees === "object") {

      Object.assign(options, degrees);

      this.#state.isRunning = true;
      this.#state.animation = this.#state.animation || new Animation(this);
      this.#state.animation.enqueue(options);

    } else {

      const target = degrees;

      // Enforce limited range of motion
      degrees = constrain(degrees, this.#state.range[0], this.#state.range[1]);

      if (typeof time !== "undefined") {

        options.duration = time;
        options.keyFrames = [null, {
          degrees: degrees
        }];
        options.fps = rate || 20;

        this.to(options);

      } else {

        this.#state.value = degrees;

        degrees += this.#state.offset;

        if (this.#state.invert) {
          degrees = map(
            degrees,
            this.#state.deviceRange[0], this.#state.deviceRange[1],
            this.#state.deviceRange[1], this.#state.deviceRange[0]
          );
        }

        this.update(degrees);

        if (this.#state.history.length > 5) {
          this.#state.history.shift();
        }

        this.#state.history.push({
          timestamp: Date.now(),
          degrees: degrees,
          target: target
        });

      }
    }

    return this;
  }


  /**
   * Update the servo position by specified degrees (over time)
   *
   * @param  {Number} degrees Degrees to turn servo to.
   * @param  {Number} [time] Time to spend in motion.
   * @return {Servo}
   * @example
   * <caption>Move a servo to 120° as quickly as possible</caption>
   * import Servo from "j5e/servo";
   *
   * const servo = await new Servo(12);
   * // The servo's default position is 90 degrees
   * servo.step(30);
   *
   * @example
   * <caption>Move a servo to 120° over one second</caption>
   * import Servo from "j5e/servo";
   *
   * const servo = await new Servo(12);
   * // The servo's default position is 90 degrees
   * servo.step(30, 1000);
   */
  step(degrees, time) {
    return this.to(this.last.target + degrees, time);
  }

  /**
   * min Set Servo to minimum degrees, defaults to 0deg
   * @param  {Number} [time]      Time to spend in motion.
   * @return {Servo}
   * @example
   * <caption>Move a servo to 0° as quickly as possible</caption>
   * import Servo from "j5e/servo";
   *
   * const servo = await new Servo(12);
   * servo.min();
   *
   * @example
   * <caption>Move a servo to 0° over one second</caption>
   * import Servo from "j5e/servo";
   *
   * const servo = await new Servo(12);
   * servo.min(1000);
   */
  min(time) {
    return this.to(this.#state.deviceRange[0], time);
  };

  /**
   * Set Servo to maximum degrees, defaults to 180deg
   * @param  {Number} [time] Time to spend in motion.
   * @return {Object} instance
   * @example
   * <caption>Move a standard servo to 180° as quickly as possible</caption>
   * import Servo from "j5e/servo";
   *
   * const servo = await new Servo(12);
   * servo.max();
   *
   * @example
   * <caption>Move a standard servo to 180° over one second</caption>
   * import Servo from "j5e/servo";
   *
   * const servo = await new Servo(12);
   * servo.max(1000);
   */
  max(time) {
    return this.to(this.#state.deviceRange[1], time);
  }

  /**
   * Set Servo to centerpoint, defaults to 90deg
   * @param  {Number} [time] Time to spend in motion.
   * @return {Object} instance
   * @example
   * <caption>Move a servo to 180° and then back to 90° as quickly as possible</caption>
   * import Servo from "j5e/servo";
   * import { timer } from "j5e/fn";
   *
   * const servo = await new Servo(12);
   * servo.to(180);
   *
   * timer.setTimeout(function() {
   *   servo.center();
   * }, 1000);
   *
   * @example
   * <caption>Move a servo to 180° and then back to 90° over one second</caption>
   * import Servo from "j5e/servo";
   * import { timer } from "j5e/fn";
   *
   * const servo = await new Servo(12);
   * servo.to(180);
   *
   * timer.setTimeout(function() {
   *   servo.center(1000);
   * }, 1000);
   */
  center(time) {
    return this.to(Math.abs((this.#state.deviceRange[0] + this.#state.deviceRange[1]) / 2), time);
  }

  /**
   * Return Servo to its startAt position
   * @return {Servo}
   * @example
   * <caption>Move a servo to 180° and then back to 90° as quickly as possible</caption>
   * import Servo from "j5e/servo";
   * import { timer } from "j5e/fn";
   *
   * const servo = await new Servo(12);
   * servo.to(180);
   *
   * timer.setTimeout(function() {
   *   servo.home();
   * }, 1000);
   */
  home() {
    return this.to(this.#state.startAt);
  }

  /**
   * Sweep the servo between min and max or provided range
   * @param  {Array|Object} opts An array describing the range of the sweep in degrees or an animation segment options object
   * @return {Servo}
   * @example
   * <caption>Sweep a servo back and forth between 10° to 170°</caption>
   * import Servo from "j5e/servo";
   *
   * const servo = await new Servo(12);
   * servo.sweep([10, 170]));
   *
   * example
   * <caption>Sweep a servo back and forth between 10° to 170° with inOutCirc easing</caption>
   * import Servo from "j5e/servo";
   * import {inOutCirc} from "j5e/easing";
   *
   * const servo = await new Servo(12);
   * servo.sweep({
   *   keyFrames: [10, 170],
   *   cuePoints: [0, 1],
   *   easing: inOutCirc
   * });
   */
  sweep(opts) {

    var options = {
      keyFrames: [{
        value: this.#state.deviceRange[0]
      }, {
        value: this.#state.deviceRange[1]
      }],
      metronomic: true,
      loop: true,
      easing: inOutSine,
      duration: 1000
    };

    // If opts is an array, then assume a range was passed
    if (Array.isArray(opts)) {
      options.keyFrames = rangeToKeyFrames(opts);
    } else {
      if (typeof opts === "object" && opts !== null) {
        Object.assign(options, opts);
        if (Array.isArray(options.range)) {
          options.keyFrames = rangeToKeyFrames(options.range);
        }
      }
    }

    return this.to(options);
  }

  /**
   * Stop a moving servo
   * return {Servo}
   * @example
   * <caption>Sweep a servo back and forth for two seconds then stop</caption>
   * import Servo from "j5e/servo";
   *
   * const servo = await new Servo(12);
   * servo.sweep([10, 170]));
   *
   * timer.setTimeout(function() {
   *   servo.stop();
   * }, 2000);
   */
  stop() {

    if (this.#state.animation) {
      this.#state.animation.stop();
    }

    if (this.#state.type === "continuous") {
      this.to(
        this.#state.deadband.reduce(function(a, b) {
          return (a + b) / 2;
        })
      );
    }

    return this;
  }

  /**
   * Move a continuous rotation servo clockwise
   * @param  {number} speed Speed between 0 and 1.
   * @return {Servo}
   * @example
   * <caption>Move a continuos rotation servo clockwise</caption>
   * import Servo from "j5e/servo";
   *
   * const servo = await new Servo({ pin: 12, type: "continuous"});
   * servo.cw();
   *
   * @example
   * <caption>Move a continuos rotation servo clockwise at half speed</caption>
   * import Servo from "j5e/servo";
   *
   * const servo = await new Servo({ pin: 12, type: "continuous"});
   * servo.cw(0.5);
   */
  cw(speed = 1) {
    speed = constrain(speed, 0, 1);
    speed = map(speed, 0, 1, this.#state.deadband[1] + 1, this.#state.deviceRange[1]);
    return this.to(speed);
  }

  /**
   * Move a continuous rotation servo counter-clockwise
   * @param  {number} speed Speed between 0 and 1.
   * @return {Servo}
   * @example
   * <caption>Move a continuos rotation servo counter-clockwise</caption>
   * import Servo from "j5e/servo";
   *
   * const servo = await new Servo({ pin: 12, type: "continuous"});
   * servo.ccw();
   *
   * @example
   * <caption>Move a continuos rotation servo counter-clockwise at half speed</caption>
   * import Servo from "j5e/servo";
   *
   * const servo = await new Servo({ pin: 12, type: "continuous"});
   * servo.ccw(0.5);
   */
  ccw(speed = 1) {
    speed = constrain(speed, 0, 1);
    speed = map(speed, 0, 1, this.#state.deadband[0] - 1, this.#state.pwmRange[0]);
    return this.to(speed);
  }


  /**
   * @param [number || object] keyFrames An array of step values or a keyFrame objects
   * @ignore
   */
  normalize(keyFrames) {

    let last = this.last ? this.last.target : this.startAt;

    // If user passes null as the first element in keyFrames use current position
    if (keyFrames[0] === null) {
      keyFrames[0] = {
        value: last
      };
    }

    // If user passes a step as the first element in keyFrames use current position + step
    if (typeof keyFrames[0] === "number") {
      keyFrames[0] = {
        value: last + keyFrames[0]
      };
    }

    return keyFrames.map(function(frame) {
      let value = frame;

      /* istanbul ignore else */
      if (frame !== null) {
        // frames that are just numbers represent _step_
        if (typeof frame === "number") {
          frame = {
            step: value,
          };
        } else {
          if (typeof frame.degrees === "number") {
            frame.value = frame.degrees;
            delete frame.degrees;
          }
          if (typeof frame.copyDegrees === "number") {
            frame.copyValue = frame.copyDegrees;
            delete frame.copyDegrees;
          }
        }

      }
      return frame;
    });
  }

  /**
   * render
   * @position [number] value to set the servo to
   * @ignore
   */
  render(position) {
    return this.to(position[0]);
  }

}

function rangeToKeyFrames(range) {
  return range.map(function(value) {
    return { value: value };
  });
}

export default Servo;
