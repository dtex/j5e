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
  
  constructor(opts) {    
    
    if (!opts.io) opts = { io: opts };
    
    this.io = opts.io;
    
    this.LOW = 0;
    if (this.io.resolution) {
      this.HIGH = (1 << this.io.resolution()) -1;
    } else {
      this.HIGH = 1;
    }

    if (typeof System !== "undefined") {
      this.setInterval = System.setInterval
    } else {
      this.setInterval = GLOBAL.setInterval
    }

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

  }

  /**
   * Turn an led on
   */
  on() {
    
    this.#state.value = 1;

    /*if (state.mode === this.io.MODES.PWM) {
      // Assume we need to simply turn this all the way on, when:

      // ...state.value is null
      if (state.value === null) {
        state.value = 255;
      }

      // ...there is no active interval
      if (!state.interval) {
        state.value = 255;
      }

      // ...the last value was 0
      if (state.value === 0) {
        state.value = 255;
      }
    }*/

    this.io.write(this.HIGH);

    return this;
    
  }

  /**
   * Turn an led off
   */
  off() {
    this.#state.value = 0;
    this.io.write(this.LOW);
    return this;
  }

  /**
   * Toggle the on/off state of an led
   * * @return {Led}
   */
  toggle() {
    return this[this.isOn ? "off" : "on"]();
  }

  //strobe 

  /**
   * blink
   * @param  {Number} duration Time in ms on, time in ms off
   * @return {Led}
   */
  blink(duration, callback) {
    // Avoid traffic jams
    this.stop();

    if (typeof duration === "function") {
      callback = duration;
      duration = null;
    }

    this.#state.isRunning = true;

    this.#state.interval = this.setInterval(() => {
      this.toggle();
      if (typeof callback === "function") {
        callback();
      }
    }, duration || 100);

    return this;
  };

  //brightness

  //fade

  //fadeIn

  //fadeOut

  //pulse

  /**
   * stop Stop the led from strobing, pulsing or fading
   * @return {Led}
   */
  stop() {
    
    if (this.#state.interval) {
      clearInterval(this.#state.interval);
    }

    if (this.#state.animation) {
      this.#state.animation.stop();
    }

    this.#state.interval = null;
    this.#state.isRunning = false;

    return this;
  };
  

  /**
   * Add an animation segment to the animation queue
   * @param {Object} options Options: cuePoints, keyFrames, duration,
   *   easing, loop, metronomic, progress, fps, onstart, onpause,
   *   onstop, oncomplete, onloop
   */
  // enqueue(options = {}) {
  //   /* istanbul ignore else */
  //   if (typeof options.target === "undefined") {
  //     options.target = this.defaultTarget;
  //   }

  //   this.segments.push(options);

  //   /* istanbul ignore if */
  //   if (!this.paused && !this.isRunning) {
  //     this.next();
  //   }

  //   return this;
  // }

};

export default Led;