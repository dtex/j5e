import assert from "assert";
import sinon from "sinon";
import { Digital, PWM, Serial } from "@dtex/mock-io";
import GPS from "j5e/gps";

describe("GPS", function() {

  describe("Instantiation", function() {

    it("should return a valid GPS instance when passed an options object with pins as properties", async function() {

      const gps = await new GPS({
        transmit: 17,
        receive: 16,
        io: Serial
      });

      assert.strictEqual(gps instanceof GPS, true);
      assert.strictEqual(gps.io.transmit, 17);
      assert.strictEqual(gps.io.receive, 16);

    });

    it("should return a valid GPS instance when passed an options object with pins array", async function() {

      const gps = await new GPS({
        pins: [17, 16],
        io: Serial
      });

      assert.strictEqual(gps instanceof GPS, true);
      assert.strictEqual(gps.io.transmit, 17);
      assert.strictEqual(gps.io.receive, 16);

    });

    describe("Options", function() {

      describe("baud", async function() {

        it("should be configured appropriately for the option", async function() {

          const gps = await new GPS({
            pins: [17, 16],
            io: Serial,
            baud: 19200
          });

          assert.strictEqual(gps instanceof GPS, true);
          assert.strictEqual(gps.io.baud, 19200);

        });

      });
    });

  });

  describe("Properties", function() {

    describe("latitude", function() {

      it("should respond with the correct property value", async function() {
        const gps = await new GPS({
          pins: [17, 16],
          io: Serial
        });

        assert.strictEqual(gps.latitude, 0);
      });

    });

    describe("longitude", function() {

      it("should respond with the correct property value", async function() {
        const gps = await new GPS({
          pins: [17, 16],
          io: Serial
        });

        assert.strictEqual(gps.longitude, 0);
      });

    });

    describe("altitude", function() {

      it("should respond with the correct property value", async function() {
        const gps = await new GPS({
          pins: [17, 16],
          io: Serial
        });

        assert.strictEqual(gps.altitude, 0);
      });

    });

    describe("sat", function() {

      it("should respond with the correct property value", async function() {
        const gps = await new GPS({
          pins: [17, 16],
          io: Serial
        });

        assert.deepStrictEqual(gps.sat, {});
      });

    });

    describe("speed", function() {

      it("should respond with the correct property value", async function() {
        const gps = await new GPS({
          pins: [17, 16],
          io: Serial
        });

        assert.strictEqual(gps.speed, 0);
      });

    });

    describe("course", function() {

      it("should respond with the correct property value", async function() {
        const gps = await new GPS({
          pins: [17, 16],
          io: Serial
        });

        assert.strictEqual(gps.course, 0);
      });

    });

    describe("time", function() {

      it("should respond with the correct property value", async function() {
        const gps = await new GPS({
          pins: [17, 16],
          io: Serial
        });

        assert.strictEqual(gps.time, null);
      });

    });

  });

  describe("Methods", function() {

    describe("config", function() {

      it("should throw when passed a frequency", async function() {
        // This setter is not defined in the base class
        const gps = await new GPS({
          pins: [17, 16],
          io: Serial
        });

        assert.throws(function() {
          gps.config({
            frequency: 2
          });
        });

      });

      it("should format values to desired precision", async function() {
        // This setter is not defined in the base class
        const gps = await new GPS({
          pins: [17, 16],
          io: Serial
        });

        const listener = sinon.stub();

        gps.on("change", function(data) {
          listener(data);
        });

        assert.strictEqual(listener.callCount, 0);

        gps.io.testReceive("$GPGGA,181908.00,3404.7041778,N,07044.3966270,W,4,13,1.00,495.144,M,29.200,M,0.10,0000*5F\r\n");
        assert.strictEqual(listener.callCount, 1);
        assert.deepStrictEqual(listener.getCall(0).args[0], {
          "altitude": 495.144000,
          "latitude": 34.078403,
          "longitude": -70.739944,
        });

        gps.config({
          fixed: 2
        });

        gps.io.testReceive("$GPGGA,181908.00,3404.7041778,N,07044.3966270,W,4,13,1.00,495.144,M,29.200,M,0.10,0000*5F\r\n");
        assert.strictEqual(listener.callCount, 2);
        assert.deepStrictEqual(listener.getCall(1).args[0], {
          "altitude": 495.14,
          "latitude": 34.08,
          "longitude": -70.74,
        });

      });

    });

    describe("sendCommand", function() {
      it("should enqueue the passed command", async function() {
        const gps = await new GPS({
          pins: [17, 16],
          io: Serial
        });

        gps.sendCommand(`$PMTK220,${String(1000 / 2)}`);

        let expected = new Uint8Array([
          36, 80, 77, 84, 75, 50,
          50, 48, 44, 53, 48, 48,
          50, 66
        ]);

        assert.notDeepStrictEqual(gps.io.TXqueue, expected);
      });
    });

  });

  describe("Events", function() {

    describe("sentence", function() {

      it("should emit sentence anytime an NMEA sentence is received", async function() {
        const gps = await new GPS({
          pins: [17, 16],
          io: Serial
        });

        const listener = sinon.stub();

        gps.on("sentence", function(data) {
          listener(data);
        });

        assert.strictEqual(listener.callCount, 0);
        gps.io.testReceive("$GPGGA,181908.00,3404.7041778,N,07044.3966270,W,4,13,1.00,495.144,M,29.200,M,0.10,0000*5F\r\n");
        assert.strictEqual(listener.callCount, 1);
        gps.io.testReceive("$GPGGA,181908.00,3404.7041778,N,07044.3966270");
        assert.strictEqual(listener.callCount, 1);
        gps.io.testReceive(",W,4,13,1.00,495.144,M,29.200,M,0.10,0000*5F\r\nremainder");
        assert.strictEqual(listener.callCount, 2);

      });

    });

    describe("operations", function() {

      it("should emit operations anytime an NMEA operations sentence is received", async function() {
        const gps = await new GPS({
          pins: [17, 16],
          io: Serial
        });

        const listener = sinon.stub();

        gps.on("operations", function(data) {
          listener();
        });

        assert.strictEqual(listener.callCount, 0);
        gps.io.testReceive("$GPGSA,A,3,19,28,14,18,27,22,31,39,,,,,1.7,1.0,1.3*34\r\n");
        assert.strictEqual(listener.callCount, 1);
        assert.deepStrictEqual(gps.sat, {
          satellites: ["19", "28", "14", "18", "27", "22", "31", "39", "", "", "", ""],
          pdop: 1.7,
          hdop: 1,
          vdop: 1.3
        });

      });

    });

    describe("acknowledge", function() {

      it("should emit acknowledge anytime an NMEA acknowledge sentence is received", async function() {
        const gps = await new GPS({
          pins: [17, 16],
          io: Serial
        });

        const listener = sinon.stub();

        gps.on("acknowledge", function(sentence) {
          listener();
          assert.strictEqual(sentence, "$PGACK,001,-1*73");
        });

        assert.strictEqual(listener.callCount, 0);
        gps.io.testReceive("$PGACK,001,-1*73\r\n");
        assert.strictEqual(listener.callCount, 1);

      });

    });

    describe("unknown", function() {

      it("should emit unknown anytime an unknown NMEA sentence is received", async function() {
        const gps = await new GPS({
          pins: [17, 16],
          io: Serial
        });

        const listener = sinon.stub();

        gps.on("unknown", function(sentence) {
          listener();
          assert.strictEqual(sentence, "$FOOBAR,001,-1*3A");
        });

        assert.strictEqual(listener.callCount, 0);
        gps.io.testReceive("$FOOBAR,001,-1*3A\r\n");
        assert.strictEqual(listener.callCount, 1);

      });

    });

    describe("data", function() {

      it("should emit data anytime serial data is received, regardless of wether it's a valid NMEA sentenct", async function() {
        const gps = await new GPS({
          pins: [17, 16],
          io: Serial
        });

        const listener = sinon.stub();

        gps.on("data", function(data) {
          listener(data);
        });

        assert.strictEqual(listener.callCount, 0);

        gps.io.testReceive("$GPGSA,A,3,19,28,14,18,27,22,31,39,,,,,1.7,1.0,1.3*34\r\n");
        assert.strictEqual(listener.callCount, 1);
        assert.deepStrictEqual(listener.getCall(0).args[0], {
          "altitude": 0,
          "course": 0,
          "latitude": 0,
          "longitude": 0,
          "sat": {
            "hdop": 1,
            "pdop": 1.7,
            "satellites": ["19", "28", "14", "18", "27", "22", "31", "39", "", "", "", ""],
            "vdop": 1.3
          },
          "speed": 0,
          "time": null
        });

        let now = new Date();
        gps.io.testReceive("$GPGGA,181908.00,3404.7041778,N,07044.3966270,W,4,13,1.00,495.144,M,29.200,M,0.10,0000*5F\r\n");
        assert.strictEqual(listener.callCount, 2);
        assert.deepStrictEqual(listener.getCall(1).args[0], {
          "altitude": 495.144000,
          "course": 0,
          "latitude": 34.078403,
          "longitude": -70.739944,
          "sat": {
            "hdop": 1,
            "pdop": 1.7,
            "satellites": ["19", "28", "14", "18", "27", "22", "31", "39", "", "", "", ""],
            "vdop": 1.3
          },
          "speed": 0,
          "time": new Date(now.getUTCFullYear(), now.getMonth(), now.getDay(), 18, 19, 8)
        });

        gps.io.testReceive("$FOOBAR,001,-1*3A\r\n");
        assert.strictEqual(listener.callCount, 3);
        assert.deepStrictEqual(listener.getCall(1).args[0], {
          "altitude": 495.144000,
          "course": 0,
          "latitude": 34.078403,
          "longitude": -70.739944,
          "sat": {
            "hdop": 1,
            "pdop": 1.7,
            "satellites": ["19", "28", "14", "18", "27", "22", "31", "39", "", "", "", ""],
            "vdop": 1.3
          },
          "speed": 0,
          "time": new Date(now.getUTCFullYear(), now.getMonth(), now.getDay(), 18, 19, 8)
        });

      });

    });

    describe("navigation", function() {

      it("should emit navigation anytime an course or speed change", async function() {
        const gps = await new GPS({
          pins: [17, 16],
          io: Serial
        });

        const listener = sinon.stub();

        gps.on("navigation", function(data) {
          listener(data);
        });

        assert.strictEqual(listener.callCount, 0);

        let now = new Date();
        gps.io.testReceive("$GPVTG,054.7,T,034.4,M,005.5,N,010.2,K*48\r\n");
        assert.strictEqual(listener.callCount, 1);
        assert.deepStrictEqual(listener.getCall(0).args[0], {
          "course": 54.7,
          "speed": 2.829442
        });

        gps.io.testReceive("$GPGGA,181908.00,3404.7041778,N,07044.3966270,W,4,13,1.00,495.144,M,29.200,M,0.10,0000*5F\r\n");
        assert.strictEqual(listener.callCount, 1);

        gps.io.testReceive("$GPVTG,054.7,T,034.4,M,005.5,N,010.2,K*48\r\n");
        assert.strictEqual(listener.callCount, 1);

        gps.io.testReceive("$GPVTG,057.4,T,034.4,M,005.5,N,010.2,K*48\r\n");
        assert.strictEqual(listener.callCount, 2);
        assert.deepStrictEqual(listener.getCall(1).args[0], {
          "course": 57.4,
          "speed": 2.829442
        });

        gps.io.testReceive("$GPVTG,057.4,T,034.4,M,007.5,N,010.2,K*4A\r\n");
        assert.strictEqual(listener.callCount, 3);
        assert.deepStrictEqual(listener.getCall(2).args[0], {
          "course": 57.4,
          "speed": 3.85833
        });

      });

    });

    describe("change", function() {

      it("should emit change anytime latitude, longitude, or altitude change", async function() {
        const gps = await new GPS({
          pins: [17, 16],
          io: Serial
        });

        const listener = sinon.stub();

        gps.on("change", function(data) {
          listener(data);
        });

        assert.strictEqual(listener.callCount, 0);

        let now = new Date();
        gps.io.testReceive("$GPVTG,054.7,T,034.4,M,005.5,N,010.2,K*48\r\n");
        assert.strictEqual(listener.callCount, 0);

        gps.io.testReceive("$GPGGA,181908.00,3404.7041778,N,07044.3966270,W,4,13,1.00,495.144,M,29.200,M,0.10,0000*5F\r\n");
        assert.strictEqual(listener.callCount, 1);
        assert.deepStrictEqual(listener.getCall(0).args[0], {
          "altitude": 495.144000,
          "latitude": 34.078403,
          "longitude": -70.739944
        });
      });

    });

  });

});
