import assert from "assert";
import sinon from "sinon";
import { Digital } from "@dtex/mock-io";
import Relay from "j5e/relay";
import { resolveAny } from "dns";

describe("Relay", function() {

  describe("Instantiation", function() {

    it("should return a valid Relay instance", async function() {

      const relay = await new Relay({
        pin: 12,
        io: Digital
      });

      assert.equal(relay instanceof Relay, true);
      assert.equal(relay.type, "NO");

    });

    describe("Options", function() {

      describe("type", async function() {

        it("should return a valid, inverted Relay instance", async function() {

          const relay = await new Relay({
            pin: 12,
            io: Digital
          }, {
            type: "NC"
          });

          assert.equal(relay instanceof Relay, true);
          assert.equal(relay.type, "NC");

        });

      });
    });

  });

  describe("Properties", function() {

    describe("value", function() {

      it("should respond with 0 when Normally Open and open", async function() {

        const relay = await new Relay({
          pin: 12,
          io: Digital
        });

        assert.equal(relay.value, 0);

      });

      it("should respond with 1 when Normally Open and closed", async function() {

        const relay = await new Relay({
          pin: 12,
          io: Digital
        });

        relay.close();
        assert.equal(relay.value, 1);

      });

      it("should respond with 0 when Normally Closed and open", async function() {

        const relay = await new Relay({
          pin: 12,
          io: Digital,
          type: "NC"
        });

        assert.equal(relay.value, 0);

      });

      it("should respond with 1 when Normally Closed and closed", async function() {

        const relay = await new Relay({
          pin: 12,
          io: Digital,
          type: "NC"
        });

        relay.close();
        assert.equal(relay.value, 1);

      });

    });

    describe("isClosed", function() {

      it("should respond with false when Normally Open and open", async function() {

        const relay = await new Relay({
          pin: 12,
          io: Digital
        });

        assert.equal(relay.isClosed, false);

      });

      it("should respond with true when Normally Open and closed", async function() {

        const relay = await new Relay({
          pin: 12,
          io: Digital
        });

        relay.close();
        assert.equal(relay.isClosed, true);

      });

      it("should respond with false when Normally Closed and open", async function() {

        const relay = await new Relay({
          pin: 12,
          io: Digital,
          type: "NC"
        });

        assert.equal(relay.isClosed, false);

      });

      it("should respond with true when Normally Closed and closed", async function() {

        const relay = await new Relay({
          pin: 12,
          io: Digital,
          type: "NC"
        });

        relay.close();
        assert.equal(relay.isClosed, true);

      });

    });

    describe("type", function() {

      it("should respond with \"NO\" when Normally Open", async function() {

        const relay = await new Relay({
          pin: 12,
          io: Digital
        });

        assert.equal(relay.type, "NO");

      });

      it("should respond with \"NC\" when Normally Closed", async function() {

        const relay = await new Relay({
          pin: 12,
          io: Digital
        }, {
          type: "NC"
        });

        assert.equal(relay.type, "NC");

      });

    });

  });

  describe("Methods", function() {

    describe("close", function() {

      it("should write HIGH to IO", async function() {
        const relay = await new Relay({
          pin: 12,
          io: Digital
        });

        const writeSpy = sinon.spy(relay.io, "write");

        relay.close();
        assert.equal(writeSpy.callCount, 1);
        assert.equal(writeSpy.lastCall.args[0], 1);

        writeSpy.restore();

      });

      it("should write LOW to IO when normally closed", async function() {
        const relay = await new Relay({
          pin: 12,
          io: Digital
          }, {
          type: "NC"
        });

        const writeSpy = sinon.spy(relay.io, "write");

        relay.close();
        assert.equal(writeSpy.callCount, 1);
        assert.equal(writeSpy.lastCall.args[0], 0);

        writeSpy.restore();

      });

    });

    describe("open", function() {

      it("should write LOW to IO", async function() {
        const relay = await new Relay({
          pin: 12,
          io: Digital
        });

        const writeSpy = sinon.spy(relay.io, "write");

        relay.open();
        assert.equal(writeSpy.callCount, 1);
        assert.equal(writeSpy.lastCall.args[0], 0);

        writeSpy.restore();

      });

      it("should write HIGH to IO when normally closed", async function() {
        const relay = await new Relay({
          pin: 12,
          io: Digital
        }, {
          type: "NC"
        });

        const writeSpy = sinon.spy(relay.io, "write");

        relay.open();
        assert.equal(writeSpy.callCount, 1);
        assert.equal(writeSpy.lastCall.args[0], 1);

        writeSpy.restore();

      });

    });

    describe("toggle", function() {

      it("should toggle with LOW = open and HIGH = closed", async function() {
        const relay = await new Relay({
          pin: 12,
          io: Digital
        });

        const writeSpy = sinon.spy(relay.io, "write");

        relay.open();
        relay.toggle();
        relay.toggle();
        relay.toggle();
        relay.toggle();
        assert.equal(writeSpy.callCount, 5);
        assert.equal(writeSpy.getCall(0).args[0], 0);
        assert.equal(writeSpy.getCall(1).args[0], 1);
        assert.equal(writeSpy.getCall(2).args[0], 0);
        assert.equal(writeSpy.getCall(3).args[0], 1);
        assert.equal(writeSpy.getCall(4).args[0], 0);

        writeSpy.restore();

      });

      it("should toggle with HIGH = open and LOW = closed when Normally Closed", async function() {
        const relay = await new Relay({
          pin: 12,
          io: Digital
        }, {
          type: "NC"
        });

        const writeSpy = sinon.spy(relay.io, "write");

        relay.open();
        relay.toggle();
        relay.toggle();
        relay.toggle();
        relay.toggle();
        assert.equal(writeSpy.callCount, 5);
        assert.equal(writeSpy.getCall(0).args[0], 1);
        assert.equal(writeSpy.getCall(1).args[0], 0);
        assert.equal(writeSpy.getCall(2).args[0], 1);
        assert.equal(writeSpy.getCall(3).args[0], 0);
        assert.equal(writeSpy.getCall(4).args[0], 1);

        writeSpy.restore();

      });


    });

  });

});
