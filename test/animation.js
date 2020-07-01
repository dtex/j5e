import assert from "assert";
import sinon from "sinon";

import { Digital, PWM } from "@dtex/mock-io";
import Animation from "j5e/animation";
import { Segment } from "j5e/animation";
import LED from "j5e/led";
import Servo from "j5e/servo";

let servo;

(async() => {
  servo = await new Servo({
    pin: 3,
    io: PWM
  });
})();

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

describe("Instantiation", function() {

  it("should return a valid Animation instance when passed a target", async function() {

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

  it("should return a valid Animation instance when not passed a target", async function() {

    const led = await new LED({
      pin: 12,
      io: Digital
    });

    const animation = await new Animation();

    assert.equal(animation instanceof Animation, true);
    assert.deepEqual(animation.defaultTarget, {});

  });

});

describe("Methods", function() {
  describe("enqueue", function() {
    it("should create a segment opts object with all the default values", async function() {

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

    it("should accept enqueue with no properties", async function() {
      let animation = await new Animation(chain);

      animation.paused = true;
      assert.equal(animation.enqueue(), animation);
      assert.equal(animation.segments.length, 1);
    });

    describe("Options", function() {
      describe("metronomic", function() {
        it("should change directions when metronomic is true", async function() {
          const clock = sinon.useFakeTimers();

          const animation = await new Animation(servo);
          animation.enqueue({ keyFrames: [[0, 1]], metronomic: true });

          animation.onloop = sinon.spy();

          clock.tick(1050);
          assert.equal(animation.onloop.callCount, 1);
          assert.equal(animation.reverse, true);
          clock.restore();

        });

        it("should run in reverse on loop when metronomic and loop are both true", async function() {
          const clock = sinon.useFakeTimers();
          const onloop = sinon.stub();
          const animation = await new Animation(servo);

          animation.enqueue({ keyFrames: [[0, 1]], loop: true, metronomic: true, onloop });
          assert.equal(animation.reverse, undefined);
          assert.equal(onloop.callCount, 0);

          clock.tick(1050);
          assert.equal(animation.reverse, true);
          assert.equal(onloop.callCount, 1);

          clock.tick(1050);
          assert.equal(animation.reverse, false);
          assert.equal(onloop.callCount, 2);

          clock.restore();
        });

      });

      describe("onloop", function() {

        it("should call the onloop callback when reaching the end of a segment", async function() {
          const clock = sinon.useFakeTimers();
          const onloop = sinon.stub();
          const animation = await new Animation(servo);
          animation.enqueue({ keyFrames: [[0, 1]], loop: true, onloop });

          clock.tick(1050);
          assert.equal(onloop.callCount, 1);

          clock.restore();

        });

      });

      describe("reverse", function() {

        it("should run forward on loop when reverse, metronomic, and loop are all true", async function() {
          const clock = sinon.useFakeTimers();
          const onloop = sinon.stub();
          const animation = await new Animation(servo);

          animation.enqueue({ keyFrames: [[0, 1]], loop: true, reverse: true, metronomic: true, onloop });
          assert.equal(animation.reverse, true);
          assert.equal(onloop.callCount, 0);

          clock.tick(1050);
          assert.equal(animation.reverse, false);
          assert.equal(onloop.callCount, 1);

          clock.tick(1050);
          assert.equal(animation.reverse, true);
          assert.equal(onloop.callCount, 2);

          clock.restore();
        });
      });

    });
  });

  describe("next", function() {

    it("should handle next for multiple segments", async function() {

      const onstart = sinon.spy();
      const clock = sinon.useFakeTimers();
      const animation = await new Animation(servo);
      const normalizeKeyframes = sinon.stub(animation, "normalizeKeyframes");

      animation.enqueue({ keyFrames: [[0, 1]], onstart: onstart, reverse: true });

      // First segment is immediately shifted of the queue
      assert.equal(animation.segments.length, 0);
      assert.equal(onstart.callCount, 1);
      assert.equal(normalizeKeyframes.callCount, 1);
      assert.equal(animation.paused, false);
      assert.equal(animation.segments.length, 0);

      animation.enqueue({ keyFrames: [[0, 1]], onstart: onstart, reverse: true });
      assert.equal(animation.segments.length, 1);

      animation.enqueue({ keyFrames: [[0, 1]], onstart: onstart, reverse: true });
      assert.equal(animation.segments.length, 2);

      animation.next();
      assert.equal(animation.segments.length, 1);
      assert.equal(normalizeKeyframes.callCount, 2);
      assert.equal(animation.paused, false);
      assert.equal(animation.segments.length, 1);

      animation.next();
      assert.equal(animation.segments.length, 0);
      assert.equal(normalizeKeyframes.callCount, 3);
      assert.equal(animation.paused, false);
      assert.equal(animation.segments.length, 0);

      // No segments left
      animation.next();

      clock.restore();
    });

    it("should shift queued segment onto self on next()", async function() {

      const stop = sinon.spy();
      const clock = sinon.useFakeTimers();

      const animation = await new Animation(servo);
      animation.paused = true;
      // animation.normalizeKeyframes = sinon.stub(animation, "normalizeKeyframes");

      assert.equal(animation.BRAND, undefined);

      animation.enqueue({ keyFrames: [[0, 1]], reverse: true, BRAND: 1 });

      assert.equal(animation.segments.length, 1);
      assert.equal(animation.BRAND, undefined);

      animation.next();
      assert.equal(animation.BRAND, 1);

      animation.enqueue({ keyFrames: [[0, 1]], reverse: true, BRAND: Infinity });
      animation.next();
      assert.equal(animation.BRAND, Infinity);
      clock.restore();
    });

  });

  describe("pause", function() {

    it("should pause and unpause", async function() {
      const stop = sinon.spy();
      const onpause = sinon.spy();
      const clock = sinon.useFakeTimers();
      const normalizeKeyframes = sinon.stub();

      const animation = new Animation(servo);
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
      clock.restore();
    });

  });

  describe("stop", function() {

    it("should empty the segment queue on stop", async function() {
      const stop = sinon.spy();
      const onstop = sinon.spy();
      const clock = sinon.useFakeTimers();
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
      clock.restore();
    });

  });
  describe("speed", function() {

    it("should scale the duration and call play when speed is set", async function() {
      const stop = sinon.spy();
      const onstop = sinon.spy();
      const clock = sinon.useFakeTimers();
      const normalizeKeyframes = sinon.stub();

      const animation = await new Animation(chain);
      animation.playLoop = {
        stop
      };
      animation.onstop = onstop;
      animation.normalizeKeyframes = normalizeKeyframes;
      sinon.stub(animation, "play");

      animation.segments.push(await new Segment());

      assert.equal(animation.currentSpeed, 1);
      assert.equal(animation.scaledDuration, undefined);
      assert.equal(animation.startTime, undefined);
      assert.equal(animation.endTime, undefined);

      assert.equal(animation.speed(2), animation);
      assert.equal(animation.currentSpeed, 2);
      assert.equal(animation.speed(), 2);

      assert.equal(animation.scaledDuration, 500);
      assert.notEqual(animation.startTime, undefined);
      assert.notEqual(animation.endTime, undefined);
      assert.equal(typeof animation.startTime, "number");
      assert.equal(typeof animation.endTime, "number");

      assert.equal(animation.play.callCount, 1);
      animation.paused = false;
      assert.equal(animation.speed(3), animation);
      assert.equal(animation.play.callCount, 2);

      animation.paused = true;
      assert.equal(animation.speed(3), animation);
      assert.equal(animation.play.callCount, 2);
      clock.restore();
    });

  });

});

// describe('Events', function() {
//   describe('close', function() {
//     it('should fire "close" when a pin goes high', async function() {
//       // ...
//     });
//     // [ all other tests related to close ]
//   });
//   // [ All other Events, each with it's own describe ]
// });
