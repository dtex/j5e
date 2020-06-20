/**
 * The j5e Animation module handles tweening between a series of key frames. Works with with the LED, RGB, and Servo classes.
 * @module j5e/animation
 * @requires module:@j5e/fn
 * @requires module:@j5e/event
 */

import { constrain, timer } from "@j5e/fn";
import { Emitter } from "@j5e/event";

function linear(n) { return n; }

/** 
 * Class representing an Animation
 * @classdesc Allows for scripted control of LEDs, RGBs, and Servos
 * @extends Emitter
 * @fires animation:pause
 * @fires animation:stop
 */
class Animation extends Emitter {

  /**
   * Animation  
   * @constructor
   * @param {LED|LED[]|RGB|RGB[]|Servo|Servo[]} target - LEDs, RGBs, and/or Servos to be animated (See {@tutorial D-ANIMATING} for more information)
   * @example
   * <caption>Make a servo "wave"</caption>
   * import Servo from "@j5e/servo";
   * import Animation from "@j5e/animation";
   * 
   * const servo = await new Servo(13);
   * const ani = await new Animation(servo);
   * 
   * const wave = {
   *   duration: 4000,
	 *   cuePoints: [0,  0.375, 0.625, 1],
	 *   keyFrames: [0, 135, 45, 180],
	 *   loop: true,
   *   metronomic: true
   * };
   * 
   * ani.enqueue(wave);
   */
  constructor(target) {
    super();
    Object.assign(this, new Segment());
    this.defaultTarget = target || {};
  }

  /**
   * Add an animation segment to the animation queue (See {@tutorial D-ANIMATING} for more information)
   * @param {object} options - Animation segment options
   * @param {object[]} options.keyFrames - Values for each cuepoint
   * @param {number[]} [options.cuePoints=[0, 1]] - Segment cuepoints from 0-1
   * @param {number} [options.duration=1000] - Duration of segment in ms 
   * @param {fuction} [options.easing=linear()] - Easing function to use for segment 
   * @param {boolean} [options.loop=false] - If true the segment will loop back
   * @param {number} [options.loopback=0] - The time to loop back to [0-1] 
   * @param {boolean} [options.metronomic=false] - Instead of looping back to the beginning it will reverse direction at the end of the segment 
   * @param {number} [options.currentSpeed=1] - The playback speed [0-1] 
   * @param {number} [options.progress] - The current progress 
   * @param {number} [options.fps=50] - Frames per second 
   * @param {number} [options.rate=20] - ms between frames
   * @param {boolean} [options.paused=false] - Wether the animation is in a paused state
   * @param {function} [options.onstart=null] - Function to call when the segment starts 
   * @param {function} [options.onpause=null] - Function to call when the segment is paused
   * @param {function} [options.onstop=null] - Function to call when the segment is stopped
   * @param {function} [options.oncomplete=null] - Function to call when the segment is complete
   * @param {function} [options.onloop=null] - Function to call when the segment loops
   * @example
   * <caption>Make a servo "wave"</caption>
   * import Servo from "@j5e/servo";
   * import Animation from "@j5e/animation";
   * 
   * const servo = await new Servo(13);
   * const ani = await new Animation(servo);
   * 
   * const wave = {
   *   duration: 4000,
	 *   cuePoints: [0,  0.375, 0.625, 1],
	 *   keyFrames: [0, 135, 45, 180],
	 *   loop: true,
   *   metronomic: true
   * };
   * 
   * ani.enqueue(wave);
   */
  enqueue(options = {}) {
    if (typeof options.target === "undefined") {
      options.target = this.defaultTarget;
    }

    if (typeof options.easing === "undefined") {
      options.easing = linear;
    }

    this.segments.push(options);

    if (!this.paused && !this.isRunning) {
      this.next();
    }

    return this;
  }

  /**
   * Plays next segment in queue. Not meant to be called externally.
   * @returns this
   * @private
   */
  next() {

    if (this.isRunning) {
      return this;
    } else {
      this.isRunning = true;
    }

    if (this.segments.length > 0) {
      Object.assign(this, new Segment(this.segments.shift()));
      this.paused = this.currentSpeed === 0 ? true : false;

      if (this.onstart) {
        this.onstart();
      }

      this.normalizeKeyframes();

      if (this.reverse) {
        this.currentSpeed *= -1;
      }

      if (this.currentSpeed !== 0) {
        this.play();
      } else {
        this.paused = true;
      }
    } else {
      this.playLoop.stop();
    }

    return this;
  }

  /**
   * Resume play on an animation after it has been paused or stopped.
   * @returns Animation
   * @example
   * <caption>Make a servo "wave" for five seconds, pause for one second and then resume waving</caption>
   * import Servo from "@j5e/servo";
   * import Animation from "@j5e/animation";
   * import {timer} from "@j5e/fn";
   * 
   * const servo = await new Servo(13);
   * const ani = await new Animation(servo);
   * 
   * const wave = {
   *   duration: 4000,
	 *   cuePoints: [0,  0.375, 0.625, 1],
	 *   keyFrames: [0, 135, 45, 180],
	 *   loop: true,
   *   metronomic: true
   * };
   * 
   * ani.enqueue(wave);
   * 
   * timer.setTimeout(function() { 
   *   ani.pause();
   * }, 5000);
   * 
   * timer.setTimeout(function() { 
   *   ani.play();
   * }, 6000);
   */
  play() {
    const now = Date.now();

    if (this.playLoop) {
      this.playLoop.stop();
    }

    this.paused = false;
    this.isRunning = true;

    // Find our timeline endpoints and refresh rate
    this.scaledDuration = this.duration / Math.abs(this.currentSpeed);
    this.startTime = now - this.scaledDuration * this.progress;
    this.endTime = this.startTime + this.scaledDuration;

    this.frameCount = 0;

    if (this.fps) {
      this.rate = 1000 / this.fps;
    }

    this.rate = this.rate | 0;

    this.playLoop = new Timer(this);

    return this;
  }

  /**
   * Pause animation while maintaining progress, speed and segment queue
   * @returns Animation
   * @example
   * <caption>Make a servo "wave" for five seconds, pause for one second and then resume waving</caption>
   * import Servo from "@j5e/servo";
   * import Animation from "@j5e/animation";
   * import {timer} from "@j5e/fn";
   * 
   * const servo = await new Servo(13);
   * const ani = await new Animation(servo);
   * 
   * const wave = {
   *   duration: 4000,
	 *   cuePoints: [0,  0.375, 0.625, 1],
	 *   keyFrames: [0, 135, 45, 180],
	 *   loop: true,
   *   metronomic: true
   * };
   * 
   * ani.enqueue(wave);
   * 
   * timer.setTimeout(function() { 
   *   ani.pause();
   * }, 5000);
   * 
   * timer.setTimeout(function() { 
   *   ani.play();
   * }, 6000);
   */
  pause() {

    this.emit("animation:pause");

    if (this.playLoop) {
      this.playLoop.stop();
    }
    this.paused = true;

    if (this.onpause) {
      this.onpause();
    }

    return this;

  }

  /**
   * Stop the animation, flushing the segment queue
   * @returns Animation
   * @example
   * <caption>Make a servo "wave" for five seconds and then stop, flushing the queue</caption>
   * import Servo from "@j5e/servo";
   * import Animation from "@j5e/animation";
   * import {timer} from "@j5e/fn";
   * 
   * const servo = await new Servo(13);
   * const ani = await new Animation(servo);
   * 
   * const wave = {
   *   duration: 4000,
	 *   cuePoints: [0,  0.375, 0.625, 1],
	 *   keyFrames: [0, 135, 45, 180],
	 *   loop: true,
   *   metronomic: true
   * };
   * 
   * ani.enqueue(wave);
   * 
   * timer.setTimeout(function() { 
   *   ani.stop();
   * }, 5000);
   */
  stop() {

    this.emit("animation:stop");

    this.segments = [];
    this.isRunning = false;
    if (this.playLoop) {
      this.playLoop.stop();
    }

    if (this.onstop) {
      this.onstop();
    }

    return this;

  }

  /**
   * Get or set the current playback speed
   * @param {Number} [speed] - The desired playback speed (1 = normal)
   * @return Animation
   * @example
   * <caption>Make a servo "wave" for one second, increase the speed, wait another second and decrease the speed for one second and then stop.</caption>
   * import Servo from "@j5e/servo";
   * import Animation from "@j5e/animation";
   * import {timer} from "@j5e/fn";
   * 
   * const servo = await new Servo(13);
   * const ani = await new Animation(servo);
   * 
   * const wave = {
   *   duration: 4000,
	 *   cuePoints: [0,  0.375, 0.625, 1],
	 *   keyFrames: [0, 135, 45, 180],
	 *   loop: true,
   *   metronomic: true
   * };
   * 
   * ani.enqueue(wave);
   * 
   * timer.setTimeout(function() { 
   *   ani.speed(2.0); // Speed up to 2x
   * }, 1000);
   * 
   * timer.setTimeout(function() { 
   *   ani.speed(0.5); // Speed up to 1/2x
   * }, 2000);
   * 
   * timer.setTimeout(function() { 
   *   ani.stop(); // Note, animation speed is still 0.5
   * }, 3000);
   */
  speed(speed) {

    if (typeof speed === "undefined") {
      return this.currentSpeed;
    } else {
      this.currentSpeed = speed;

      // Find our timeline endpoints and refresh rate
      this.scaledDuration = this.duration / Math.abs(this.currentSpeed);
      this.startTime = Date.now() - this.scaledDuration * this.progress;
      this.endTime = this.startTime + this.scaledDuration;

      if (!this.paused) {
        this.play();
      }
      return this;
    }
  }

  /**
   * Called in each frame of the animation
   * @private
   */
  loopFunction({calledAt}) {

    // Find the current timeline progress
    const progress = this.calculateProgress(calledAt);

    // Find the left and right cuePoints/keyFrames;
    const indices = this.findIndices(progress);

    // call render function with tweened value
    this.target.render(this.tweenedValue(indices, progress));

    // See if we have reached the end of the animation
    /* istanbul ignore else */
    if ((this.progress === 1 && !this.reverse) || (progress === this.loopback && this.reverse)) {

      if (this.loop || (this.metronomic && !this.reverse)) {
        if (this.onloop) {
          this.onloop();
        }

        if (this.metronomic) {
          this.reverse = this.reverse ? false : true;
        }

        //This line was causing RGB to "re-normalize" and break. I'm not sure why it is here.
        //this.normalizeKeyframes();
        
        this.progress = this.loopback;
        this.startTime = Date.now() - this.scaledDuration * this.progress;
        this.endTime = this.startTime + this.scaledDuration;
      } else {
        this.isRunning = false;

        if (this.oncomplete) {
          timer.setImmediate(this.oncomplete.bind(this));
        }

        if (this.segments.length > 0) {
          timer.setImmediate(() => { this.next(); });
        } else {
          this.stop();
        }
      }
    }
  }

  /**
   * Find left and right cuepoints. 
   * @private
   */
  findIndices(progress) {
    const indices = {
      left: null,
      right: null
    };

    // Find our current before and after cuePoints. Not intended to be called externally.
    indices.right = this.cuePoints.findIndex(point => point >= progress);

    indices.left = indices.right === 0 ? /* istanbul ignore next */ 0 : indices.right - 1;

    return indices;
  }

  /**
   * Compute progress based on start time. 
   * @private
   */
  calculateProgress(calledAt) {

    let progress = (calledAt - this.startTime) / this.scaledDuration;

    if (progress > 1) {
      progress = 1;
    }

    this.progress = progress;

    if (this.reverse) {
      progress = 1 - progress;
    }
    
    // Ease the timeline
    // to do: When reverse replace inFoo with outFoo and vice versa. skip inOutFoo
    return constrain(this.easing(progress), 0, 1);
  }

  /**
   * Find our tweened value based on left and right indices and current progress.
   * @private
   */
  tweenedValue(indices, progress) {

    const tween = {
      duration: null,
      progress: null
    };
    
    const result = this.keyFrames.map(keyFrame => {
      const kIndices = {
        left: null,
        right: null
      };

      // If the keyframe at indices.left is null, move left
      for (kIndices.left = indices.left; kIndices.left > -1; kIndices.left--) {
        /* istanbul ignore else */
        if (keyFrame[kIndices.left] !== null) {
          break;
        }
      }

      // If the keyframe at indices.right is null, move right
      kIndices.right = keyFrame.findIndex((frame, index) =>
        index >= indices.right && frame !== null
      );

      // Find our progress for the current tween
      tween.duration = this.cuePoints[kIndices.right] - this.cuePoints[kIndices.left];
      tween.progress = (progress - this.cuePoints[kIndices.left]) / tween.duration;
      
      // Catch divide by zero
      if (!Number.isFinite(tween.progress)) {
        /* istanbul ignore next */
        tween.progress = this.reverse ? 0 : 1;
      }

      const left = keyFrame[kIndices.left];
      const right = keyFrame[kIndices.right];
      
      // Apply tween easing to tween.progress
      // to do: When reverse replace inFoo with outFoo and vice versa. skip inOutFoo
      tween.progress = right.easing(tween.progress);

      // Calculate this tween value
      let calcValue;

      if (right.position) {
        // This is a tuple
        calcValue = right.position.map((value, index) => (value - left.position[index]) *
          tween.progress + left.position[index]);
      } else {
        if (typeof right.value === "number" && typeof left.value === "number") {
          calcValue = (right.value - left.value) * tween.progress + left.value;
        } else {
          calcValue = this.target.keys.reduce((accum, key) => {
            accum[key] = (right.value[key] - left.value[key]) * tween.progress + left.value[key];
            return accum;
          }, {});
        }
      }

      return calcValue;
    });

    return result;
  }

  /**
   * Make sure our keyframes conform to a standard.
   * @private
   */
  normalizeKeyframes() {
    let previousVal;
    const cuePoints = this.cuePoints;

    // Run through the target's normalization
    this.keyFrames = this.target.normalize(this.keyFrames);
    // keyFrames can be passed as a single dimensional array if
    // there is just one servo/device. If the first element is not an
    // array, nest this.keyFrames so we only have to deal with one format
    if (!Array.isArray(this.keyFrames[0])) {
      this.keyFrames = [this.keyFrames];
    }

    this.keyFrames.forEach(function(keyFrames) {

      // Pad the right side of keyFrames arrays with null
      for (let i = keyFrames.length; i < cuePoints.length; i++) {
        keyFrames.push(null);
      }

      keyFrames.forEach((keyFrame, i, source) => {

        if (keyFrame !== null) {

          // keyFrames need to be converted to objects
          if (typeof keyFrame !== "object") {
            keyFrame = {
              step: keyFrame,
              easing: linear
            };
          }

          // Replace step values
          if (typeof keyFrame.step !== "undefined") {
            keyFrame.value = keyFrame.step === false ?
              previousVal : previousVal + keyFrame.step;
          }

          // Set a default easing function
          if (!keyFrame.easing) {
            keyFrame.easing = linear;
          }

          // Copy value from another frame
          /* istanbul ignore if */
          if (typeof keyFrame.copyValue !== "undefined") {
            keyFrame.value = source[keyFrame.copyValue].value;
          }

          // Copy everything from another keyframe in this array
          /* istanbul ignore if */
          if (keyFrame.copyFrame) {
            keyFrame = source[keyFrame.copyFrame];
          }

          previousVal = keyFrame.value;

        } else {

          if (i === source.length - 1) {
            keyFrame = {
              value: previousVal,
              easing: linear
            };
          } else {
            keyFrame = null;
          }

        }
        source[i] = keyFrame;

      }, this);
    });

    return this;
  }

};

/**
 * Local wrapper class for managing the timer
 * @private
 */
class Timer {
  /**
   * @param {object} animation - The animation instance
   * @private
   */
  constructor(animation) {
    this.interval = timer.setInterval(() => {
      animation.loopFunction({
        calledAt: Date.now()
      });
    }, animation.rate);
  }
  stop() {
    if (this.interval) {
      timer.clearInterval(this.interval);
      this.interval = null;
    }
  }
};

/** 
 * This class has no methods, it is a wrapper for short animation segments and not meant to be accessed publicly.
 * @private
 * @classdesc Sets and overrides default params
 * @param {object} [options] - Animation segment options (See {@tutorial D-ANIMATING} for more information)
 * @param {number[]} [options.cuePoints=[0, 1]] - Animation segment cuepoints from 0-1
 * @param {number} [options.duration=1000] - Duration of animation segment in ms 
 * @param {fuction} [options.easing=linear()] - Easing function to use for segment 
 * @param {boolean} [options.loop=false] - If true the segment will loop back
 * @param {number} [options.loopback=0] - The time to loop back to [0-1] 
 * @param {boolean} [options.metronomic=false] - Instead of looping back to the beginning it will reverse direction at the end of the segment 
 * @param {number} [options.currentSpeed=1] - The playback speed [0-1] 
 * @param {number} [options.progress] - The current progress 
 * @param {number} [options.fps=50] - Frames per second 
 * @param {number} [options.rate=20] - ms between frames
 * @param {boolean} [options.paused=false] - Wether the animation is in a paused state
 * @param {function} [options.onstart=null] - Function to call when animation starts 
 * @param {function} [options.onpause=null] - Function to call when animation is paused
 * @param {function} [options.onstop=null] - Function to call when animation is stopped
 * @param {function} [options.oncomplete=null] - Function to call when animation is complete
 * @param {function} [options.onloop=null] - Function to call when animation loops
 */
class Segment {
  constructor(options) {
    this.cuePoints = [0, 1];
    this.duration = 1000;
    this.easing = linear;
    this.loop = false;
    this.loopback = 0;
    this.metronomic = false;
    this.currentSpeed = 1;
    this.progress = 0;
    this.fps = 50;
    this.rate = 1000 / 50;
    this.paused = false;
    this.isRunning = false;
    this.segments = [];
    this.onstart = null;
    this.onpause = null;
    this.onstop = null;
    this.oncomplete = null;
    this.onloop = null;

    if (options) {
      Object.assign(this, options);

      if (options.segments) {
        this.segments = options.segments.slice();
      }
    }
  }
}

export default Animation;