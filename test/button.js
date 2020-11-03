import assert from "assert";
import sinon from "sinon";
import chai from "chai";

import { Digital } from "@dtex/mock-io";
import Button from "j5e/button";

describe("Button", function() {

  describe("Instantiation", function() {

    it("should return a valid Button instance when passed an io class and pin number", async function() {
      const button = await new Button({
        pin: 13,
        io: Digital
      });
      assert.equal(button instanceof Button, true);
      assert.equal(button.io instanceof Digital, true);
    });

    describe("Options", function() {

      describe("invert", function() {

        it("should invert state when the invert option is true", async function() {
          const button = await new Button({
            pin: 13,
            io: Digital
          },
          {
            invert: true
          });

          button.io.write(0);
          assert.equal(button.isClosed, true);
          assert.equal(button.isOpen, false);

          button.io.write(1);
          assert.equal(button.isClosed, false);
          assert.equal(button.isOpen, true);

        });
      });

      describe("isPullup", function() {

        it("should invert state when the isPullup option is true", async function() {
          const button = await new Button({
            pin: 13,
            io: Digital
          },
          {
            isPullup: true
          });

          button.io.write(0);
          assert.equal(button.isClosed, true);
          assert.equal(button.isOpen, false);

          button.io.write(1);
          assert.equal(button.isClosed, false);
          assert.equal(button.isOpen, true);

        });

        it("should not invert state when the isPullup and invert options are true", async function() {
          const button = await new Button({
            pin: 13,
            io: Digital
          },
          {
            isPullup: true,
            invert: true
          });

          button.io.write(1);
          assert.equal(button.isClosed, true);
          assert.equal(button.isOpen, false);

          button.io.write(0);
          assert.equal(button.isClosed, false);
          assert.equal(button.isOpen, true);

        });

      });

      describe("isPulldown", function() {

        it("should not invert state when the isPulldown option is true", async function() {
          const button = await new Button({
            pin: 13,
            io: Digital
          },
          {
            isPulldown: true
          });

          button.io.write(1);
          assert.equal(button.isClosed, true);
          assert.equal(button.isOpen, false);

          button.io.write(0);
          assert.equal(button.isClosed, false);
          assert.equal(button.isOpen, true);

        });
      });

      describe("holdtime", function() {

        it("should set the holdtime state when passed a value in options", async function() {
          const button = await new Button({
            pin: 13,
            io: Digital
          },
          {
            holdtime: 2000
          });

          assert.equal(button.holdtime, 2000);

        });
      });

      describe("debounce", function() {

        const clock = sinon.useFakeTimers();
        const closeListener = sinon.spy();

        it("should delay event emissions by debounced value that is passed", async function() {
          const button = await new Button({
            pin: 13,
            io: Digital
          },
          {
            debounce: 20
          });

          button.on("close", closeListener);

          button.io.write(0);
          clock.tick(1);

          // This should not emit (debounced)
          button.io.write(1);
          clock.tick(1);
          assert.equal(closeListener.callCount, 0);

          // This should not emit (debounced)
          button.io.write(0);
          button.io.write(1);
          clock.tick(15);
          assert.equal(closeListener.callCount, 0);

          // This should emit (21 ms have elapsed since last event)
          button.io.write(0);
          button.io.write(1);
          clock.tick(25);
          assert.equal(closeListener.callCount, 1);

          clock.restore();

        });
      });

    });
  });

  describe("Properties", function() {

    describe("isClosed", function() {
      it("should report isClosed is true when pin is high", async function() {
        const button = await new Button({
          pin: 13,
          io: Digital
        });

        button.io.write(1);
        assert.equal(button.isClosed, true);
        assert.equal(button.isOpen, false);
      });

      it("should report isClosed is false when pin is low", async function() {

        const button = await new Button({
          pin: 13,
          io: Digital
        });

        button.io.write(0);
        assert.equal(button.isClosed, false);
        assert.equal(button.isOpen, true);
      });

    });

    describe("isOpen", function() {
      it("should report isOpen is false when pin is high", async function() {
        const button = await new Button({
          pin: 13,
          io: Digital
        });

        button.io.write(1);
        assert.equal(button.isClosed, true);
        assert.equal(button.isOpen, false);
      });

      it("should report isOpen is true when pin is low", async function() {

        const button = await new Button({
          pin: 13,
          io: Digital
        });

        button.io.write(0);
        assert.equal(button.isClosed, false);
        assert.equal(button.isOpen, true);
      });
    });

    describe("holdtime", function() {

      it("should be settable and getable", async function() {
        const button = await new Button({
          pin: 13,
          io: Digital
        });

        assert.equal(button.holdtime, 500);
        button.holdtime = 1000;
        assert.equal(button.holdtime, 1000);

      });

      it("should emit hold event after 500ms", async function() {

        const clock = sinon.useFakeTimers();
        const holdSpy = sinon.spy();
        const button = await new Button({
          pin: 13,
          io: Digital
        });

        button.on("hold", holdSpy);

        clock.tick(1);
        button.io.write(1);
        assert.equal(holdSpy.callCount, 0);
        clock.tick(499);
        assert.equal(holdSpy.callCount, 0);
        clock.tick(10);
        assert.equal(holdSpy.callCount, 1);

        clock.restore();

      });

      it("should emit hold event after 2000ms", async function() {

        const clock = sinon.useFakeTimers();
        const holdSpy = sinon.spy();
        const button = await new Button({
          pin: 13,
          io: Digital
        },
        {
          holdtime: 2000
        });

        button.on("hold", holdSpy);

        clock.tick(1);
        button.io.write(1);
        assert.equal(holdSpy.callCount, 0);
        clock.tick(1999);
        assert.equal(holdSpy.callCount, 0);
        clock.tick(10);
        assert.equal(holdSpy.callCount, 1);

        clock.restore();

      });



    });

    describe("downValue", function() {

      it("should have the correct default value", async function() {

        const button = await new Button({
          pin: 13,
          io: Digital
        });

        assert.equal(button.downValue, 1);

      });

      it("should have the correct value when invert is true", async function() {

        const button = await new Button({
          pin: 13,
          io: Digital
        }, {
          invert: true
        });

        assert.equal(button.downValue, 0);

      });

      it("should have the correct value when isPullup is true", async function() {

        const button = await new Button({
          pin: 13,
          io: Digital
        }, {
          isPullup: true
        });

        assert.equal(button.downValue, 0);

      });

      it("should have the correct value when isPullup and invert are true", async function() {

        const button = await new Button({
          pin: 13,
          io: Digital
        }, {
          isPullup: true,
          invert: true
        });

        assert.equal(button.downValue, 1);

      });

      it("should not be settable", async function() {
        const button = await new Button({
          pin: 13,
          io: Digital
        });

        chai.expect(() => {
          button.downValue = 1;
        }).to.throw(TypeError);
      });

    });

    describe("upValue", function() {

      it("should have the correct default value", async function() {

        const button = await new Button({
          pin: 13,
          io: Digital
        });

        assert.equal(button.upValue, 0);

      });

      it("should have the correct value when invert is true", async function() {

        const button = await new Button({
          pin: 13,
          io: Digital
        }, {
          invert: true
        });

        assert.equal(button.upValue, 1);

      });

      it("should have the correct value when isPullup is true", async function() {

        const button = await new Button({
          pin: 13,
          io: Digital
        }, {
          isPullup: true
        });

        assert.equal(button.upValue, 1);

      });

      it("should have the correct value when isPullup and invert are true", async function() {

        const button = await new Button({
          pin: 13,
          io: Digital
        }, {
          isPullup: true,
          invert: true
        });

        assert.equal(button.upValue, 0);

      });

      it("should not be settable", async function() {
        const button = await new Button({
          pin: 13,
          io: Digital
        });

        chai.expect(() => {
          button.upValue = 1;
        }).to.throw(TypeError);
      });

    });

  });

  describe("Events", function() {

    describe("close", function() {

      it("should fire \"close\" when a pin goes high", async function() {
        const clock = sinon.useFakeTimers();
        const button = await new Button({
          pin: 13,
          io: Digital
        });

        const closeListener = sinon.stub();

        button.on("close", function() {
          closeListener();
        });

        button.io.write(1);
        clock.tick(10);
        assert.equal(closeListener.callCount, 1);

        button.io.write(0);
        clock.tick(1);

        // This should not emit (debounced)
        button.io.write(1);
        clock.tick(1);
        assert.equal(closeListener.callCount, 1);

        button.io.write(0);
        clock.tick(10);

        button.io.write(1);
        clock.tick(10);
        assert.equal(closeListener.callCount, 2);

        button.io.write(0);
        clock.tick(10);

        button.io.write(1);
        clock.tick(10);

        assert.equal(closeListener.callCount, 3);
        clock.restore();
      });
    });

    describe("open", function() {

      it("should fire \"open\" when a pin goes low", async function() {
        const clock = sinon.useFakeTimers();
        const button = await new Button({
          pin: 13,
          io: Digital
        });

        const openListener = sinon.stub();

        button.on("open", function() {
          openListener();
        });

        button.io.write(1);
        clock.tick(10);

        button.io.write(0);
        clock.tick(10);
        assert.equal(openListener.callCount, 1);

        button.io.write(1);
        clock.tick(1);

        // This should not emit (debounced)
        button.io.write(0);
        clock.tick(1);
        assert.equal(openListener.callCount, 1);

        button.io.write(1);
        clock.tick(10);

        button.io.write(0);
        clock.tick(10);
        assert.equal(openListener.callCount, 2);

        button.io.write(1);
        clock.tick(10);

        button.io.write(0);
        clock.tick(10);
        assert.equal(openListener.callCount, 3);
        clock.restore();
      });
    });
  });

});
