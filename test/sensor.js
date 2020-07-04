import assert from "assert";
import sinon from "sinon";
import { Analog } from "@dtex/mock-io";
import Sensor from "j5e/sensor";
import { Emitter } from "j5e/event";

describe("Sensor", function() {

  describe("Instantiation", async function() {

    it("should return a valid Sensor instance when passed an options object", async function() {
      let sensor = await new Sensor({
        pin: 17,
        io: Analog
      });
      assert.equal(sensor instanceof Sensor, true);
      assert.equal(sensor instanceof Emitter, true);
      assert.equal(sensor.io instanceof Analog, true);
      sensor.disable();
    });

    it("should return the correct default property values", async function() {
      let sensor = await new Sensor({
        pin: 17,
        io: Analog
      });
      assert.equal(sensor.interval, 100);
      assert.equal(sensor.smoothing, 10);
      assert.equal(sensor.raw, null);
      assert.equal(sensor.value, null);
      assert.equal(sensor.median, null);
      assert.equal(sensor.last, null);
      assert.equal(sensor.threshold, 1);
      assert.equal(sensor.limit, null);
      assert.equal(sensor.resolution, 1023);
      sensor.disable();
    });

    it("should make 10 readings per second", async function() {
      const clock = sinon.useFakeTimers();
      let sensor = await new Sensor({
        pin: 17,
        io: Analog
      });
      const readSpy = sinon.spy(sensor.io, "read");
      clock.tick(1050);
      assert.equal(readSpy.callCount, 10);
      clock.restore();
      sensor.disable();
    });

    describe("Options", function() {
      describe("enabled", function() {

        it("should return the correct default property values", async function() {

          let sensor = await new Sensor({
            pin: 17,
            io: Analog,
            enabled: false
          });
          assert.equal(sensor.interval, null);
          assert.equal(sensor.smoothing, 10);
          assert.equal(sensor.raw, null);
          assert.equal(sensor.value, null);
          assert.equal(sensor.median, null);
          assert.equal(sensor.last, null);
          assert.equal(sensor.threshold, 1);
          assert.equal(sensor.limit, null);
          assert.equal(sensor.resolution, 1023);

          sensor.disable();

        });

        it("should not start making readings", async function() {

          const clock = sinon.useFakeTimers();
          let sensor = await new Sensor({
            pin: 17,
            io: Analog,
            enabled: false
          });

          const writeSpy = sinon.spy(sensor.io, "read");

          clock.tick(1050);
          assert.equal(writeSpy.callCount, 0);
          clock.restore();

          sensor.disable();

        });

      });

      describe("interval", function() {

        it("should return the correct default property values", async function() {

          let sensor = await new Sensor({
            pin: 17,
            io: Analog,
            interval: 50
          });
          assert.equal(sensor.interval, 50);
          assert.equal(sensor.smoothing, 10);
          assert.equal(sensor.raw, null);
          assert.equal(sensor.value, null);
          assert.equal(sensor.median, null);
          assert.equal(sensor.last, null);
          assert.equal(sensor.threshold, 1);
          assert.equal(sensor.limit, null);
          assert.equal(sensor.resolution, 1023);

          sensor.disable();

        });

        it("should make 20 readings per second", async function() {

          const clock = sinon.useFakeTimers();
          let sensor = await new Sensor({
            pin: 17,
            io: Analog,
            interval: 50
          });

          const writeSpy = sinon.spy(sensor.io, "read");

          clock.tick(1005);
          assert.equal(writeSpy.callCount, 20);
          clock.restore();

          sensor.disable();

        });

      });

      describe("range", function() {

        it("should return the correct default property values", async function() {

          let sensor = await new Sensor({
            pin: 17,
            io: Analog,
            range: [256, 758]
          });
          assert.equal(sensor.interval, 100);
          assert.equal(sensor.smoothing, 10);
          assert.equal(sensor.raw, null);
          assert.equal(sensor.value, null);
          assert.equal(sensor.median, null);
          assert.equal(sensor.last, null);
          assert.equal(sensor.threshold, 1);
          assert.equal(sensor.limit, null);
          assert.equal(sensor.resolution, 1023);

          sensor.disable();

        });

        it("should map value properly", async function() {

          let sensor = await new Sensor({
            pin: 17,
            io: Analog,
            range: [256, 768]
          });

          sensor.io.value = 0;
          assert.equal(sensor.raw, null);
          assert.equal(sensor.value, null);
          sensor.read();
          assert.equal(sensor.raw, 0);
          assert.equal(sensor.value, 0);
          sensor.io.value = 127;
          sensor.read();
          assert.equal(sensor.raw, 127);
          assert.equal(sensor.value, 0);
          sensor.io.value = 256;
          sensor.read();
          assert.equal(sensor.raw, 256);
          assert.equal(sensor.value, 0);
          sensor.io.value = 512;
          sensor.read();
          assert.equal(sensor.raw, 512);
          assert.equal(sensor.value, 511.5);
          sensor.io.value = 768;
          sensor.read();
          assert.equal(sensor.raw, 768);
          assert.equal(sensor.value, 1023);
          sensor.io.value = 1023;
          sensor.read();
          assert.equal(sensor.raw, 1023);
          assert.equal(sensor.value, 1023);

          sensor.disable();

        });

      });

      describe("limit", function() {

        it("should return the correct default property values", async function() {

          let sensor = await new Sensor({
            pin: 17,
            io: Analog,
            limit: [256, 758]
          });

          assert.equal(sensor.interval, 100);
          assert.equal(sensor.smoothing, 10);
          assert.equal(sensor.raw, null);
          assert.equal(sensor.value, null);
          assert.equal(sensor.median, null);
          assert.equal(sensor.last, null);
          assert.equal(sensor.threshold, 1);
          assert.equal(sensor.limit[0], 256);
          assert.equal(sensor.limit[1], 758);
          assert.equal(sensor.resolution, 1023);

          sensor.disable();

        });

        it("should emit upper and lower limit events", async function() {

          const clock = sinon.useFakeTimers();
          let sensor = await new Sensor({
            pin: 17,
            io: Analog,
            limit: [256, 768]
          });

          const calls = {
            "lower": 0,
            "upper": 0,
            "limit:lower": 0,
            "limit:upper": 0
          };
          sensor.on("limit", function(data) {
            if (data.boundary === "lower") {
              assert.equal(sensor.raw <= 256, true);
              calls.lower++;
            } else {
              assert.equal(sensor.raw >= 768, true);
              calls.upper++;
            }
          });

          sensor.on("limit:lower", function(data) {
            assert.equal(sensor.raw <= 256, true);
            calls["limit:lower"]++;
          });

          sensor.on("limit:upper", function(data) {
            assert.equal(sensor.raw >= 768, true);
            calls["limit:upper"]++;
          });

          clock.tick(1005);
          sensor.io.value = 127;
          clock.tick(1005);
          sensor.io.value = 256;
          clock.tick(1005);
          sensor.io.value = 512;
          clock.tick(1005);
          sensor.io.value = 768;
          clock.tick(1005);
          sensor.io.value = 895;
          clock.tick(1005);
          sensor.io.value = 1023;
          clock.tick(1005);

          assert.equal(calls.lower, 3);
          assert.equal(calls.upper, 3);
          assert.equal(calls["limit:lower"], 3);
          assert.equal(calls["limit:upper"], 3);

          clock.restore();
          sensor.disable();

        });

      });

      describe("threshold", function() {

        it("should return the correct default property values", async function() {

          let sensor = await new Sensor({
            pin: 17,
            io: Analog,
            threshold: 20
          });

          assert.equal(sensor.interval, 100);
          assert.equal(sensor.smoothing, 10);
          assert.equal(sensor.raw, null);
          assert.equal(sensor.value, null);
          assert.equal(sensor.median, null);
          assert.equal(sensor.last, null);
          assert.equal(sensor.threshold, 20);
          assert.equal(sensor.limit, null);
          assert.equal(sensor.resolution, 1023);

          sensor.disable();

        });

        it("should emit change event when the threshold is exceeded", async function() {


          const clock = sinon.useFakeTimers();
          let sensor = await new Sensor({
            pin: 17,
            io: Analog,
            threshold: 20
          });

          let last = 0;
          let count = 0;
          sensor.on("change", function(data) {
            assert(Math.abs(data - last) >= 20, true);
            last = data;
            count++;
          });

          clock.tick(1005);
          sensor.io.value = 10;
          clock.tick(1005);
          clock.tick(1005);
          sensor.io.value = 100;
          sensor.io.value = 20;
          clock.tick(1005);
          sensor.io.value = 110;
          clock.tick(1005);
          sensor.io.value = 900;
          clock.tick(1005);
          sensor.io.value = 919;
          clock.tick(1005);
          sensor.io.value = 920;
          clock.tick(1005);

          assert.equal(count, 4);

          sensor.disable();

        });

      });
    });
  });

  describe("Properties", function() {

    describe("interval", function() {

      it("should return the correct default value", async function() {
        let sensor = await new Sensor({
          pin: 17,
          io: Analog
        });
        assert.equal(sensor.interval, 100);
        sensor.disable();
      });

      it("should run at the correct default frequency", async function() {
        const clock = sinon.useFakeTimers();
        let sensor = await new Sensor({
          pin: 17,
          io: Analog
        });
        const readSpy = sinon.spy(sensor.io, "read");
        clock.tick(1050);
        assert.equal(readSpy.callCount, 10);
        clock.restore();
        sensor.disable();
      });

      it("should return the correct value when passed the interval param", async function() {
        let sensor = await new Sensor({
          pin: 17,
          io: Analog,
          interval: 10
        });
        assert.equal(sensor.interval, 10);
        sensor.disable();
      });

      it("should run at the correct frequency when passed the interval param", async function() {
        const clock = sinon.useFakeTimers();
        let sensor = await new Sensor({
          pin: 17,
          io: Analog,
          interval: 10
        });
        const readSpy = sinon.spy(sensor.io, "read");
        clock.tick(1005);
        assert.equal(readSpy.callCount, 100);
        clock.restore();
        sensor.disable();
      });

      it("should return the correct value when set", async function() {
        let sensor = await new Sensor({
          pin: 17,
          io: Analog,
          interval: 10
        });
        sensor.interval = 20;
        assert.equal(sensor.interval, 20);
        sensor.disable();
      });

      it("should run at the correct frequency when set", async function() {
        const clock = sinon.useFakeTimers();
        let sensor = await new Sensor({
          pin: 17,
          io: Analog,
          interval: 10
        });
        sensor.interval = 20;
        const readSpy = sinon.spy(sensor.io, "read");
        clock.tick(1005);
        assert.equal(readSpy.callCount, 50);
        clock.restore();
        sensor.disable();
      });

    });

    describe("raw", function() {

      it("should return the correct value", async function() {
        let sensor = await new Sensor({
          pin: 17,
          io: Analog
        });
        sensor.io.value = 123;
        sensor.read();
        assert.equal(sensor.raw, 123);
        sensor.disable();
      });

      it("should return the correct value regardless of range", async function() {
        let sensor = await new Sensor({
          pin: 17,
          io: Analog,
          range: [400, 800]
        });
        sensor.io.value = 123;
        sensor.read();
        assert.equal(sensor.raw, 123);
        sensor.disable();
      });

      it("should return the correct value regardless of limit", async function() {
        let sensor = await new Sensor({
          pin: 17,
          io: Analog,
          limit: [400, 800]
        });
        sensor.io.value = 123;
        sensor.read();
        assert.equal(sensor.raw, 123);
        sensor.disable();
      });

      it("should return the correct value regardless of scale", async function() {
        let sensor = await new Sensor({
          pin: 17,
          io: Analog,
          scale: [400, 800]
        });
        sensor.io.value = 123;
        sensor.read();
        assert.equal(sensor.raw, 123);
        sensor.disable();
      });

    });

    describe("value", function() {

      it("should return the correct value", async function() {
        let sensor = await new Sensor({
          pin: 17,
          io: Analog
        });
        sensor.io.value = 123;
        sensor.read();
        assert.equal(sensor.value, 123);
        sensor.disable();
      });

      it("should return the correct value based on range", async function() {
        let sensor = await new Sensor({
          pin: 17,
          io: Analog,
          range: [400, 800]
        });
        [[123, 0], [400, 0], [600, 511.5], [800, 1023], [1000, 1023]].forEach(inAndOut => {
          sensor.io.value = inAndOut[0];
          sensor.read();
          assert.equal(sensor.value, inAndOut[1]);
        });

        sensor.disable();
      });

      it("should return the correct value based on scale", async function() {
        let sensor = await new Sensor({
          pin: 17,
          io: Analog,
          scale: [400, 800]
        });
        [[0, 400], [400, 556], [600, 634], [800, 712], [1000, 791]].forEach(inAndOut => {
          sensor.io.value = inAndOut[0];
          sensor.read();
          assert.equal(Math.abs(sensor.value - inAndOut[1]) < 1, true);
        });

        sensor.disable();
      });

      it("should return the correct value based on scale and range", async function() {
        let sensor = await new Sensor({
          pin: 17,
          io: Analog,
          range: [400, 800],
          scale: [0, 255]
        });
        [[0, 0], [400, 0], [600, 127.5], [800, 255], [1000, 255]].forEach(inAndOut => {
          sensor.io.value = inAndOut[0];
          sensor.read();
          assert.equal(Math.abs(sensor.value - inAndOut[1]) < 1, true);
        });

        sensor.disable();
      });
    });

    describe("scaled", function() {

      it("should return the correct value", async function() {
        let sensor = await new Sensor({
          pin: 17,
          io: Analog
        });
        sensor.io.value = 123;
        sensor.read();
        assert.equal(sensor.scaled, 123);
        sensor.disable();
      });

      it("should return the correct value based on range", async function() {
        let sensor = await new Sensor({
          pin: 17,
          io: Analog,
          range: [400, 800]
        });
        [[123, 0], [400, 0], [600, 511.5], [800, 1023], [1000, 1023]].forEach(inAndOut => {
          sensor.io.value = inAndOut[0];
          sensor.read();
          assert.equal(sensor.scaled, inAndOut[1]);
        });

        sensor.disable();
      });

      it("should return the correct value based on scale", async function() {
        let sensor = await new Sensor({
          pin: 17,
          io: Analog,
          scale: [400, 800]
        });
        [[0, 400], [400, 556], [600, 634], [800, 712], [1000, 791]].forEach(inAndOut => {
          sensor.io.value = inAndOut[0];
          sensor.read();
          assert.equal(Math.abs(sensor.scaled - inAndOut[1]) < 1, true);
        });

        sensor.disable();
      });

      it("should return the correct value based on scale and range", async function() {
        let sensor = await new Sensor({
          pin: 17,
          io: Analog,
          range: [400, 800],
          scale: [0, 255]
        });
        [[0, 0], [400, 0], [600, 127.5], [800, 255], [1000, 255]].forEach(inAndOut => {
          sensor.io.value = inAndOut[0];
          sensor.read();
          assert.equal(Math.abs(sensor.scaled - inAndOut[1]) < 1, true);
        });

        sensor.disable();
      });
    });

    describe("resolution", function() {

      it("should return 2^10-1", async function() {
        let sensor = await new Sensor({
          pin: 17,
          io: Analog
        });
        assert.equal(sensor.resolution, 1023);
        sensor.disable();
      });
    });

    describe("limit", function() {

      it("should return null when limit is not set", async function() {
        let sensor = await new Sensor({
          pin: 17,
          io: Analog
        });
        assert.equal(sensor.limit, null);
        sensor.disable();
      });

      it("should return limit set in options", async function() {
        let sensor = await new Sensor({
          pin: 17,
          io: Analog,
          limit: [200, 823]
        });
        assert.equal(sensor.limit[0], 200);
        assert.equal(sensor.limit[1], 823);
        sensor.disable();
      });

      it("should be settable", async function() {
        let sensor = await new Sensor({
          pin: 17,
          io: Analog,
          limit: [200, 823]
        });
        assert.equal(sensor.limit[0], 200);
        assert.equal(sensor.limit[1], 823);
        sensor.limit = [300, 900];
        assert.equal(sensor.limit[0], 300);
        assert.equal(sensor.limit[1], 900);
        sensor.disable();
      });

      it("should be settable", async function() {
        let sensor = await new Sensor({
          pin: 17,
          io: Analog,
          limit: [200, 800]
        });
        assert.equal(sensor.limit[0], 200);
        assert.equal(sensor.limit[1], 800);
        sensor.limit = [300, 900];
        assert.equal(sensor.limit[0], 300);
        assert.equal(sensor.limit[1], 900);
        sensor.disable();
      });

      it("should adjust when the limit changes", async function() {

        const clock = sinon.useFakeTimers();
        let sensor = await new Sensor({
          pin: 17,
          io: Analog,
          limit: [256, 768]
        });

        const calls = {
          "lower": 0,
          "upper": 0,
          "limit:lower": 0,
          "limit:upper": 0
        };

        sensor.on("limit", function(data) {
          if (data.boundary === "lower") {
            assert.equal(sensor.raw <= 256, true);
            calls.lower++;
          } else {
            assert.equal(sensor.raw >= 768, true);
            calls.upper++;
          }
        });

        sensor.on("limit:lower", function(data) {
          assert.equal(sensor.raw <= 256, true);
          calls["limit:lower"]++;
        });

        sensor.on("limit:upper", function(data) {
          assert.equal(sensor.raw >= 768, true);
          calls["limit:upper"]++;
        });

        clock.tick(1005);
        sensor.io.value = 127;
        clock.tick(1005);
        sensor.io.value = 256;
        clock.tick(1005);
        sensor.io.value = 512;
        clock.tick(1005);
        sensor.io.value = 768;
        clock.tick(1005);
        sensor.io.value = 895;
        clock.tick(1005);
        sensor.io.value = 1023;
        clock.tick(1005);

        assert.equal(calls.lower, 3);
        assert.equal(calls.upper, 3);
        assert.equal(calls["limit:lower"], 3);
        assert.equal(calls["limit:upper"], 3);

        sensor.limit = [200, 800];

        sensor.io.value = 127;
        clock.tick(1005);
        sensor.io.value = 256;
        clock.tick(1005);
        sensor.io.value = 512;
        clock.tick(1005);
        sensor.io.value = 768;
        clock.tick(1005);
        sensor.io.value = 895;
        clock.tick(1005);
        sensor.io.value = 1023;
        clock.tick(1005);

        assert.equal(calls.lower, 4);
        assert.equal(calls.upper, 5);
        assert.equal(calls["limit:lower"], 4);
        assert.equal(calls["limit:upper"], 5);

        clock.restore();
        sensor.disable();

      });

    });

    describe("threshold", function() {

      it("should return null when threshold is not set", async function() {
        let sensor = await new Sensor({
          pin: 17,
          io: Analog
        });
        assert.equal(sensor.threshold, 1);
        sensor.disable();
      });

      it("should return the threshold set in options", async function() {
        let sensor = await new Sensor({
          pin: 17,
          io: Analog,
          threshold: 5
        });
        assert.equal(sensor.threshold, 5);
        sensor.disable();
      });

      it("should be settable", async function() {
        let sensor = await new Sensor({
          pin: 17,
          io: Analog
        });
        assert.equal(sensor.threshold, 1);
        sensor.threshold = 5;
        assert.equal(sensor.threshold, 5);
        sensor.disable();
      });

      it("should adjust when the threshold changes", async function() {

        const clock = sinon.useFakeTimers();
        let sensor = await new Sensor({
          pin: 17,
          io: Analog
        });

        const changeSpy = sinon.spy();

        sensor.on("change", changeSpy);

        clock.tick(1005);
        sensor.io.value = 1;
        clock.tick(1005);
        sensor.io.value = 2;
        clock.tick(1005);
        sensor.io.value = 5;
        clock.tick(1005);
        sensor.io.value = 7;
        clock.tick(1005);
        sensor.io.value = 10;
        clock.tick(1005);

        assert.equal(changeSpy.callCount, 5);

        sensor.threshold = 5;

        sensor.io.value = 11;
        clock.tick(1005);
        sensor.io.value = 14;
        clock.tick(1005);
        sensor.io.value = 20;
        clock.tick(1005);
        sensor.io.value = 25;
        clock.tick(1005);
        sensor.io.value = 27;
        clock.tick(1005);
        sensor.io.value = 1023;
        clock.tick(1005);

        assert.equal(changeSpy.callCount, 8);

        clock.restore();
        sensor.disable();

      });

    });

    describe("smoothing", function() {

      it("should return 10 when smoothing options is not passed", async function() {
        let sensor = await new Sensor({
          pin: 17,
          io: Analog
        });
        assert.equal(sensor.smoothing, 10);
        sensor.disable();
      });

      it("should return the smoothing set in options", async function() {
        let sensor = await new Sensor({
          pin: 17,
          io: Analog,
          smoothing: 5
        });
        assert.equal(sensor.smoothing, 5);
        sensor.disable();
      });

      it("should be settable", async function() {
        let sensor = await new Sensor({
          pin: 17,
          io: Analog
        });
        assert.equal(sensor.smoothing, 10);
        sensor.smoothing = 5;
        assert.equal(sensor.smoothing, 5);
        sensor.disable();
      });

      it("should emit the correct events and values when smoothing is ", async function() {
        const clock = sinon.useFakeTimers();
        const dataSpy = sinon.spy();

        let sensor = await new Sensor({
          pin: 17,
          io: Analog
        });

        sensor.on("data", dataSpy);

        [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].forEach(value => {
          sensor.io.value = value;
          clock.tick(101);
        });
        assert.equal(dataSpy.callCount, 1);
        assert.equal(dataSpy.lastCall.args, 6);

        [11, 12, 13, 14, 15, 16, 17, 18, 19, 20].forEach(value => {
          sensor.io.value = value;
          clock.tick(101);
        });
        assert.equal(dataSpy.callCount, 2);
        assert.equal(dataSpy.lastCall.args, 16);
      });

      it("should emit the correct events and values when smoothing is 5", async function() {
        const clock = sinon.useFakeTimers();
        const dataSpy = sinon.spy();

        let sensor = await new Sensor({
          pin: 17,
          io: Analog
        });

        sensor.on("data", dataSpy);

        sensor.smoothing = 5;

        [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].forEach(value => {
          sensor.io.value = value;
          clock.tick(101);
        });
        assert.equal(dataSpy.callCount, 2);
        assert.equal(dataSpy.lastCall.args, 8);

        [11, 12, 13, 14, 15, 16, 17, 18, 19, 20].forEach(value => {
          sensor.io.value = value;
          clock.tick(101);
        });
        assert.equal(dataSpy.callCount, 4);
        assert.equal(dataSpy.lastCall.args, 18);
      });

      it("should emit the correct events and values when smoothing changes", async function() {
        const clock = sinon.useFakeTimers();
        const dataSpy = sinon.spy();

        let sensor = await new Sensor({
          pin: 17,
          io: Analog
        });

        sensor.on("data", dataSpy);

        sensor.smoothing = 5;

        [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].forEach(value => {
          sensor.io.value = value;
          clock.tick(101);
        });
        assert.equal(dataSpy.callCount, 2);
        assert.equal(dataSpy.lastCall.args, 8);

        sensor.smoothing = 10;

        [11, 12, 13, 14, 15, 16, 17, 18, 19, 20].forEach(value => {
          sensor.io.value = value;
          clock.tick(101);
        });
        assert.equal(dataSpy.callCount, 3);
        assert.equal(dataSpy.lastCall.args, 16);
      });

    });

  });

  describe("Methods", function() {

    describe("disable", function() {
      it("should disable the reading interval when called", async function() {
        const dataSpy = sinon.spy();
        const clock = sinon.useFakeTimers();

        let sensor = await new Sensor({
          pin: 17,
          io: Analog
        });

        sensor.on("data", dataSpy);

        clock.tick(10000);
        assert.equal(dataSpy.callCount, 10);

        sensor.disable();

        clock.tick(10000);
        assert.equal(dataSpy.callCount, 10);

        clock.restore();
      });
    });

    describe("enable", function() {
      it("should enable the reading interval when called", async function() {
        const dataSpy = sinon.spy();
        const clock = sinon.useFakeTimers();

        let sensor = await new Sensor({
          pin: 17,
          io: Analog,
          enabled: false
        });

        sensor.on("data", dataSpy);

        clock.tick(10000);
        assert.equal(dataSpy.callCount, 0);

        sensor.enable();

        clock.tick(10000);
        assert.equal(dataSpy.callCount, 10);

        sensor.disable();
        clock.restore();
      });
    });

    describe("read", function() {
      it("should return the current value when called", async function() {
        const dataSpy = sinon.spy();

        let sensor = await new Sensor({
          pin: 17,
          io: Analog
        });

        sensor.io.value = 123;
        assert.equal(sensor.read(), 123);

        sensor.io.value = 456;
        assert.equal(sensor.read(), 456);

        sensor.disable();
      });
    });

    describe("scale", function() {

      it("should accept two params or an array", async function() {

        let sensor = await new Sensor({
          pin: 17,
          io: Analog
        });

        sensor.scale(0, 255);
        sensor.io.value = 123;
        assert.equal(Math.abs(sensor.read() - 31) < 1, true);

        sensor.scale([0, 512]);
        sensor.io.value = 123;
        assert.equal(Math.abs(sensor.read() - 62) < 1, true);

        sensor.disable();
      });

      it("should scale the current value when read", async function() {

        let sensor = await new Sensor({
          pin: 17,
          io: Analog
        });

        sensor.io.value = 123;
        assert.equal(sensor.read(), 123);

        sensor.io.value = 456;
        assert.equal(sensor.read(), 456);

        sensor.scale(0, 255);
        sensor.io.value = 123;
        assert.equal(Math.abs(sensor.read() - 31) < 1, true);

        sensor.io.value = 456;
        assert.equal(Math.abs(sensor.read() - 114) < 1, true);

        sensor.disable();
      });
    });

    describe("scaleto", function() {
      it("should scale the returned value only", async function() {

        let sensor = await new Sensor({
          pin: 17,
          io: Analog
        });

        sensor.io.value = 123;
        assert.equal(sensor.read(), 123);
        assert.equal(sensor.value, 123);
        assert.equal(sensor.scaleTo(0, 2047), 246);
        assert.equal(sensor.scaleTo(0, 255), 30);
        assert.equal(sensor.value, 123);

        sensor.scale(0, 255);
        sensor.io.value = 123;
        assert.equal(Math.abs(sensor.read() - 30) < 1, true);
        assert.equal(Math.abs(sensor.read() - 30) !== 0, true);
        assert.equal(sensor.scaleTo(0, 2047), 246);

        sensor.disable();
      });
    });

    describe("fscaleto", function() {

    });

  });

  describe("Events", function() {

    describe("data", function() {

      it("should emit data events when enabled", async function() {

        const clock = sinon.useFakeTimers();
        const dataSpy = sinon.spy();

        let sensor = await new Sensor({
          pin: 17,
          io: Analog
        });

        sensor.on("data", dataSpy);

        clock.tick(10001);
        assert.equal(dataSpy.callCount, 10);

        sensor.disable();

        clock.tick(10001);
        assert.equal(dataSpy.callCount, 10);

        sensor.enable();

        clock.tick(10001);
        assert.equal(dataSpy.callCount, 20);

        sensor.disable();
        clock.restore();
      });

      it("should pass the correct value to the callback", async function() {

        const clock = sinon.useFakeTimers();
        const dataSpy = sinon.spy();

        let sensor = await new Sensor({
          pin: 17,
          io: Analog
        });

        sensor.on("data", dataSpy);

        sensor.io.value = 432;

        clock.tick(1001);
        assert.equal(dataSpy.callCount, 1);
        assert.equal(dataSpy.getCall(0).args[0], 432);

        sensor.disable();
        clock.restore();
      });

      it("should pass the scaled value to the callback", async function() {

        const clock = sinon.useFakeTimers();
        const dataSpy = sinon.spy();

        let sensor = await new Sensor({
          pin: 17,
          io: Analog,
          scale: [0, 255]
        });

        sensor.on("data", dataSpy);

        sensor.io.value = 432;

        clock.tick(1001);
        assert.equal(dataSpy.callCount, 1);
        assert.equal(sensor.raw, 432);
        assert.equal(dataSpy.getCall(0).args[0], 108);

        sensor.disable();
        clock.restore();
      });

    });

    describe("change", function() {
      it("should emit change events when enabled", async function() {

        const clock = sinon.useFakeTimers();
        const changeSpy = sinon.spy();

        let sensor = await new Sensor({
          pin: 17,
          io: Analog
        });

        sensor.on("change", changeSpy);

        clock.tick(1001);
        assert.equal(changeSpy.callCount, 0);

        sensor.io.value = 123;
        clock.tick(1001);
        assert.equal(changeSpy.callCount, 1);

        sensor.disable();
        sensor.io.value = 234;
        clock.tick(1001);
        assert.equal(changeSpy.callCount, 1);

        sensor.enable();
        sensor.io.value = 456;
        clock.tick(1001);
        assert.equal(changeSpy.callCount, 2);

        sensor.disable();
        clock.restore();
      });

      it("should pass the correct value to the callback", async function() {

        const clock = sinon.useFakeTimers();
        const changeSpy = sinon.spy();

        let sensor = await new Sensor({
          pin: 17,
          io: Analog
        });

        sensor.on("change", changeSpy);

        clock.tick(1001);
        assert.equal(changeSpy.callCount, 0);

        sensor.io.value = 123;
        clock.tick(1001);
        assert.equal(changeSpy.callCount, 1);
        assert.equal(changeSpy.getCall(0).args[0], 123);
        assert.equal(sensor.value, 123);

        sensor.disable();
        sensor.io.value = 234;
        clock.tick(1001);
        assert.equal(changeSpy.callCount, 1);
        assert.equal(sensor.value, 123);

        sensor.enable();
        sensor.io.value = 456;
        clock.tick(1001);
        assert.equal(changeSpy.callCount, 2);
        assert.equal(changeSpy.getCall(1).args[0], 456);
        assert.equal(sensor.value, 456);

        sensor.io.value = 432;

        clock.tick(1001);
        assert.equal(changeSpy.callCount, 3);
        assert.equal(changeSpy.getCall(2).args[0], 432);

        sensor.disable();
        clock.restore();
      });

      it("should pass the scaled value to the callback", async function() {

        const clock = sinon.useFakeTimers();
        const changeSpy = sinon.spy();

        let sensor = await new Sensor({
          pin: 17,
          io: Analog,
          scale: [0, 255]
        });

        sensor.on("change", changeSpy);

        clock.tick(1001);
        assert.equal(changeSpy.callCount, 0);

        sensor.io.value = 123;
        clock.tick(1001);
        assert.equal(changeSpy.callCount, 1);
        assert.equal(changeSpy.getCall(0).args[0], 31);
        assert.equal(Math.abs(sensor.value - 30) !== 0, true);

        sensor.disable();
        sensor.io.value = 234;
        clock.tick(1001);
        assert.equal(changeSpy.callCount, 1);
        assert.equal(Math.abs(sensor.value - 30) !== 0, true);

        sensor.enable();
        sensor.io.value = 456;
        clock.tick(1001);
        assert.equal(changeSpy.callCount, 2);
        assert.equal(changeSpy.getCall(1).args[0], 114);
        assert.equal(Math.abs(sensor.value - 114) !== 0, true);

        sensor.io.value = 432;

        clock.tick(1001);
        assert.equal(changeSpy.callCount, 3);
        assert.equal(changeSpy.getCall(2).args[0], 108);

        sensor.disable();
        clock.restore();
      });
    });

    describe("limit", function() {

      it("should emit limit events when enabled", async function() {

        const clock = sinon.useFakeTimers();
        let sensor = await new Sensor({
          pin: 17,
          io: Analog,
          limit: [256, 768]
        });

        const calls = {
          "lower": 0,
          "upper": 0
        };

        sensor.on("limit", function(data) {
          if (data.boundary === "lower") {
            assert.equal(sensor.raw <= 256, true);
            calls.lower++;
          } else {
            assert.equal(sensor.raw >= 768, true);
            calls.upper++;
          }
        });

        clock.tick(1005);
        sensor.io.value = 127;
        clock.tick(1005);
        sensor.io.value = 256;
        clock.tick(1005);
        sensor.io.value = 512;
        clock.tick(1005);
        sensor.io.value = 768;
        clock.tick(1005);
        sensor.io.value = 895;
        clock.tick(1005);
        sensor.io.value = 1023;
        clock.tick(1005);

        assert.equal(calls.lower, 3);
        assert.equal(calls.upper, 3);

        sensor.disable();

        clock.tick(1005);
        sensor.io.value = 127;
        clock.tick(1005);
        sensor.io.value = 256;
        clock.tick(1005);
        sensor.io.value = 512;
        clock.tick(1005);
        sensor.io.value = 768;
        clock.tick(1005);
        sensor.io.value = 895;
        clock.tick(1005);
        sensor.io.value = 1023;
        clock.tick(1005);

        assert.equal(calls.lower, 3);
        assert.equal(calls.upper, 3);

        sensor.enable();

        clock.tick(1005);
        sensor.io.value = 127;
        clock.tick(1005);
        sensor.io.value = 256;
        clock.tick(1005);
        sensor.io.value = 512;
        clock.tick(1005);
        sensor.io.value = 768;
        clock.tick(1005);
        sensor.io.value = 895;
        clock.tick(1005);
        sensor.io.value = 1023;
        clock.tick(1005);

        assert.equal(calls.lower, 5);
        assert.equal(calls.upper, 7);

        clock.restore();
        sensor.disable();

      });

    });

    describe("limit:lower", function() {
      it("should emit limit:lower events when enabled", async function() {

        const clock = sinon.useFakeTimers();
        let sensor = await new Sensor({
          pin: 17,
          io: Analog,
          limit: [256, 768]
        });

        const calls = {
          "limit:lower": 0
        };

        sensor.on("limit:lower", function(data) {
          assert.equal(sensor.raw <= 256, true);
          calls["limit:lower"]++;
        });

        clock.tick(1005);
        sensor.io.value = 127;
        clock.tick(1005);
        sensor.io.value = 256;
        clock.tick(1005);
        sensor.io.value = 512;
        clock.tick(1005);
        sensor.io.value = 768;
        clock.tick(1005);
        sensor.io.value = 895;
        clock.tick(1005);
        sensor.io.value = 1023;
        clock.tick(1005);

        assert.equal(calls["limit:lower"], 3);

        sensor.disable();

        clock.tick(1005);
        sensor.io.value = 127;
        clock.tick(1005);
        sensor.io.value = 256;
        clock.tick(1005);
        sensor.io.value = 512;
        clock.tick(1005);
        sensor.io.value = 768;
        clock.tick(1005);
        sensor.io.value = 895;
        clock.tick(1005);
        sensor.io.value = 1023;
        clock.tick(1005);

        assert.equal(calls["limit:lower"], 3);

        sensor.enable();

        clock.tick(1005);
        sensor.io.value = 127;
        clock.tick(1005);
        sensor.io.value = 256;
        clock.tick(1005);
        sensor.io.value = 512;
        clock.tick(1005);
        sensor.io.value = 768;
        clock.tick(1005);
        sensor.io.value = 895;
        clock.tick(1005);
        sensor.io.value = 1023;
        clock.tick(1005);

        assert.equal(calls["limit:lower"], 5);

        clock.restore();
        sensor.disable();

      });
    });

    describe("limit:upper", function() {
      it("should emit limit:upper events when enabled", async function() {

        const clock = sinon.useFakeTimers();
        let sensor = await new Sensor({
          pin: 17,
          io: Analog,
          limit: [256, 768]
        });

        const calls = {
          "limit:upper": 0
        };

        sensor.on("limit:upper", function(data) {
          assert.equal(sensor.raw >= 768, true);
          calls["limit:upper"]++;
        });

        clock.tick(1005);
        sensor.io.value = 127;
        clock.tick(1005);
        sensor.io.value = 256;
        clock.tick(1005);
        sensor.io.value = 512;
        clock.tick(1005);
        sensor.io.value = 768;
        clock.tick(1005);
        sensor.io.value = 895;
        clock.tick(1005);
        sensor.io.value = 1023;
        clock.tick(1005);

        assert.equal(calls["limit:upper"], 3);

        sensor.disable();

        clock.tick(1005);
        sensor.io.value = 127;
        clock.tick(1005);
        sensor.io.value = 256;
        clock.tick(1005);
        sensor.io.value = 512;
        clock.tick(1005);
        sensor.io.value = 768;
        clock.tick(1005);
        sensor.io.value = 895;
        clock.tick(1005);
        sensor.io.value = 1023;
        clock.tick(1005);

        assert.equal(calls["limit:upper"], 3);

        sensor.enable();

        clock.tick(1005);
        sensor.io.value = 127;
        clock.tick(1005);
        sensor.io.value = 256;
        clock.tick(1005);
        sensor.io.value = 512;
        clock.tick(1005);
        sensor.io.value = 768;
        clock.tick(1005);
        sensor.io.value = 895;
        clock.tick(1005);
        sensor.io.value = 1023;
        clock.tick(1005);

        assert.equal(calls["limit:upper"], 7);

        clock.restore();
        sensor.disable();

      });
    });

    describe("raw", function() {
      it("should emit data events when enabled", async function() {

        const clock = sinon.useFakeTimers();
        const rawSpy = sinon.spy();

        let sensor = await new Sensor({
          pin: 17,
          io: Analog
        });

        sensor.on("raw", rawSpy);

        clock.tick(10001);
        assert.equal(rawSpy.callCount, 100);

        sensor.disable();

        clock.tick(10001);
        assert.equal(rawSpy.callCount, 100);

        sensor.enable();

        clock.tick(10001);
        assert.equal(rawSpy.callCount, 200);

        sensor.disable();
        clock.restore();
      });

      it("should pass the correct value to the callback", async function() {

        const clock = sinon.useFakeTimers();
        const rawSpy = sinon.spy();

        let sensor = await new Sensor({
          pin: 17,
          io: Analog
        });

        sensor.on("raw", rawSpy);

        sensor.io.value = 432;

        clock.tick(1001);
        assert.equal(rawSpy.callCount, 10);
        assert.equal(rawSpy.getCall(0).args[0], 432);

        sensor.disable();
        clock.restore();
      });
    });

  });

});
