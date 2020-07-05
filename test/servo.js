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

      // pwmRange
      // deadband
      // Range
      // deviceRange
      // startAt
      // offset
      // invert
      // center

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
    });

    // [ All other options, each with it's own describe ]

  });

  describe("Properties", function() {

    // history
    // last
    // position

    describe("someProperty", function() {

      it("should respond with the property value", async function() {
        // ...
      });

      // [ all other tests related to someProperty ]

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
    describe("someMethod", function() {

      it("should do the right thing", async function() {
        // ...
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
