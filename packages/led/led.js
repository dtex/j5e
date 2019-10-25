import {normalizeParams} from "@embedded/fn";

/**
 * Led
 * @constructor
 *
 * @param {opts} 
 *
 */

class Led {
  
  #io;
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
  
  constructor(io, pin) {    
    
    const {ioOpts, deviceOpts} = normalizeParams(io, pin);
    
    this.#io = new ioOpts.io({
      pin: ioOpts.pin,
      mode: ioOpts.io.Output
    });
    
    this.LOW = 0;
    if (ioOpts.io.resolution) {
      this.HIGH = (1 << ioOpts.io.resolution()) -1;
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
    this.#state.value = this.HIGH;
    this.#io.write(this.HIGH);
    return this;
  }

  /**
   * Turn an led off
   */
  off() {
    this.#state.value = this.LOW;
    this.#io.write(this.LOW);
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

};

export default Led;