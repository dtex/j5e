import {normalizeParams, constrain, getProvider, timer} from "../util/fn.js";

/**
 * Led
 * @constructor
 *
 * @param {opts} 
 *
 */

class Led {
  
  #state = {
    isAnode: false, 
    isRunning: false,
    value: 0,
    direction: 1,
    mode: null,
    intensity: 0,
    interval: null,
    HIGH: 1
  };

  constructor(io, device) {
    return (async () => {
      const {ioOpts, deviceOpts} = normalizeParams(io, device);

      const Provider = await getProvider(ioOpts, "builtin/digital");
      
      this.io = new Provider({
        pin: ioOpts.pin,
        mode: Provider.Output
      });
      
      this.LOW = 0;

      Object.defineProperties(this, {
        value: {
          get: function() {
            return this.#state.value;
          }
        },
        mode: {
          get: function() {
            return this.#state.mode;
          }
        },
        isOn: {
          get: function() {
            return !!this.#state.value;
          }
        },
        isRunning: {
          get: function() {
            return this.#state.isRunning;
          }
        }
      });
      
      if (this.io.resolution) {
        this.HIGH = (1 << this.io.resolution) -1;
      } else {
        this.HIGH = 1;
      }
      
      return this;
    })();
  }

  /**
   * Internal method that writes to IO
   */
  write() {
    let value = constrain(this.#state.value, this.LOW, this.HIGH);

    if (this.#state.isAnode) {
      value = this.HIGH - value;
    }

    this.io.write(value | 0);
  }

  /**
   * Turn an led on
   */
  on() {
    this.#state.value = this.HIGH;
    this.write();
    return this;
  }

  /**
   * Turn an led off
   */
  off() {
    this.#state.value = this.LOW;
    this.write();
    return this;
  }

  /**
   * Toggle the on/off state of an led
   * * @return {Led}
   */
  toggle() {
    return this[this.isOn ? "off" : "on"]();
  }

  /**
   * blink
   * @param  {Number} duration Time in ms on, time in ms off
   * @return {Led}
   */
  blink(duration=100, callback) {
    // Avoid traffic jams
    this.stop();

    if (typeof duration === "function") {
      callback = duration;
      duration = 100;
    }

    this.#state.isRunning = true;

    this.#state.interval = timer.setInterval(() => {
        this.toggle();
      if (typeof callback === "function") {
        callback();
      }
    }, duration);

    return this;
  }

  /**
   * set the brightness of an led attached to PWM
   * @param {value} int {
   *   vale: Value to set to PWM [this.HIGH, this.LOW]
   * }
   * return {Led}
   */
  brightness(value) {
    this.#state.value = value;
    this.io.write(value);
    return this;
  }

  /**
  * animate Animate the brightness of an led
  * @param {Object} opts {
  *   step: function to call on each step
  *   delta: function to calculate each change
  *   complete: function to call on completion,
  *   duration: ms duration of animation
  *   delay: ms interval delay
  * }
  * @return {Led}
  */
  animate(opts) {
    var start = Date.now();

    // Avoid traffic jams
    if (this.#state.interval) {
      timer.clearInterval(this.#state.interval);
    }

    if (!opts.duration) {
      opts.duration = 1000;
    }

    if (!opts.delta) {
      opts.delta = function(val) {
        return val;
      };
    }

    this.#state.isRunning = true;

    this.#state.interval = timer.setInterval(() => {
      const lapsed = Date.now() - start;
      let progress = lapsed / opts.duration;

      if (progress > 1) {
        progress = 1;
      }

      const delta = opts.delta(progress);

      opts.step(delta);

      if (progress === 1) {
        if (typeof opts.complete === "function") {
          opts.complete();
        }
      }
    }, opts.delay || 10);

   return this;
  }

  /**
   * pulse Fade the Led in and out in a loop with specified time
   * @param  {number} rate Time in ms that a fade in/out will elapse
   * @return {Led}
   */

  pulse(time=1000, callback) {
    
    const target = this.#state.value !== 0 ?
      (this.#state.value === this.HIGH ? 0 : this.HIGH) : this.HIGH;
    const direction = target === this.HIGH ? 1 : -1;
    const update = this.#state.value <= target ? target : (this.#state.value - target);

    if (typeof time === "function") {
      callback = time;
      time = 1000;
    }

    const step = (delta) => {
      let value = (update * delta);

      if (direction === -1) {
        value = value ^ this.HIGH;
      }

      this.#state.value = value;
      this.#state.direction = direction;
      this.write();
    };

    const complete = () => {
      this.pulse(time, callback);
      if (typeof callback === "function") {
        callback();
      }
    };

    return this.animate({
      duration: time,
      complete: complete,
      step: step
    });
  }  

  /**
   * fade Fade an led in and out
   * @param  {Number} val  Analog brightness value 0-255
   * @param  {Number} time Time in ms that a fade in/out will elapse
   * @return {Led}
   */

  fade(val, time=1000, callback) {
    const previous = this.#state.value || 0;
    const update = val - this.#state.value;

    if (typeof time === "function") {
      callback = time;
      time = 1000;
    }

    const step = (delta) => {
      const value = previous + (update * delta);
      this.#state.value = value;
      this.write();
    };

    const complete = () => {
      if (typeof callback === "function") {
        callback();
      }
    };
    return this.animate({
      duration: time,
      complete: complete,
      step: step
    });
  }

  fadeIn(time=1000, callback) {
    return this.fade(this.HIGH, time, callback);
  }

  fadeOut(time=1000, callback) {
    return this.fade(this.LOW, time, callback);
  }

  /**
   * stop Stop the led from strobing, pulsing or fading
   * @return {Led}
   */
  stop() {
    
    if (this.#state.interval) {
      timer.clearInterval(this.#state.interval);
    }

    this.#state.interval = null;
    this.#state.isRunning = false;

    return this;
  };

};

export default Led;