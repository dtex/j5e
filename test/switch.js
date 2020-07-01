import assert from "assert";
import sinon from "sinon";

import { Digital } from "@dtex/mock-io";
import Switch from "j5e/switch";

describe("Switch", function() {

  describe("Instantiation", function() {

    it("should return a valid Switch instance when passed an io class and pin number", async function() {
      const myswitch = await new Switch({
        pin: 13,
        io: Digital
      });
      assert.equal(myswitch instanceof Switch, true);
      assert.equal(myswitch.io instanceof Digital, true);
    });
  });

  describe("Properties", function() {

    describe("isClosed", function() {
      it("should report isClosed is true when pin is high", async function() {
        const myswitch = await new Switch({
          pin: 13,
          io: Digital
        });

        myswitch.io.write(1);
        assert.equal(myswitch.isClosed, true);
        assert.equal(myswitch.isOpen, false);
      });

      it("should report isClosed is false when pin is low", async function() {

        const myswitch = await new Switch({
          pin: 13,
          io: Digital
        });

        myswitch.io.write(0);
        assert.equal(myswitch.isClosed, false);
        assert.equal(myswitch.isOpen, true);
      });
    });

    describe("isOpen", function() {
      it("should report isOpen is false when pin is high", async function() {
        const myswitch = await new Switch({
          pin: 13,
          io: Digital
        });

        myswitch.io.write(1);
        assert.equal(myswitch.isClosed, true);
        assert.equal(myswitch.isOpen, false);
      });

      it("should report isOpen is true when pin is low", async function() {

        const myswitch = await new Switch({
          pin: 13,
          io: Digital
        });

        myswitch.io.write(0);
        assert.equal(myswitch.isClosed, false);
        assert.equal(myswitch.isOpen, true);
      });
    });
  });

  describe("Events", function() {

    describe("close", function() {

      it("should fire \"close\" when a pin goes high", async function() {
        const myswitch = await new Switch({
          pin: 13,
          io: Digital
        });

        const closeListener = sinon.stub();

        myswitch.on("close", closeListener);

        myswitch.io.write(1);
        myswitch.io.write(0);
        myswitch.io.write(1);
        myswitch.io.write(0);
        myswitch.io.write(1);

        assert.equal(closeListener.callCount, 3);
      });
    });

    describe("open", function() {

      it("should fire \"open\" when a pin goes low", async function() {
        const myswitch = await new Switch({
          pin: 13,
          io: Digital
        });

        const openListener = sinon.stub();

        myswitch.on("open", openListener);

        myswitch.io.write(1);
        myswitch.io.write(0);
        myswitch.io.write(1);
        myswitch.io.write(0);
        myswitch.io.write(1);
        myswitch.io.write(0);

        assert.equal(openListener.callCount, 3);
      });
    });

  });

});
