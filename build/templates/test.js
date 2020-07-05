import assert from "assert";
import sinon from "sinon";
import { Digital, PWM } from "@dtex/mock-io";
import ClassName from "j5e/classname";

describe("ClassName", function() {

  describe("Instantiation", function() {

    // All tests related to default instantiation

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

  describe("Properties", function() {

    describe("someProperty", function() {

      it("should respong with the property value", async function() {
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
