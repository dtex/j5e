import assert from "assert";
import sinon from "sinon";
import { Analog, Digital, PWM } from "@dtex/mock-io";
import Motor from "j5e/motor";

describe("Motor - Non-Directional", function() {

  describe("Instantiation", function() {

    it("should return a valid non-directional Motor instance when passed a single pin", async function() {
      const motor = await new Motor({
        pwm: {
          pin: 12,
          io: PWM
        }
      });
      assert.equal(motor instanceof Motor, true);
      assert.equal(motor.io.pwm instanceof PWM, true);
      assert.equal(motor.io.dir, null);
      assert.equal(motor.io.cdir, null);
      assert.equal(motor.LOW, 0);
      assert.equal(motor.HIGH, 1023);
    });

    // All tests related to default instantiation

    describe("Options", function() {

      describe("enabled", async function() {

        it("should not be enabled when enabled: false is passed to configuration", async function() {

          const motor = await new Motor({
            pwm: {
              pin: 12,
              io: PWM
            }
          });

          motor.configure({
            enabled: false
          });

          assert.equal(motor.enabled, false);
        });

        it("should not move the motor when enabled: false is passed to configuration", async function() {

          const motor = await new Motor({
            pwm: {
              pin: 12,
              io: PWM
            }
          });

          motor.configure({
            enabled: false
          });

          const writeSpy = sinon.spy(motor.io.pwm, "write");
          motor.speed(0.7);
          assert.equal(writeSpy.callCount, 0);

        });

      });

      describe("threshold", async function() {

        it("should have the correct theshold when a custom threshold is passed", async function() {
          const motor = await new Motor({
            pwm: {
              pin: 12,
              io: PWM
            }
          });

          motor.configure({
            threshold: 0.5
          });

          const writeSpy = sinon.spy(motor.io.pwm, "write");
          motor.speed(0.4);
          assert.equal(writeSpy.callCount, 1);
          assert.equal(writeSpy.getCall(0).args[0], 0);

          motor.speed(0.6);
          assert.equal(writeSpy.callCount, 2);
          assert.equal(writeSpy.getCall(1).args[0], 613);

        });

      });

    });

  });

  describe("Properties", function() {

    describe("isOn", function() {

      it("should respond with the property value", async function() {
        // ...
      });

      // [ all other tests related to someProperty ]

    });

    describe("currentSpeed", function() {

      it("should respond with the property value", async function() {
        // ...
      });

      // [ all other tests related to someProperty ]

    });

    describe("enabled", function() {

      it("should respond with the property value", async function() {
        // ...
      });

      // [ all other tests related to someProperty ]

    });

    // [ All other properties, each with it's own describe ]

  });

  describe("Methods", function() {

    describe("speed", function() {

      it("should set the motor to the requested speed", async function() {
        const motor = await new Motor({
          pwm: {
            pin: 12,
            io: PWM
          }
        });

        const writeSpy = sinon.spy(motor.io.pwm, "write");
        motor.speed(0.7);
        assert.equal(writeSpy.callCount, 1);
        assert.equal(writeSpy.getCall(0).args[0], 716);

      });
    });

    describe("start", function() {

      it("should start the motor at the current speed", async function() {
        const motor = await new Motor({
          pwm: {
            pin: 12,
            io: PWM
          }
        });

        const writeSpy = sinon.spy(motor.io.pwm, "write");
        motor.start(0.7);
        assert.equal(writeSpy.callCount, 1);
        assert.equal(writeSpy.getCall(0).args[0], 716);
      });

    });

    describe("stop", function() {

      it("should stop the motor", async function() {
        const motor = await new Motor({
          pwm: {
            pin: 12,
            io: PWM
          }
        });

        const writeSpy = sinon.spy(motor.io.pwm, "write");
        motor.start(0.7);
        assert.equal(writeSpy.callCount, 1);
        assert.equal(writeSpy.getCall(0).args[0], 716);
        motor.stop();
        assert.equal(writeSpy.callCount, 2);
        assert.equal(writeSpy.getCall(1).args[0], 0);
      });

    });

    describe("brake", function() {

      it("should set the PWM pin to LOW", async function() {
        const motor = await new Motor({
          pwm: {
            pin: 12,
            io: PWM
          }
        });

        const writeSpy = sinon.spy(motor.io.pwm, "write");

        motor.start(0.7);
        assert.equal(writeSpy.callCount, 1);
        assert.equal(writeSpy.getCall(0).args[0], 716);

        motor.brake();
        assert.equal(writeSpy.callCount, 2);
        assert.equal(writeSpy.getCall(1).args[0], 0);
      });

    });

    describe("resume", function() {

      it("should set pwm high", async function() {
        const motor = await new Motor({
          pwm: {
            pin: 12,
            io: PWM
          }
        });

        const writeSpy = sinon.spy(motor.io.pwm, "write");

        motor.forward();
        motor.stop();
        motor.resume();

        assert.equal(writeSpy.callCount, 3);
        assert.equal(writeSpy.getCall(0).args[0], 1023);
        assert.equal(writeSpy.getCall(1).args[0], 0);
        assert.equal(writeSpy.getCall(2).args[0], 1023);
      });

      // [ all other tests related to someMethod ]

    });

    describe("forward", function() {

      it("should set pwm high", async function() {
        const motor = await new Motor({
          pwm: {
            pin: 12,
            io: PWM
          }
        });

        const writeSpy = sinon.spy(motor.io.pwm, "write");

        motor.forward();
        assert.equal(writeSpy.callCount, 1);
        assert.equal(writeSpy.getCall(0).args[0], 1023);
      });

    });

    describe("fwd", function() {

      it("should do the right thing", async function() {
        // ...
      });

      // [ all other tests related to someMethod ]

    });

  });

  describe("Events", function() {

    describe("start", function() {

      it("should emit the event at the appropriate time", async function() {
        // ...
      });

      // [ all other tests related to someEvent ]

    });

    describe("stop", function() {

      it("should emit the event at the appropriate time", async function() {
        // ...
      });

      // [ all other tests related to someEvent ]

    });

    describe("brake", function() {

      it("should emit the event at the appropriate time", async function() {
        // ...
      });

      // [ all other tests related to someEvent ]

    });

    describe("release", function() {

      it("should emit the event at the appropriate time", async function() {
        // ...
      });

      // [ all other tests related to someEvent ]

    });

    // [ All other events, each with it's own describe ]

  });

});
