import assert from "assert";
import sinon from "sinon";
import { Digital, PWM } from "@dtex/mock-io";
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

  });

});
