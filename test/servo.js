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

      describe("pwmRange", async function() {

        it("should scale the PWM write range", async function() {

          const servo = await new Servo({
            pin: 12,
            io: PWM
          }, {
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

      describe("range", async function() {

        it("should limit the range of motion", async function() {

          const servo = await new Servo({
            pin: 12,
            io: PWM
          }, {
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
            io: PWM
          }, {
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
            io: PWM
          }, {
            startAt: 120
          });

          assert.equal(servo.position, 120);
        });

      });

      describe("offset", async function() {

        it("should offset all calls to", async function() {

          const servo = await new Servo({
            pin: 12,
            io: PWM
          }, {
            offset: -10
          });

          assert.equal(servo.last.target, 90);
          assert.equal(servo.position, 80);
        });

      });

      describe("invert", async function() {

        it("should invert positions", async function() {

          const servo = await new Servo({
            pin: 12,
            io: PWM
          }, {
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
            io: PWM
          }, {
            center: false
          });
          assert.equal(servo.position, 90);
        });

      });

    });

  });

  describe("Properties", function() {

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

  });

  describe("Methods", function() {

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

    });

    describe("step", function() {

      it("should move the requested number of degrees", async function() {

        const servo = await new Servo({
          pin: 12,
          io: PWM
        });

        assert.equal(servo.position, 90);

        servo.step(20);
        assert.equal(servo.position, 110);

        servo.step(-60);
        assert.equal(servo.position, 50);

      });

      it("should move the requested number of degrees over time", async function() {

        const clock = sinon.useFakeTimers();
        const servo = await new Servo({
          pin: 12,
          io: PWM
        });

        assert.equal(servo.position, 90);

        servo.step(20, 1000);
        clock.tick(500);
        assert.equal(servo.position, 100);
        clock.tick(500);
        assert.equal(servo.position, 110);

        servo.step(-60, 1000);
        clock.tick(500);
        assert.equal(servo.position, 80);
        clock.tick(500);
        assert.equal(servo.position, 50);

      });

    });

    describe("min", function() {

      it("should move the min position", async function() {

        const servo = await new Servo({
          pin: 12,
          io: PWM
        });

        servo.min();
        assert.equal(servo.position, 0);

      });

      it("should move the min position passed in options", async function() {

        const servo = await new Servo({
          pin: 12,
          io: PWM
        }, {
          range: [20, 160]
        });

        servo.min();
        assert.equal(servo.position, 20);

      });

    });

    describe("max", function() {

      it("should move the max position", async function() {

        const servo = await new Servo({
          pin: 12,
          io: PWM
        });

        servo.max();
        assert.equal(servo.position, 180);

      });

      it("should move the max position passed in options", async function() {

        const servo = await new Servo({
          pin: 12,
          io: PWM
        }, {
          range: [20, 160]
        });

        servo.max();
        assert.equal(servo.position, 160);

      });

    });

    describe("center", function() {

      it("should center the servo", async function() {

        const servo = await new Servo({
          pin: 12,
          io: PWM
        });

        servo.to(0);
        servo.center();
        assert.equal(servo.position, 90);

      });

      it("should center the servo based on deviceRange option", async function() {

        const servo = await new Servo({
          pin: 12,
          io: PWM
        }, {
          deviceRange: [30, 100]
        });

        servo.to(0);
        servo.center();
        assert.equal(servo.position, 65);

      });

    });

    describe("home", function() {

      it("should move to the default startAt position", async function() {

        const servo = await new Servo({
          pin: 12,
          io: PWM
        });

        servo.home();
        assert.equal(servo.position, 90);

      });

      it("should move to the startAt passed in options", async function() {

        const servo = await new Servo({
          pin: 12,
          io: PWM
        }, {
          startAt: 20
        });

        servo.home();
        assert.equal(servo.position, 20);

      });

    });

    describe("sweep", function() {

      it("should sweep at the default speed", async function() {

        let clock = sinon.useFakeTimers();

        const servo = await new Servo({
          pin: 12,
          io: PWM
        });

        servo.to(0);

        servo.sweep();
        assert.equal(servo.position, 0);

        clock.tick(250);
        assert.equal(Math.abs(servo.position - 24.4) < 0.1, true);

        clock.tick(250);
        assert.equal(Math.abs(servo.position - 90) < 0.1, true);

        clock.tick(250);
        assert.equal(Math.abs(servo.position - 151.6) < 0.1, true);

        clock.tick(250);
        assert.equal(Math.abs(servo.position - 180) < 0.1, true);

        clock.tick(250);
        assert.equal(Math.abs(servo.position - 155.6) < 0.1, true);

        clock.tick(250);
        assert.equal(Math.abs(servo.position - 90) < 0.1, true);

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

    });

    describe("stop", function() {

      it("should stop an ongoing animation", async function() {

        let clock = sinon.useFakeTimers();

        const servo = await new Servo({
          pin: 12,
          io: PWM
        });

        servo.to(0);

        servo.sweep();
        assert.equal(servo.position, 0);

        clock.tick(250);
        assert.equal(Math.abs(servo.position - 24.4) < 0.1, true);

        clock.tick(250);
        assert.equal(Math.abs(servo.position - 90) < 0.1, true);

        clock.tick(250);
        assert.equal(Math.abs(servo.position - 151.6) < 0.1, true);

        servo.stop();

        clock.tick(250);
        assert.equal(Math.abs(servo.position - 151.6) < 0.1, true);

        clock.restore();

      });

    });

    describe("normalize", function() {

      it("should replace null in the first element with the current position", async function() {

        const servo = await new Servo({
          pin: 12,
          io: PWM
        });

        const result = servo.normalize([null, 20]);
        assert.equal(result[0].value, 90);

      });

      it("should replace step in the first element with the current position + step", async function() {

        const servo = await new Servo({
          pin: 12,
          io: PWM
        });

        const result = servo.normalize([50, 20]);
        assert.equal(result[0].value, 140);

      });

      it("should handle step values as numbers when in positions > 0", async function() {

        const servo = await new Servo({
          pin: 12,
          io: PWM
        });

        const result = servo.normalize([50, 20, -60]);
        assert.equal(result[0].value, 140);
        assert.equal(result[1].step, 20);
        assert.equal(result[2].step, -60);

      });

      it("should convert \"degrees\" to \"value\"", async function() {

        const servo = await new Servo({
          pin: 12,
          io: PWM
        });

        const result = servo.normalize([{ degrees: 50 }, { degrees: 20 }, { degrees: -60 }]);
        assert.equal(result[0].value, 50);
        assert.equal(result[1].value, 20);
        assert.equal(result[2].value, -60);

      });

      it("should coconvert \"copyDegrees\" to \"copyValue\"", async function() {

        const servo = await new Servo({
          pin: 12,
          io: PWM
        });

        const result = servo.normalize([{ degrees: 50 }, { step: 20 }, { copyDegrees: 0 }]);
        assert.equal(result[0].value, 50);
        assert.equal(result[1].step, 20);
        assert.equal(result[2].copyValue, 0);

      });

    });

  });

  describe("Events", function() {

    describe("move:complete", function() {

      it("should emit the event at the appropriate time", async function() {
        const completeSpy = sinon.spy();
        const clock = sinon.useFakeTimers();

        const servo = await new Servo({
          pin: 12,
          io: PWM
        });

        servo.to(90);
        servo.on("move:complete", completeSpy);

        servo.to(180, 1000);
        clock.tick(500);
        assert.equal(completeSpy.callCount, 0);
        clock.tick(520);
        assert.equal(completeSpy.callCount, 1);
      });

    });

  });

});

describe("Servo - Continuous", function() {

  describe("Instantiation", function() {

    describe("Options", function() {

      describe("type", async function() {

        it("should behave as contiuous rotation servo when type is \"continuous\"", async function() {
          const servo = await new Servo({
            pin: 12,
            io: PWM
          }, {
            type: "continuous"
          });

          servo.cw();
          assert.equal(servo.position, 180);

          servo.stop();
          assert.equal(servo.position, 90);
        });

      });

      describe("deadband", async function() {

        it("should move to the middle of deadband on stop", async function() {

          const servo = await new Servo({
            pin: 12,
            io: PWM
          }, {
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

    });

  });

  describe("Methods", function() {

    describe("cw", function() {

      it("should move a CR servo forward", async function() {

        const servo = await new Servo({
          pin: 12,
          io: PWM
        }, {
          type: "continuous"
        });

        servo.cw();
        assert.equal(servo.position, 180);

      });

      it("should move a CR servo forward at half speed", async function() {

        const servo = await new Servo({
          pin: 12,
          io: PWM
        }, {
          type: "continuous"
        });

        servo.cw(0.5);
        assert.equal(servo.position, 135);

      });

    });

    describe("ccw", function() {

      it("should move a CR servo backward", async function() {

        const servo = await new Servo({
          pin: 12,
          io: PWM
        }, {
          type: "continuous"
        });

        servo.ccw();
        assert.equal(servo.position, 0);

      });

      it("should move a CR servo backward at half speed", async function() {

        const servo = await new Servo({
          pin: 12,
          io: PWM
        }, {
          type: "continuous"
        });

        servo.ccw(0.5);
        assert.equal(servo.position, 44);

      });

    });

    describe("stop", function() {

      it("should stop a continuous rotation servo", async function() {

        const servo = await new Servo({
          pin: 12,
          io: PWM
        }, {
          type: "continuous"
        });

        servo.cw();
        assert.equal(servo.position, 180);

        servo.stop();
        assert.equal(servo.position, 90);

      });

    });

  });

});
