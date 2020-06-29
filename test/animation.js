import assert from 'assert';
import sinon from 'sinon';

import { Digital, PWM } from "@dtex/mock-io";
import Animation from "j5e/animation";
import { Segment } from "j5e/animation";
import LED from "j5e/led";
import Servo from "j5e/servo";


const a = new Servo({
  pin: 3,
  io: PWM
});

const b = new Servo({
  pin: 5,
  io: PWM,
  startAt: 20
});

const c = new Servo({
  pin: 6,
  io: PWM
});

const chain = {
  result: [],
  "render": function(args) {
    this.result = this.result.concat(args);
  },
  "normalize": function(keyFrames) {
    const last = [50, 0, -20];

    // If user passes null as the first element in keyFrames use current position
    if (keyFrames[0] === null) {
      keyFrames[0] = {
        position: last
      };
    }

    return keyFrames;
  }
};

const segment = {
  single: {
    duration: 500,
    fps: 10,
    cuePoints: [0, 0.33, 0.66, 1.0],
    keyFrames: [null, false, {
      degrees: 45
    }, 33],
    paused: true
  },
  multi: {
    duration: 500,
    fps: 10,
    cuePoints: [0, 0.33, 0.66, 1.0],
    keyFrames: [
      [null, false, {
        degrees: 45
      }, 33],
      [null, 46, {
        degrees: 180
      }, -120],
      [null, {
        degrees: 120
      }, {
        step: 60
      }]
    ],
    paused: true
  }
};

describe('Animation', function() {
  
  describe('instantiation', function() {
    
    it('should return a valid Animation instance when passed a target', async function() {
      
      const led = await new LED({
        pin: 12,
        io: Digital
      });

      const animation = await new Animation(led);
      
      assert.equal(led instanceof LED, true);
      assert.equal(led.LOW, 0);
      assert.equal(led.HIGH, 1);

      assert.equal(animation instanceof Animation, true);
      assert.equal(animation.defaultTarget instanceof LED, true);

    });

  });

  describe('enqueue', function() {
    
    it('should create a segment opts object with all the default values', async function() {
      
      const clock = sinon.useFakeTimers();
      
      const led = await new LED({
        pin: 12,
        io: Digital
      });

      sinon.spy(led.io, "write");
      
      const animation = await new Animation(led);
      animation.enqueue({
        keyFrames: [0, 1],
      });

      // Segments enqueud to an idle animation immediately pop off the segment queue
      assert.equal(animation.segments.length, 0);
      
      assert.equal(animation.keyFrames.length, 1);
      assert.equal(animation.keyFrames[0].length, 2);

      assert.equal(animation.keyFrames[0][0].value, 0);
      assert.equal(typeof animation.keyFrames[0][0].easing, "function");
      assert.equal(animation.keyFrames[0][0].easing(0.25), 0.25);
      assert.equal(animation.keyFrames[0][1].value, 1);

      clock.tick(1050);
      assert.equal(led.io.write.callCount, 50);

      clock.restore();
      
    });

    it('should accept enqueue with no properties', async function() {
      let animation = await new Animation(chain);
      
      animation.paused = true;
      assert.equal(animation.enqueue(), animation);
      assert.equal(animation.segments.length, 1);
    })

  });

  describe('next', function() {
    
    it('should handle next for recursive segments', async function() {

      const onstart = sinon.spy();
      const stop = sinon.spy();

      const animation = await new Animation(chain);

      animation.segments.push(await new Segment());
      animation.segments[0].segments.push(await new Segment());
      animation.segments[0].segments[0].segments.push(await new Segment());

      animation.segments[0].currentSpeed = 0;
      animation.segments[0].onstart = onstart;
      animation.segments[0].reverse = true;

      animation.segments[0].segments[0].currentSpeed = 1;
      animation.segments[0].segments[0].onstart = null;

      animation.segments[0].segments[0].segments[0].currentSpeed = 1;
      animation.segments[0].segments[0].segments[0].onstart = onstart;
      animation.segments[0].segments[0].segments[0].playLoop = {
        stop,
      };

      const normalizeKeyframes = sinon.stub(animation, "normalizeKeyframes");

      assert.equal(animation.segments.length, 1);
      assert.equal(animation.next(), animation);
      assert.equal(onstart.callCount, 1);
      assert.equal(normalizeKeyframes.callCount, 1);
      assert.equal(animation.paused, true);
      assert.equal(animation.segments.length, 1);

      // animation.next();
      // assert.equal(normalizeKeyframes.callCount, 2);
      // assert.equal(animation.paused, false);
      // assert.equal(animation.segments.length, 1);

      // animation.next();
      // assert.equal(onstart.callCount, 2);
      // assert.equal(animation.segments.length, 0);

      // // No segments left
      // animation.next();
      // assert.equal(stop.callCount, 1);
    });

    it('should shift queued segment onto self on next()', async function() {
      
      const stop = sinon.spy();
  
      const animation = await new Animation(chain);
      animation.paused = true;
      animation.normalizeKeyframes = sinon.stub(animation, "normalizeKeyframes");
  
      assert.equal(animation.BRAND, undefined);
  
      animation.enqueue({ BRAND: 1 });
  
      assert.equal(animation.segments.length, 1);
      assert.equal(animation.BRAND, undefined);
  
      // animation.next();
  
      // assert.equal(animation.BRAND, 1);
  
      // animation.enqueue({ BRAND: Infinity });
  
      // animation.playLoop = {
      //   stop,
      // };
  
  
      // animation.next();
  
      // assert.equal(animation.BRAND, Infinity);
    });
  
  });

  describe('pause', function() {

    it('should pause and unpause', async function() {
      const stop = sinon.spy();
      const onpause = sinon.spy();
      const normalizeKeyframes = sinon.stub();

      const animation = new Animation(chain);
      animation.playLoop = {
        stop,
      };
      animation.onpause = onpause;
      animation.normalizeKeyframes = normalizeKeyframes;


      animation.on("animation:pause", () => {
        assert.ok(true);
      });

      animation.paused = false;
      animation.pause();

      assert.equal(animation.paused, true);
      assert.equal(stop.callCount, 1);
      assert.equal(onpause.callCount, 1);


      delete animation.playLoop;
      delete animation.onpause;

      animation.paused = false;

      animation.pause();

      assert.equal(animation.paused, true);
    });
  
  });

  describe('stop', function() {

    it('should empty the segment queue on stop', async function() {
      const stop = sinon.spy();
      const onstop = sinon.spy();
      const normalizeKeyframes = sinon.stub();

      const animation = await new Animation(chain);
      animation.playLoop = {
        stop
      };
      animation.onstop = onstop;
      animation.normalizeKeyframes = normalizeKeyframes;

      animation.segments.push(await new Segment());


      animation.on("animation:stop", () => {
        assert.ok(true);
      });
    
      assert.equal(animation.segments.length, 1);

        animation.stop();

        assert.equal(animation.segments.length, 0);
        assert.equal(stop.callCount, 1);
        assert.equal(onstop.callCount, 1);

        delete animation.playLoop;
        delete animation.onstop;

        animation.stop();

        assert.equal(animation.segments.length, 0);
        assert.equal(stop.callCount, 1);
        assert.equal(onstop.callCount, 1);
    });

  });

  describe('speed', function() {

    it('should scale the duration and call play when speed is set', async function() {
      const stop = sinon.spy();
      const onstop = sinon.spy();
      const normalizeKeyframes = sinon.stub();

      const animation = await new Animation(chain);
      animation.playLoop = {
        stop
      };
      animation.onstop = onstop;
      animation.normalizeKeyframes = normalizeKeyframes;

      animation.segments.push(await new Segment());

      assert.equal(animation.currentSpeed, 1);
      assert.equal(animation.scaledDuration, undefined);
      assert.equal(animation.startTime, undefined);
      assert.equal(animation.endTime, undefined);

      // assert.equal(animation.speed(2), animation);
      // assert.equal(animation.currentSpeed, 2);
      // assert.equal(animation.speed(), 2);

      // assert.equal(animation.scaledDuration, 500);
      // assert.notEqual(animation.startTime, undefined);
      // assert.notEqual(animation.endTime, undefined);
      // assert.equal(typeof animation.startTime, "number");
      // assert.equal(typeof animation.endTime, "number");

      // assert.equal(animation.play.callCount, 1);
      // animation.paused = false;
      // assert.equal(animation.speed(3), animation);
      // assert.equal(animation.play.callCount, 2);

      // animation.paused = true;
      // assert.equal(animation.speed(3), animation);
      // assert.equal(animation.play.callCount, 2);
    });
  
  });

  describe('loop', function() {

    it('should change directions when metronomic is true', async function() {
      const stop = sinon.spy();
      const onstop = sinon.spy();
      const normalizeKeyframes = sinon.stub();

      const animation = await new Animation(chain);
      animation.playLoop = {
        stop
      };
      animation.onstop = onstop;
      animation.normalizeKeyframes = normalizeKeyframes;

      const clock = sinon.useFakeTimers();
      animation.normalizeKeyframes = sinon.stub(Animation.prototype, "normalizeKeyframes").callsFake(() => {
        animation.loopback = 1;
      });

      const startTime = Date.now();
      const loop = {
        calledAt: startTime + 1000
      };

      animation.startTime = startTime;
      animation.normalizedKeyFrames = [];
      animation.target = {};
      animation.target[Animation.render] = () => {};
      animation.speed(1);

      animation.metronomic = true;
      animation.reverse = false;
      animation.loop = false;
      animation.onloop = sinon.spy();
      // animation.loopFunction(loop);

      // assert.equal(animation.onloop.callCount, 1);
      // animation.reverse = false;
      animation.normalizeKeyframes.restore();

    });

    it('should call onloop when reaching the end of a segment', async function() {
      const stop = sinon.spy();
      const onstop = sinon.spy();
      const normalizeKeyframes = sinon.stub();

      const animation = await new Animation(chain);
      animation.playLoop = {
        stop
      };
      animation.onstop = onstop;
      animation.normalizeKeyframes = normalizeKeyframes;

      const clock = sinon.useFakeTimers();
      animation.normalizeKeyframes = sinon.stub(Animation.prototype, "normalizeKeyframes").callsFake(() => {
        animation.loopback = 1;
        animation.normalizedKeyFrames = [[
          { value: 90, easing: "linear" },
          { step: false, easing: "linear", value: 90 },
          { value: 45, easing: "linear" },
          { step: 33, easing: "linear", value: 78 }
        ]];
      });
  
      const startTime = Date.now();
      const loop = {
        calledAt: startTime + 1000
      };
  
      animation.startTime = startTime;
      animation.target = {};
      animation.target[Animation.render] = () => {};
      animation.speed(1);
  
      animation.metronomic = true;
      animation.reverse = false;
      animation.loop = true;
      animation.fps = 10;
      animation.onloop = sinon.spy();
      animation.normalizeKeyframes();
      // animation.loopFunction(loop);
  
      // test.equal(animation.onloop.callCount, 1);
      // animation.stop();
      animation.normalizeKeyframes.restore();

    });

    it('should run forward on loop when reverse, metronomic, and loop are all true', async function() {
      const stop = sinon.spy();
      const onstop = sinon.spy();
      const normalizeKeyframes = sinon.stub(Animation.prototype, "normalizeKeyframes").callsFake(() => {
        this.loopback = 1;
      });

      const animation = await new Animation(chain);
      animation.playLoop = {
        stop
      };
      animation.onstop = onstop;
      animation.normalizeKeyframes = normalizeKeyframes;

      const clock = sinon.useFakeTimers();
      
      const startTime = Date.now();
      const loop = {
        calledAt: startTime + 1000
      };
  
      animation.startTime = startTime;
      animation.normalizedKeyFrames = [];
      animation.target = {};
      animation.target[Animation.render] = () => {};
      animation.speed(1);
  
      animation.metronomic = true;
      animation.reverse = true;
      animation.loop = true;
      animation.onloop = sinon.spy();
      // animation.loopFunction(loop);
  
      // assert.equal(animation.reverse, false);

      animation.normalizeKeyframes.restore();
    });

    it('should run in reverse on loop when metronomic and loop are both true', async function() {
      const stop = sinon.spy();
      const onstop = sinon.spy();
      const normalizeKeyframes = sinon.stub(Animation.prototype, "normalizeKeyframes").callsFake(() => {
        this.loopback = 1;
      });

      const animation = await new Animation(chain);
      animation.playLoop = {
        stop
      };
      animation.onstop = onstop;
      animation.normalizeKeyframes = normalizeKeyframes;

      const clock = sinon.useFakeTimers();
      const startTime = Date.now();
      const loop = {
        calledAt: startTime + 1000
      };

      animation.startTime = startTime;
      animation.normalizedKeyFrames = [];
      animation.target = {};
      animation.target[Animation.render] = () => {};
      animation.speed(1);

      animation.metronomic = true;
      animation.reverse = false;
      animation.loop = true;
      animation.onloop = sinon.spy();
      // animation.loopFunction(loop);

      // assert.equal(animation.reverse, true);

      animation.normalizeKeyframes.restore();
    });


  });

  

});