import assert from "assert";
import sinon from "sinon";
import { Digital, PWM, I2C } from "@dtex/mock-io";
import PCA9685 from "j5e/pca9685";
import Expander from "j5e/expander";

describe("PCA9685", function() {

  describe("Instantiation", function() {

    it("should return a valid directional PCA9685 instance when passed two pins", async function() {
      const expander = await new PCA9685({
        pins: [21, 22],
        io: I2C
      });
      assert.strictEqual(expander instanceof PCA9685, true);
      assert.strictEqual(expander instanceof Expander, true);
    });

    it("should return a valid directional PCA9685 instance when passed a pins object", async function() {
      const expander = await new PCA9685({
        pins: {
          data: 21,
          clock: 22
        },
        io: I2C
      });
      assert.strictEqual(expander instanceof PCA9685, true);
      assert.strictEqual(expander instanceof Expander, true);
    });

    describe("Options", function() {

      describe("someOptionProperty", async function() {

        it("should be configured appropriately for the option", async function() {
          // ...
        });

        // [ All other tests related to this option ]

      });
    });

    // [ All other options, each with it's own describe ]

  });

  describe("IO", function() {

    describe("Digital", function() {

      it("should return a valid PCA9685 Digital pin", async function() {
        const expander = await new PCA9685({
          pins: {
            data: 21,
            clock: 22
          },
          io: I2C
        });
        const pin = new expander.Digital({
          pin: 0,
          mode: expander.Digital.Output
        });

        assert.strictEqual(pin instanceof expander.Digital, true);
      });

      // [ all other tests related to someProperty ]

    });

    // [ All other properties, each with it's own describe ]

  });

  describe("Properties", function() {

    describe("someProperty", function() {

      it("should respond with the property value", async function() {
        // ...
      });

      // [ all other tests related to someProperty ]

    });

    // [ All other properties, each with it's own describe ]

  });

  describe("Methods", function() {

    describe("someMethod", function() {

      it("should do the right thing", async function() {
        // ...
      });

      // [ all other tests related to someMethod ]

    });

    // [ All other methods, each with it's own describe ]

  });

  describe("Events", function() {

    describe("someEvent", function() {

      it("should emit the event at the appropriate time", async function() {
        // ...
      });

      // [ all other tests related to someEvent ]

    });

    // [ All other events, each with it's own describe ]

  });

});
