import assert from "assert";
import sinon from "sinon";
import { PWM } from "@dtex/mock-io";
import Servo from "j5e/servo";

describe("Servo - Standard", function() {

  describe("Instantiation", function() {

    it("should return a valid Servo instance when passed an options object", async function() {

      const servo = await new Servo({
        pin: 12,
        io: PWM
      });
      assert.equal(servo instanceof Servo, true);

    });

    describe("Options", function() {

      describe("type", async function() {

        it("should behave as contiuous rotation servo when type is \"continuous\"", async function() {
          const servo = await new Servo({
            pin: 12,
            io: PWM,
            type: "continuous"
          });

          servo.cw();
          assert.equal(servo.position, 180);

          servo.stop();
          assert.equal(servo.position, 90);
        });

      });

      describe("pwmRange", async function() {

        it("should scale the PWM write range", async function() {

          const servo = await new Servo({
            pin: 12,
            io: PWM,
            pwmRange: [1000, 2000]
          });
          let spy = sinon.spy(servo.io, "write");

          servo.to(180);
          assert.equal(servo.io.write.getCall(-1).args[0], 102);

          servo.to(0);
          assert.equal(servo.io.write.getCall(-1).args[0], 51);

          spy.restore();
        });

      });

      describe("deadband", async function() {

        it("should move to the middle of deadband on stop", async function() {

          const servo = await new Servo({
            pin: 12,
            io: PWM,
            deadband: [80, 85],
            type: "continuous"
          });
          let spy = sinon.spy(servo.io, "write");

          servo.cw(1);
          assert.equal(servo.io.write.getCall(-1).args[0], 122);
          servo.stop();
          assert.equal(servo.io.write.getCall(-1).args[0], 72);

          spy.restore();
        });

      });

      describe("range", async function() {

        it("should limit the range of motion", async function() {

          const servo = await new Servo({
            pin: 12,
            io: PWM,
            range: [40, 120]
          });

          servo.to(0);
          assert.equal(servo.position, 40);
          servo.to(180);
          assert.equal(servo.position, 120);

        });

      });

      describe("deviceRange", async function() {

        it("should set the range (throw) of the device", async function() {

          const servo = await new Servo({
            pin: 12,
            io: PWM,
            deviceRange: [0, 360]
          });

          servo.min();
          assert.equal(servo.position, 0);
          servo.max();
          assert.equal(servo.position, 360);

        });

      });

      describe("startAt", async function() {

        it("should start at the passed value", async function() {

          const servo = await new Servo({
            pin: 12,
            io: PWM,
            startAt: 120
          });

          assert.equal(servo.position, 120);
        });

      });

      describe("offset", async function() {

        it("should offset all calls to", async function() {

          const servo = await new Servo({
            pin: 12,
            io: PWM,
            offset: -10
          });
          servo.to(90);
          assert.equal(servo.last.target, 90);
          assert.equal(servo.position, 80);
        });

      });

      describe("invert", async function() {

        it("should invert positions", async function() {

          const servo = await new Servo({
            pin: 12,
            io: PWM,
            invert: true
          });
          servo.to(120);
          assert.equal(servo.last.target, 120);
          assert.equal(servo.position, 60);
        });

      });

      describe("center", async function() {

        it("should not center or go to startAt on instantiation when false", async function() {

          const servo = await new Servo({
            pin: 12,
            io: PWM,
            center: false
          });
          assert.equal(servo.position, -1);
        });

      });

    });

  });

  describe("Properties", function() {

    // position

    describe("history", function() {

      it("should respond with the five most recent target positions", async function() {

        const servo = await new Servo({
          pin: 12,
          io: PWM
        });

        servo.to(10);
        servo.to(20);
        servo.to(30);
        servo.to(40);
        servo.to(50);
        servo.to(60);

        assert.equal(servo.history.length, 5);
        assert.equal(servo.history[0].degrees, 20);
        assert.equal(servo.history[1].degrees, 30);
        assert.equal(servo.history[2].degrees, 40);
        assert.equal(servo.history[3].degrees, 50);
        assert.equal(servo.history[4].degrees, 60);

      });

    });

    describe("last", function() {

      it("should respond with the most recent target positions", async function() {

        const servo = await new Servo({
          pin: 12,
          io: PWM
        });

        servo.to(50);
        servo.to(60);

        assert.equal(servo.last.degrees, 60);

      });

    });

    describe("position", function() {

      it("should respond with the most current positions", async function() {

        const servo = await new Servo({
          pin: 12,
          io: PWM
        });

        servo.to(50);
        servo.to(60);

        assert.equal(servo.position, 60);

      });

    });

    // [ All other properties, each with it's own describe ]

  });

  describe("Methods", function() {

    // to
    // step
    // min
    // max
    // center
    // home
    // sweep
    // stop
    // cw
    // ccw
    // normalize
    // rangeToKeyFrames
    describe("to", function() {

      it("should go to the position passed in a single parameter", async function() {
        const servo = await new Servo({
          pin: 12,
          io: PWM
        });

        servo.to(50);

        assert.equal(servo.position, 50);

      });

      it("should go to the position over time when passed two arguments", async function() {

        let clock = sinon.useFakeTimers();

        const servo = await new Servo({
          pin: 12,
          io: PWM
        });

        assert.equal(servo.position, -1);

        servo.to(90);
        assert.equal(servo.position, 90);

        servo.to(50, 500);
        assert.equal(servo.position, 90);

        clock.tick(250);
        assert.equal(servo.position, 70);

        clock.tick(250);
        assert.equal(servo.position, 50);

        clock.restore();

      });

      it("should animate when passed an animation object", async function() {
        let clock = sinon.useFakeTimers();

        const servo = await new Servo({
          pin: 12,
          io: PWM
        });

        servo.to({
          duration: 1000,
          cuePoints: [0, 0.5, 0.75, 1.0],
          keyFrames: [{ degrees: 0 }, { degrees: 180 }, -180, 90]
        });

        clock.tick(260);
        assert.equal(Math.abs(servo.position - 93.6) < 0.1, true);

        clock.tick(240);
        assert.equal(servo.position, 180);

        clock.tick(240);
        assert.equal(Math.abs(servo.position - 7.2) < 0.1, true);

        clock.tick(260);
        assert.equal(servo.position, 90);

        clock.restore();
      });

      // [ all other tests related to someMethod ]

    });

    // [ All other methods, each with it's own describe ]

  });

  describe("Events", function() {

    //moveComplete
    describe("someEvent", function() {

      it("should emit the event at the appropriate time", async function() {
        // ...
      });

      // [ all other tests related to someEvent ]

    });

    // [ All other events, each with it's own describe ]

  });

});
