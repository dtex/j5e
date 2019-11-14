/**
 * to
 *
 * Set the servo horn's position to given degree over time.
 *
 * @param  {Number} degrees   Degrees to turn servo to.
 * @param  {Number} time      Time to spend in motion.
 * @param  {Number} rate      The rate of the motion transiton
 *
 * - or -
 *
 * @param {Object} an Animation() segment config object
 *
 * @return {Servo} instance
 */

Servo.prototype.to = function(degrees, time, rate) {

  var state = priv.get(this);
  var options = {};

  if (typeof degrees === "object") {

    Object.assign(options, degrees);

    options.duration = degrees.duration || degrees.interval || 1000;
    options.cuePoints = degrees.cuePoints || [0, 1.0];
    options.keyFrames = degrees.keyFrames || [
      null,
      {
        value: typeof degrees.degrees === "number" ? degrees.degrees : this.startAt
      }
    ];

    options.oncomplete = function() {
      // Enforce async execution for user "oncomplete"
      process.nextTick(function() {
        if (typeof degrees.oncomplete === "function") {
          degrees.oncomplete();
        }
        this.emit("move:complete");
      }.bind(this));
    }.bind(this);


    state.isRunning = true;
    state.animation = state.animation || new Animation(this);
    state.animation.enqueue(options);

  } else {

    var target = degrees;

    // Enforce limited range of motion
    degrees = Fn.constrain(degrees, this.range[0], this.range[1]);

    if (typeof time !== "undefined") {

      options.duration = time;
      options.keyFrames = [null, {
        degrees: degrees
      }];
      options.fps = rate || this.fps;

      this.to(options);

    } else {

      this.value = degrees;

      degrees += this.offset;

      if (this.invert) {
        degrees = Fn.map(
          degrees,
          this.degreeRange[0], this.degreeRange[1],
          this.degreeRange[1], this.degreeRange[0]
        );
      }

      this.update(degrees);

      if (state.history.length > 5) {
        state.history.shift();
      }

      state.history.push({
        timestamp: Date.now(),
        degrees: degrees,
        target: target
      });
    }
  }

  // return this instance
  return this;
};


/**
 * Animation.normalize
 *
 * @param [number || object] keyFrames An array of step values or a keyFrame objects
 */

Servo.prototype[Animation.normalize] = function(keyFrames) {

  var last = this.last ? this.last.target : this.startAt;

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
    var value = frame;

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

      /* istanbul ignore else */
      if (!frame.easing) {
        frame.easing = "linear";
      }
    }
    return frame;
  });
};

/**
 * Animation.render
 *
 * @position [number] value to set the servo to
 */
Servo.prototype[Animation.render] = function(position) {
  return this.to(position[0]);
};

/**
 * step
 *
 * Update the servo horn's position by specified degrees (over time)
 *
 * @param  {Number} degrees   Degrees to turn servo to.
 * @param  {Number} time      Time to spend in motion.
 *
 * @return {Servo} instance
 */

Servo.prototype.step = function(degrees, time) {
  return this.to(this.last.target + degrees, time);
};

/**
 * move Alias for Servo.prototype.to
 */
Servo.prototype.move = function(degrees, time) {
  console.warn("Servo.prototype.move has been renamed to Servo.prototype.to");

  return this.to(degrees, time);
};

/**
 * min Set Servo to minimum degrees, defaults to 0deg
 * @param  {Number} time      Time to spend in motion.
 * @param  {Number} rate      The rate of the motion transiton
 * @return {Object} instance
 */

Servo.prototype.min = function(time, rate) {
  return this.to(this.range[0], time, rate);
};

/**
 * max Set Servo to maximum degrees, defaults to 180deg
 * @param  {Number} time      Time to spend in motion.
 * @param  {Number} rate      The rate of the motion transiton
 * @return {[type]} [description]
 */
Servo.prototype.max = function(time, rate) {
  return this.to(this.range[1], time, rate);
};

/**
 * center Set Servo to centerpoint, defaults to 90deg
 * @param  {Number} time      Time to spend in motion.
 * @param  {Number} rate      The rate of the motion transiton
 * @return {[type]} [description]
 */
Servo.prototype.center = function(time, rate) {
  return this.to(Math.abs((this.range[0] + this.range[1]) / 2), time, rate);
};

/**
 * home Return Servo to startAt position
 */
Servo.prototype.home = function() {
  return this.to(this.startAt);
};

/**
 * sweep Sweep the servo between min and max or provided range
 * @param  {Array} range constrain sweep to range
 *
 * @param {Object} options Set range or interval.
 *
 * @return {[type]} [description]
 */
Servo.prototype.sweep = function(opts) {

  var options = {
    keyFrames: [{
      value: this.range[0]
    }, {
      value: this.range[1]
    }],
    metronomic: true,
    loop: true,
    easing: "inOutSine"
  };

  // If opts is an array, then assume a range was passed
  if (Array.isArray(opts)) {
    options.keyFrames = rangeToKeyFrames(opts);
  } else {
    if (typeof opts === "object" && opts !== null) {
      Object.assign(options, opts);
      /* istanbul ignore else */
      if (Array.isArray(options.range)) {
        options.keyFrames = rangeToKeyFrames(options.range);
      }
    }
  }

  return this.to(options);
};

function rangeToKeyFrames(range) {
  return range.map(function(value) {
    return { value: value };
  });
}

/**
 * stop Stop a moving servo
 * @return {[type]} [description]
 */
Servo.prototype.stop = function() {
  var state = priv.get(this);

  if (state.animation) {
    state.animation.stop();
  }

  if (this.type === "continuous") {
    this.to(
      this.deadband.reduce(function(a, b) {
        return Math.round((a + b) / 2);
      })
    );
  } else {
    clearInterval(this.interval);
  }

  return this;
};

//
["clockWise", "cw", "counterClockwise", "ccw"].forEach(function(api) {
  Servo.prototype[api] = function(rate) {
    var range;
    rate = rate === undefined ? 1 : rate;
    /* istanbul ignore if */
    if (this.type !== "continuous") {
      this.board.error(
        "Servo",
        "Servo.prototype." + api + " is only available for continuous servos"
      );
    }
    if (api === "cw" || api === "clockWise") {
      range = [rate, 0, 1, this.deadband[1] + 1, this.range[1]];
    } else {
      range = [rate, 0, 1, this.deadband[0] - 1, this.range[0]];
    }
    return this.to(Fn.scale.apply(null, range) | 0);
  };
});


/**
 *
 * Static API
 *
 *
 */

Servo.Continuous = function(pinOrOpts) {
  var opts = {};

  if (typeof pinOrOpts === "object") {
    Object.assign(opts, pinOrOpts);
  } else {
    opts.pin = pinOrOpts;
  }

  opts.type = "continuous";
  return new Servo(opts);
};

Servo.Continuous.speeds = {
  // seconds to travel 60 degrees
  "@4.8V": 0.23,
  "@5.0V": 0.17,
  "@6.0V": 0.18
};


module.exports = Servo;
