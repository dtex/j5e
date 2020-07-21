import assert from "assert";
import sinon from "sinon";
import { Analog } from "@dtex/mock-io";
import Thermometer from "j5e/thermometer";
import Sensor from "j5e/sensor";
import { Emitter } from "j5e/event";
import Withinable from "j5e/withinable";

describe("Thermometer", function() {

  describe("Instantiation", async function() {

    it("should return a valid Thermometer instance when passed an options object", async function() {
      let thermometer = await new Thermometer({
        pin: 17,
        io: Analog
      });
      assert.equal(thermometer instanceof Thermometer, true);
      assert.equal(thermometer instanceof Sensor, true);
      assert.equal(thermometer instanceof Emitter, true);
      assert.equal(thermometer instanceof Withinable, true);
      assert.equal(thermometer.io instanceof Analog, true);
      thermometer.disable();
    });

    it("should return the correct default property values", async function() {
      let thermometer = await new Thermometer({
        pin: 17,
        io: Analog
      });
      assert.equal(thermometer.interval, 100);
      assert.equal(thermometer.smoothing, 10);
      assert.equal(thermometer.raw, null);
      assert.equal(thermometer.value, null);
      assert.equal(thermometer.median, null);
      assert.equal(thermometer.last, null);
      assert.equal(thermometer.threshold, 1);
      assert.equal(thermometer.limit, null);
      assert.equal(thermometer.resolution, 1023);
      assert.equal(thermometer.celsius, null);
      assert.equal(thermometer.fahrenheit, 32);
      assert.equal(thermometer.kelvin, 273.15);
      assert.equal(thermometer.C, null);
      assert.equal(thermometer.F, 32);
      assert.equal(thermometer.K, 273.15);
      thermometer.disable();
    });

    it("should make 10 readings per second", async function() {
      const clock = sinon.useFakeTimers();
      let thermometer = await new Thermometer({
        pin: 17,
        io: Analog
      });
      const readSpy = sinon.spy(thermometer.io, "read");
      clock.tick(1050);
      assert.equal(readSpy.callCount, 10);
      clock.restore();
      thermometer.disable();
    });

    describe("Options", function() {
      describe("enabled", function() {

        it("should return the correct default property values", async function() {

          let thermometer = await new Thermometer({
            pin: 17,
            io: Analog,
            enabled: false
          });
          assert.equal(thermometer.interval, null);
          assert.equal(thermometer.smoothing, 10);
          assert.equal(thermometer.raw, null);
          assert.equal(thermometer.value, null);
          assert.equal(thermometer.median, null);
          assert.equal(thermometer.last, null);
          assert.equal(thermometer.threshold, 1);
          assert.equal(thermometer.limit, null);
          assert.equal(thermometer.resolution, 1023);

          thermometer.disable();

        });

        it("should not start making readings", async function() {

          const clock = sinon.useFakeTimers();
          let thermometer = await new Thermometer({
            pin: 17,
            io: Analog,
            enabled: false
          });

          const writeSpy = sinon.spy(thermometer.io, "read");

          clock.tick(1050);
          assert.equal(writeSpy.callCount, 0);
          clock.restore();

          thermometer.disable();

        });

      });

      describe("interval", function() {

        it("should return the correct default property values", async function() {

          let thermometer = await new Thermometer({
            pin: 17,
            io: Analog,
            interval: 50
          });
          assert.equal(thermometer.interval, 50);
          assert.equal(thermometer.smoothing, 10);
          assert.equal(thermometer.raw, null);
          assert.equal(thermometer.value, null);
          assert.equal(thermometer.median, null);
          assert.equal(thermometer.last, null);
          assert.equal(thermometer.threshold, 1);
          assert.equal(thermometer.limit, null);
          assert.equal(thermometer.resolution, 1023);

          thermometer.disable();

        });

        it("should make 20 readings per second", async function() {

          const clock = sinon.useFakeTimers();
          let thermometer = await new Thermometer({
            pin: 17,
            io: Analog,
            interval: 50
          });

          const writeSpy = sinon.spy(thermometer.io, "read");

          clock.tick(1005);
          assert.equal(writeSpy.callCount, 20);
          clock.restore();

          thermometer.disable();

        });

      });

      describe("range", function() {

        it("should return the correct default property values", async function() {

          let thermometer = await new Thermometer({
            pin: 17,
            io: Analog,
            range: [256, 758]
          });
          assert.equal(thermometer.interval, 100);
          assert.equal(thermometer.smoothing, 10);
          assert.equal(thermometer.raw, null);
          assert.equal(thermometer.value, null);
          assert.equal(thermometer.median, null);
          assert.equal(thermometer.last, null);
          assert.equal(thermometer.threshold, 1);
          assert.equal(thermometer.limit, null);
          assert.equal(thermometer.resolution, 1023);

          thermometer.disable();

        });

        it("should map value properly", async function() {

          let thermometer = await new Thermometer({
            pin: 17,
            io: Analog,
            range: [256, 768]
          });

          thermometer.io.value = 0;
          assert.equal(thermometer.raw, null);
          assert.equal(thermometer.value, null);
          thermometer.read();
          assert.equal(thermometer.raw, 0);
          assert.equal(thermometer.value, 0);
          thermometer.io.value = 127;
          thermometer.read();
          assert.equal(thermometer.raw, 127);
          assert.equal(thermometer.value, 0);
          thermometer.io.value = 256;
          thermometer.read();
          assert.equal(thermometer.raw, 256);
          assert.equal(thermometer.value, 0);
          thermometer.io.value = 512;
          thermometer.read();
          assert.equal(thermometer.raw, 512);
          assert.equal(thermometer.value, 511.5);
          thermometer.io.value = 768;
          thermometer.read();
          assert.equal(thermometer.raw, 768);
          assert.equal(thermometer.value, 1023);
          thermometer.io.value = 1023;
          thermometer.read();
          assert.equal(thermometer.raw, 1023);
          assert.equal(thermometer.value, 1023);

          thermometer.disable();

        });

      });

      describe("limit", function() {

        it("should return the correct default property values", async function() {

          let thermometer = await new Thermometer({
            pin: 17,
            io: Analog,
            limit: [256, 758]
          });

          assert.equal(thermometer.interval, 100);
          assert.equal(thermometer.smoothing, 10);
          assert.equal(thermometer.raw, null);
          assert.equal(thermometer.value, null);
          assert.equal(thermometer.median, null);
          assert.equal(thermometer.last, null);
          assert.equal(thermometer.threshold, 1);
          assert.equal(thermometer.limit[0], 256);
          assert.equal(thermometer.limit[1], 758);
          assert.equal(thermometer.resolution, 1023);

          thermometer.disable();

        });

        it("should emit upper and lower limit events", async function() {

          const clock = sinon.useFakeTimers();
          let thermometer = await new Thermometer({
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

          thermometer.on("limit", function(data) {
            if (data.boundary === "lower") {
              assert.equal(thermometer.raw <= 256, true);
              calls.lower++;
            } else {
              assert.equal(thermometer.raw >= 768, true);
              calls.upper++;
            }
          });

          thermometer.on("limit:lower", function(data) {
            assert.equal(thermometer.raw <= 256, true);
            calls["limit:lower"]++;
          });

          thermometer.on("limit:upper", function(data) {
            assert.equal(thermometer.raw >= 768, true);
            calls["limit:upper"]++;
          });

          clock.tick(1005);
          thermometer.io.value = 127;
          clock.tick(1005);
          thermometer.io.value = 256;
          clock.tick(1005);
          thermometer.io.value = 512;
          clock.tick(1005);
          thermometer.io.value = 768;
          clock.tick(1005);
          thermometer.io.value = 895;
          clock.tick(1005);
          thermometer.io.value = 1023;
          clock.tick(1005);

          assert.equal(calls.lower, 3);
          assert.equal(calls.upper, 3);
          assert.equal(calls["limit:lower"], 3);
          assert.equal(calls["limit:upper"], 3);

          clock.restore();
          thermometer.disable();

        });

      });

      describe("threshold", function() {

        it("should return the correct default property values", async function() {

          let thermometer = await new Thermometer({
            pin: 17,
            io: Analog,
            threshold: 20
          });

          assert.equal(thermometer.interval, 100);
          assert.equal(thermometer.smoothing, 10);
          assert.equal(thermometer.raw, null);
          assert.equal(thermometer.value, null);
          assert.equal(thermometer.median, null);
          assert.equal(thermometer.last, null);
          assert.equal(thermometer.threshold, 20);
          assert.equal(thermometer.limit, null);
          assert.equal(thermometer.resolution, 1023);

          thermometer.disable();

        });

        it("should emit change event when the threshold is exceeded", async function() {


          const clock = sinon.useFakeTimers();
          let thermometer = await new Thermometer({
            pin: 17,
            io: Analog,
            threshold: 20
          });

          let last = 0;
          let count = 0;
          thermometer.on("change", function(data) {
            assert(Math.abs(data.raw - last) >= 20, true);
            last = data.raw;
            count++;
          });

          clock.tick(1005);
          thermometer.io.value = 10;
          clock.tick(1005);
          clock.tick(1005);
          thermometer.io.value = 100;
          thermometer.io.value = 20;
          clock.tick(1005);
          thermometer.io.value = 110;
          clock.tick(1005);
          thermometer.io.value = 900;
          clock.tick(1005);
          thermometer.io.value = 919;
          clock.tick(1005);
          thermometer.io.value = 920;
          clock.tick(1005);

          assert.equal(count, 4);

          thermometer.disable();

        });

      });

      describe("toCelsius", function() {

        it("should return the correct value", async function() {
          let thermometer = await new Thermometer({
            pin: 17,
            io: Analog,
            toCelsius: function(raw) {
              const mV = 3.3 * 1000 * raw / 1023;
              return (mV / 10) - 50;
            }
          });

          thermometer.io.value = 123;
          thermometer.read();
          assert.equal(thermometer.C.toFixed(2), -10.32);
          thermometer.disable();
        });

        it("should return the correct value based on range", async function() {
          let thermometer = await new Thermometer({
            pin: 17,
            io: Analog,
            range: [400, 800],
            toCelsius: function(raw) {
              const mV = 3.3 * 1000 * raw / 1023;
              return (mV / 10) - 50;
            }
          });
          [[123, -50], [400, -50], [600, 115], [800, 280], [1000, 280]].forEach(inAndOut => {
            thermometer.io.value = inAndOut[0];
            thermometer.read();
            assert.equal(thermometer.C, inAndOut[1]);
          });

          thermometer.disable();
        });

        it("should return the correct value based on scale", async function() {
          let thermometer = await new Thermometer({
            pin: 17,
            io: Analog,
            scale: [400, 800],
            toCelsius: function(raw) {
              const mV = 3.3 * 1000 * raw / 1023;
              return (mV / 10) - 50;
            }
          });
          [[0, 79.03], [400, 129.48], [600, 154.71], [800, 179.94], [1000, 205.16]].forEach(inAndOut => {
            thermometer.io.value = inAndOut[0];
            thermometer.read();
            assert.equal(thermometer.C.toFixed(2), inAndOut[1]);
          });

          thermometer.disable();
        });

        it("should return the correct value based on scale and range", async function() {
          let thermometer = await new Thermometer({
            pin: 17,
            io: Analog,
            range: [400, 800],
            scale: [0, 255],
            toCelsius: function(raw) {
              const mV = 3.3 * 1000 * raw / 1023;
              return (mV / 10) - 50;
            }
          });
          [[0, -50], [400, -50], [600, -8.87], [800, 32.26], [1000, 32.26]].forEach(inAndOut => {
            thermometer.io.value = inAndOut[0];
            thermometer.read();
            assert.equal(thermometer.C.toFixed(2), inAndOut[1]);
          });

          thermometer.disable();
        });
      });

    });
  });

  describe("Properties", function() {

    describe("interval", function() {

      it("should return the correct default value", async function() {
        let thermometer = await new Thermometer({
          pin: 17,
          io: Analog
        });
        assert.equal(thermometer.interval, 100);
        thermometer.disable();
      });

      it("should run at the correct default frequency", async function() {
        const clock = sinon.useFakeTimers();
        let thermometer = await new Thermometer({
          pin: 17,
          io: Analog
        });
        const readSpy = sinon.spy(thermometer.io, "read");
        clock.tick(1050);
        assert.equal(readSpy.callCount, 10);
        clock.restore();
        thermometer.disable();
      });

      it("should return the correct value when passed the interval param", async function() {
        let thermometer = await new Thermometer({
          pin: 17,
          io: Analog,
          interval: 10
        });
        assert.equal(thermometer.interval, 10);
        thermometer.disable();
      });

      it("should run at the correct frequency when passed the interval param", async function() {
        const clock = sinon.useFakeTimers();
        let thermometer = await new Thermometer({
          pin: 17,
          io: Analog,
          interval: 10
        });
        const readSpy = sinon.spy(thermometer.io, "read");
        clock.tick(1005);
        assert.equal(readSpy.callCount, 100);
        clock.restore();
        thermometer.disable();
      });

      it("should return the correct value when set", async function() {
        let thermometer = await new Thermometer({
          pin: 17,
          io: Analog,
          interval: 10
        });
        thermometer.interval = 20;
        assert.equal(thermometer.interval, 20);
        thermometer.disable();
      });

      it("should run at the correct frequency when set", async function() {
        const clock = sinon.useFakeTimers();
        let thermometer = await new Thermometer({
          pin: 17,
          io: Analog,
          interval: 10
        });
        thermometer.interval = 20;
        const readSpy = sinon.spy(thermometer.io, "read");
        clock.tick(1005);
        assert.equal(readSpy.callCount, 50);
        clock.restore();
        thermometer.disable();
      });

    });

    describe("raw", function() {

      it("should return the correct value", async function() {
        let thermometer = await new Thermometer({
          pin: 17,
          io: Analog
        });
        thermometer.io.value = 123;
        thermometer.read();
        assert.equal(thermometer.raw, 123);
        thermometer.disable();
      });

      it("should return the correct value regardless of range", async function() {
        let thermometer = await new Thermometer({
          pin: 17,
          io: Analog,
          range: [400, 800]
        });
        thermometer.io.value = 123;
        thermometer.read();
        assert.equal(thermometer.raw, 123);
        thermometer.disable();
      });

      it("should return the correct value regardless of limit", async function() {
        let thermometer = await new Thermometer({
          pin: 17,
          io: Analog,
          limit: [400, 800]
        });
        thermometer.io.value = 123;
        thermometer.read();
        assert.equal(thermometer.raw, 123);
        thermometer.disable();
      });

      it("should return the correct value regardless of scale", async function() {
        let thermometer = await new Thermometer({
          pin: 17,
          io: Analog,
          scale: [400, 800]
        });
        thermometer.io.value = 123;
        thermometer.read();
        assert.equal(thermometer.raw, 123);
        thermometer.disable();
      });

    });

    describe("value", function() {

      it("should return the correct value", async function() {
        let thermometer = await new Thermometer({
          pin: 17,
          io: Analog
        });
        thermometer.io.value = 123;
        thermometer.read();
        assert.equal(thermometer.value, 123);
        thermometer.disable();
      });

      it("should return the correct value based on range", async function() {
        let thermometer = await new Thermometer({
          pin: 17,
          io: Analog,
          range: [400, 800]
        });
        [[123, 0], [400, 0], [600, 511.5], [800, 1023], [1000, 1023]].forEach(inAndOut => {
          thermometer.io.value = inAndOut[0];
          thermometer.read();
          assert.equal(thermometer.value, inAndOut[1]);
        });

        thermometer.disable();
      });

      it("should return the correct value based on scale", async function() {
        let thermometer = await new Thermometer({
          pin: 17,
          io: Analog,
          scale: [400, 800]
        });
        [[0, 400], [400, 556], [600, 634], [800, 712], [1000, 791]].forEach(inAndOut => {
          thermometer.io.value = inAndOut[0];
          thermometer.read();
          assert.equal(Math.abs(thermometer.value - inAndOut[1]) < 1, true);
        });

        thermometer.disable();
      });

      it("should return the correct value based on scale and range", async function() {
        let thermometer = await new Thermometer({
          pin: 17,
          io: Analog,
          range: [400, 800],
          scale: [0, 255]
        });
        [[0, 0], [400, 0], [600, 127.5], [800, 255], [1000, 255]].forEach(inAndOut => {
          thermometer.io.value = inAndOut[0];
          thermometer.read();
          assert.equal(Math.abs(thermometer.value - inAndOut[1]) < 1, true);
        });

        thermometer.disable();
      });
    });

    describe("scaled", function() {

      it("should return the correct value", async function() {
        let thermometer = await new Thermometer({
          pin: 17,
          io: Analog
        });
        thermometer.io.value = 123;
        thermometer.read();
        assert.equal(thermometer.scaled, 123);
        thermometer.disable();
      });

      it("should return the correct value based on range", async function() {
        let thermometer = await new Thermometer({
          pin: 17,
          io: Analog,
          range: [400, 800]
        });
        [[123, 0], [400, 0], [600, 511.5], [800, 1023], [1000, 1023]].forEach(inAndOut => {
          thermometer.io.value = inAndOut[0];
          thermometer.read();
          assert.equal(thermometer.scaled, inAndOut[1]);
        });

        thermometer.disable();
      });

      it("should return the correct value based on scale", async function() {
        let thermometer = await new Thermometer({
          pin: 17,
          io: Analog,
          scale: [400, 800]
        });
        [[0, 400], [400, 556], [600, 634], [800, 712], [1000, 791]].forEach(inAndOut => {
          thermometer.io.value = inAndOut[0];
          thermometer.read();
          assert.equal(Math.abs(thermometer.scaled - inAndOut[1]) < 1, true);
        });

        thermometer.disable();
      });

      it("should return the correct value based on scale and range", async function() {
        let thermometer = await new Thermometer({
          pin: 17,
          io: Analog,
          range: [400, 800],
          scale: [0, 255]
        });
        [[0, 0], [400, 0], [600, 127.5], [800, 255], [1000, 255]].forEach(inAndOut => {
          thermometer.io.value = inAndOut[0];
          thermometer.read();
          assert.equal(Math.abs(thermometer.scaled - inAndOut[1]) < 1, true);
        });

        thermometer.disable();
      });
    });

    describe("celsius", function() {

      it("should return the correct value", async function() {
        let thermometer = await new Thermometer({
          pin: 17,
          io: Analog
        });
        thermometer.io.value = 123;
        thermometer.read();
        assert.equal(thermometer.celsius, 123);
        thermometer.disable();
      });

      it("should return the correct value based on range", async function() {
        let thermometer = await new Thermometer({
          pin: 17,
          io: Analog,
          range: [400, 800]
        });
        [[123, 0], [400, 0], [600, 511.5], [800, 1023], [1000, 1023]].forEach(inAndOut => {
          thermometer.io.value = inAndOut[0];
          thermometer.read();
          assert.equal(thermometer.celsius, inAndOut[1]);
        });

        thermometer.disable();
      });

      it("should return the correct value based on scale", async function() {
        let thermometer = await new Thermometer({
          pin: 17,
          io: Analog,
          scale: [400, 800]
        });
        [[0, 400], [400, 556], [600, 634], [800, 712], [1000, 791]].forEach(inAndOut => {
          thermometer.io.value = inAndOut[0];
          thermometer.read();
          assert.equal(Math.abs(thermometer.celsius - inAndOut[1]) < 1, true);
        });

        thermometer.disable();
      });

      it("should return the correct value based on scale and range", async function() {
        let thermometer = await new Thermometer({
          pin: 17,
          io: Analog,
          range: [400, 800],
          scale: [0, 255]
        });
        [[0, 0], [400, 0], [600, 127.5], [800, 255], [1000, 255]].forEach(inAndOut => {
          thermometer.io.value = inAndOut[0];
          thermometer.read();
          assert.equal(Math.abs(thermometer.celsius - inAndOut[1]) < 1, true);
        });

        thermometer.disable();
      });
    });

    describe("C", function() {

      it("should return the correct value", async function() {
        let thermometer = await new Thermometer({
          pin: 17,
          io: Analog
        });
        thermometer.io.value = 123;
        thermometer.read();
        assert.equal(thermometer.C, 123);
        thermometer.disable();
      });

      it("should return the correct value based on range", async function() {
        let thermometer = await new Thermometer({
          pin: 17,
          io: Analog,
          range: [400, 800]
        });
        [[123, 0], [400, 0], [600, 511.5], [800, 1023], [1000, 1023]].forEach(inAndOut => {
          thermometer.io.value = inAndOut[0];
          thermometer.read();
          assert.equal(thermometer.C, inAndOut[1]);
        });

        thermometer.disable();
      });

      it("should return the correct value based on scale", async function() {
        let thermometer = await new Thermometer({
          pin: 17,
          io: Analog,
          scale: [400, 800]
        });
        [[0, 400], [400, 556], [600, 634], [800, 712], [1000, 791]].forEach(inAndOut => {
          thermometer.io.value = inAndOut[0];
          thermometer.read();
          assert.equal(Math.abs(thermometer.C - inAndOut[1]) < 1, true);
        });

        thermometer.disable();
      });

      it("should return the correct value based on scale and range", async function() {
        let thermometer = await new Thermometer({
          pin: 17,
          io: Analog,
          range: [400, 800],
          scale: [0, 255]
        });
        [[0, 0], [400, 0], [600, 127.5], [800, 255], [1000, 255]].forEach(inAndOut => {
          thermometer.io.value = inAndOut[0];
          thermometer.read();
          assert.equal(Math.abs(thermometer.C - inAndOut[1]) < 1, true);
        });

        thermometer.disable();
      });
    });

    describe("kelvin", function() {

      it("should return the correct value", async function() {
        let thermometer = await new Thermometer({
          pin: 17,
          io: Analog
        });
        thermometer.io.value = 123;
        thermometer.read();
        assert.equal(thermometer.kelvin, 396.15);
        thermometer.disable();
      });

      it("should return the correct value based on range", async function() {
        let thermometer = await new Thermometer({
          pin: 17,
          io: Analog,
          range: [400, 800]
        });
        [[123, 273.15], [400, 273.15], [600, 784.65], [800, 1296.15], [1000, 1296.15]].forEach(inAndOut => {
          thermometer.io.value = inAndOut[0];
          thermometer.read();
          assert.equal(thermometer.kelvin, inAndOut[1]);
        });

        thermometer.disable();
      });

      it("should return the correct value based on scale", async function() {
        let thermometer = await new Thermometer({
          pin: 17,
          io: Analog,
          scale: [400, 800]
        });
        [[0, 673.15], [400, 829.55], [600, 907.75], [800, 985.96], [1000, 1064.16]].forEach(inAndOut => {
          thermometer.io.value = inAndOut[0];
          thermometer.read();
          assert.equal(Math.abs(thermometer.kelvin - inAndOut[1]) < 1, true);
        });

        thermometer.disable();
      });

      it("should return the correct value based on scale and range", async function() {
        let thermometer = await new Thermometer({
          pin: 17,
          io: Analog,
          range: [400, 800],
          scale: [0, 255]
        });
        [[0, 273.15], [400, 273.15], [600, 400.65], [800, 528.15], [1000, 528.15]].forEach(inAndOut => {
          thermometer.io.value = inAndOut[0];
          thermometer.read();
          assert.equal(Math.abs(thermometer.kelvin - inAndOut[1]) < 1, true);
        });

        thermometer.disable();
      });
    });

    describe("K", function() {

      it("should return the correct value", async function() {
        let thermometer = await new Thermometer({
          pin: 17,
          io: Analog
        });
        thermometer.io.value = 123;
        thermometer.read();
        assert.equal(thermometer.K, 396.15);
        thermometer.disable();
      });

      it("should return the correct value based on range", async function() {
        let thermometer = await new Thermometer({
          pin: 17,
          io: Analog,
          range: [400, 800]
        });
        [[123, 273.15], [400, 273.15], [600, 784.65], [800, 1296.15], [1000, 1296.15]].forEach(inAndOut => {
          thermometer.io.value = inAndOut[0];
          thermometer.read();
          assert.equal(thermometer.K, inAndOut[1]);
        });

        thermometer.disable();
      });

      it("should return the correct value based on scale", async function() {
        let thermometer = await new Thermometer({
          pin: 17,
          io: Analog,
          scale: [400, 800]
        });
        [[0, 673.15], [400, 829.55], [600, 907.75], [800, 985.96], [1000, 1064.16]].forEach(inAndOut => {
          thermometer.io.value = inAndOut[0];
          thermometer.read();
          assert.equal(Math.abs(thermometer.K - inAndOut[1]) < 1, true);
        });

        thermometer.disable();
      });

      it("should return the correct value based on scale and range", async function() {
        let thermometer = await new Thermometer({
          pin: 17,
          io: Analog,
          range: [400, 800],
          scale: [0, 255]
        });
        [[0, 273.15], [400, 273.15], [600, 400.65], [800, 528.15], [1000, 528.15]].forEach(inAndOut => {
          thermometer.io.value = inAndOut[0];
          thermometer.read();
          assert.equal(Math.abs(thermometer.K - inAndOut[1]) < 1, true);
        });

        thermometer.disable();
      });
    });

    describe("fahrenheit", function() {

      it("should return the correct value", async function() {
        let thermometer = await new Thermometer({
          pin: 17,
          io: Analog
        });
        thermometer.io.value = 123;
        thermometer.read();
        assert.equal(thermometer.fahrenheit, 253.4);
        thermometer.disable();
      });

      it("should return the correct value based on range", async function() {
        let thermometer = await new Thermometer({
          pin: 17,
          io: Analog,
          range: [400, 800]
        });
        [[123, 32], [400, 32], [600, 952.7], [800, 1873.4], [1000, 1873.4]].forEach(inAndOut => {
          thermometer.io.value = inAndOut[0];
          thermometer.read();
          assert.equal(thermometer.fahrenheit, inAndOut[1]);
        });

        thermometer.disable();
      });

      it("should return the correct value based on scale", async function() {
        let thermometer = await new Thermometer({
          pin: 17,
          io: Analog,
          scale: [400, 800]
        });
        [[0, 752], [400, 1033.52], [600, 1174.29], [800, 1315.05], [1000, 1455.81]].forEach(inAndOut => {
          thermometer.io.value = inAndOut[0];
          thermometer.read();
          assert.equal(Math.abs(thermometer.fahrenheit - inAndOut[1]) < 1, true);
        });

        thermometer.disable();
      });

      it("should return the correct value based on scale and range", async function() {
        let thermometer = await new Thermometer({
          pin: 17,
          io: Analog,
          range: [400, 800],
          scale: [0, 255]
        });
        [[0, 32], [400, 32], [600, 261.5], [800, 491], [1000, 491]].forEach(inAndOut => {
          thermometer.io.value = inAndOut[0];
          thermometer.read();
          assert.equal(Math.abs(thermometer.fahrenheit - inAndOut[1]) < 1, true);
        });

        thermometer.disable();
      });
    });

    describe("F", function() {

      it("should return the correct value", async function() {
        let thermometer = await new Thermometer({
          pin: 17,
          io: Analog
        });
        thermometer.io.value = 123;
        thermometer.read();
        assert.equal(thermometer.F, 253.4);
        thermometer.disable();
      });

      it("should return the correct value based on range", async function() {
        let thermometer = await new Thermometer({
          pin: 17,
          io: Analog,
          range: [400, 800]
        });
        [[123, 32], [400, 32], [600, 952.7], [800, 1873.4], [1000, 1873.4]].forEach(inAndOut => {
          thermometer.io.value = inAndOut[0];
          thermometer.read();
          assert.equal(thermometer.F, inAndOut[1]);
        });

        thermometer.disable();
      });

      it("should return the correct value based on scale", async function() {
        let thermometer = await new Thermometer({
          pin: 17,
          io: Analog,
          scale: [400, 800]
        });
        [[0, 752], [400, 1033.52], [600, 1174.29], [800, 1315.05], [1000, 1455.81]].forEach(inAndOut => {
          thermometer.io.value = inAndOut[0];
          thermometer.read();
          assert.equal(Math.abs(thermometer.F - inAndOut[1]) < 1, true);
        });

        thermometer.disable();
      });

      it("should return the correct value based on scale and range", async function() {
        let thermometer = await new Thermometer({
          pin: 17,
          io: Analog,
          range: [400, 800],
          scale: [0, 255]
        });
        [[0, 32], [400, 32], [600, 261.5], [800, 491], [1000, 491]].forEach(inAndOut => {
          thermometer.io.value = inAndOut[0];
          thermometer.read();
          assert.equal(Math.abs(thermometer.F - inAndOut[1]) < 1, true);
        });

        thermometer.disable();
      });
    });

    describe("resolution", function() {

      it("should return 2^10-1", async function() {
        let thermometer = await new Thermometer({
          pin: 17,
          io: Analog
        });
        assert.equal(thermometer.resolution, 1023);
        thermometer.disable();
      });
    });

    describe("limit", function() {

      it("should return null when limit is not set", async function() {
        let thermometer = await new Thermometer({
          pin: 17,
          io: Analog
        });
        assert.equal(thermometer.limit, null);
        thermometer.disable();
      });

      it("should return limit set in options", async function() {
        let thermometer = await new Thermometer({
          pin: 17,
          io: Analog,
          limit: [200, 823]
        });
        assert.equal(thermometer.limit[0], 200);
        assert.equal(thermometer.limit[1], 823);
        thermometer.disable();
      });

      it("should be settable", async function() {
        let thermometer = await new Thermometer({
          pin: 17,
          io: Analog,
          limit: [200, 823]
        });
        assert.equal(thermometer.limit[0], 200);
        assert.equal(thermometer.limit[1], 823);
        thermometer.limit = [300, 900];
        assert.equal(thermometer.limit[0], 300);
        assert.equal(thermometer.limit[1], 900);
        thermometer.disable();
      });

      it("should be settable", async function() {
        let thermometer = await new Thermometer({
          pin: 17,
          io: Analog,
          limit: [200, 800]
        });
        assert.equal(thermometer.limit[0], 200);
        assert.equal(thermometer.limit[1], 800);
        thermometer.limit = [300, 900];
        assert.equal(thermometer.limit[0], 300);
        assert.equal(thermometer.limit[1], 900);
        thermometer.disable();
      });

      it("should adjust when the limit changes", async function() {

        const clock = sinon.useFakeTimers();
        let thermometer = await new Thermometer({
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

        thermometer.on("limit", function(data) {
          if (data.boundary === "lower") {
            assert.equal(thermometer.raw <= 256, true);
            calls.lower++;
          } else {
            assert.equal(thermometer.raw >= 768, true);
            calls.upper++;
          }
        });

        thermometer.on("limit:lower", function(data) {
          assert.equal(thermometer.raw <= 256, true);
          calls["limit:lower"]++;
        });

        thermometer.on("limit:upper", function(data) {
          assert.equal(thermometer.raw >= 768, true);
          calls["limit:upper"]++;
        });

        clock.tick(1005);
        thermometer.io.value = 127;
        clock.tick(1005);
        thermometer.io.value = 256;
        clock.tick(1005);
        thermometer.io.value = 512;
        clock.tick(1005);
        thermometer.io.value = 768;
        clock.tick(1005);
        thermometer.io.value = 895;
        clock.tick(1005);
        thermometer.io.value = 1023;
        clock.tick(1005);

        assert.equal(calls.lower, 3);
        assert.equal(calls.upper, 3);
        assert.equal(calls["limit:lower"], 3);
        assert.equal(calls["limit:upper"], 3);

        thermometer.limit = [200, 800];

        thermometer.io.value = 127;
        clock.tick(1005);
        thermometer.io.value = 256;
        clock.tick(1005);
        thermometer.io.value = 512;
        clock.tick(1005);
        thermometer.io.value = 768;
        clock.tick(1005);
        thermometer.io.value = 895;
        clock.tick(1005);
        thermometer.io.value = 1023;
        clock.tick(1005);

        assert.equal(calls.lower, 4);
        assert.equal(calls.upper, 5);
        assert.equal(calls["limit:lower"], 4);
        assert.equal(calls["limit:upper"], 5);

        clock.restore();
        thermometer.disable();

      });

    });

    describe("threshold", function() {

      it("should return null when threshold is not set", async function() {
        let thermometer = await new Thermometer({
          pin: 17,
          io: Analog
        });
        assert.equal(thermometer.threshold, 1);
        thermometer.disable();
      });

      it("should return the threshold set in options", async function() {
        let thermometer = await new Thermometer({
          pin: 17,
          io: Analog,
          threshold: 5
        });
        assert.equal(thermometer.threshold, 5);
        thermometer.disable();
      });

      it("should be settable", async function() {
        let thermometer = await new Thermometer({
          pin: 17,
          io: Analog
        });
        assert.equal(thermometer.threshold, 1);
        thermometer.threshold = 5;
        assert.equal(thermometer.threshold, 5);
        thermometer.disable();
      });

      it("should adjust when the threshold changes", async function() {

        const clock = sinon.useFakeTimers();
        let thermometer = await new Thermometer({
          pin: 17,
          io: Analog
        });

        const changeSpy = sinon.spy();

        thermometer.on("change", changeSpy);

        clock.tick(1005);
        thermometer.io.value = 1;
        clock.tick(1005);
        thermometer.io.value = 2;
        clock.tick(1005);
        thermometer.io.value = 5;
        clock.tick(1005);
        thermometer.io.value = 7;
        clock.tick(1005);
        thermometer.io.value = 10;
        clock.tick(1005);

        assert.equal(changeSpy.callCount, 5);

        thermometer.threshold = 5;

        thermometer.io.value = 11;
        clock.tick(1005);
        thermometer.io.value = 14;
        clock.tick(1005);
        thermometer.io.value = 20;
        clock.tick(1005);
        thermometer.io.value = 25;
        clock.tick(1005);
        thermometer.io.value = 27;
        clock.tick(1005);
        thermometer.io.value = 1023;
        clock.tick(1005);

        assert.equal(changeSpy.callCount, 8);

        clock.restore();
        thermometer.disable();

      });

    });

    describe("smoothing", function() {

      it("should return 10 when smoothing options is not passed", async function() {
        let thermometer = await new Thermometer({
          pin: 17,
          io: Analog
        });
        assert.equal(thermometer.smoothing, 10);
        thermometer.disable();
      });

      it("should return the smoothing set in options", async function() {
        let thermometer = await new Thermometer({
          pin: 17,
          io: Analog,
          smoothing: 5
        });
        assert.equal(thermometer.smoothing, 5);
        thermometer.disable();
      });

      it("should be settable", async function() {
        let thermometer = await new Thermometer({
          pin: 17,
          io: Analog
        });
        assert.equal(thermometer.smoothing, 10);
        thermometer.smoothing = 5;
        assert.equal(thermometer.smoothing, 5);
        thermometer.disable();
      });

      it("should emit the correct events and values when smoothing is ", async function() {
        const clock = sinon.useFakeTimers();
        const dataSpy = sinon.spy();

        let thermometer = await new Thermometer({
          pin: 17,
          io: Analog
        });

        thermometer.on("data", dataSpy);

        [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].forEach(value => {
          thermometer.io.value = value;
          clock.tick(101);
        });
        assert.equal(dataSpy.callCount, 1);
        assert.equal(dataSpy.lastCall.args[0].celsius, 5.5);

        [11, 12, 13, 14, 15, 16, 17, 18, 19, 20].forEach(value => {
          thermometer.io.value = value;
          clock.tick(101);
        });
        assert.equal(dataSpy.callCount, 2);
        assert.equal(dataSpy.lastCall.args[0].celsius, 15.5);
      });

      it("should emit the correct events and values when smoothing is 5", async function() {
        const clock = sinon.useFakeTimers();
        const dataSpy = sinon.spy();

        let thermometer = await new Thermometer({
          pin: 17,
          io: Analog
        });

        thermometer.on("data", dataSpy);

        thermometer.smoothing = 5;

        [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].forEach(value => {
          thermometer.io.value = value;
          clock.tick(101);
        });
        assert.equal(dataSpy.callCount, 2);
        assert.equal(dataSpy.lastCall.args[0].celsius, 8);

        [11, 12, 13, 14, 15, 16, 17, 18, 19, 20].forEach(value => {
          thermometer.io.value = value;
          clock.tick(101);
        });
        assert.equal(dataSpy.callCount, 4);
        assert.equal(dataSpy.lastCall.args[0].celsius, 18);
      });

      it("should emit the correct events and values when smoothing changes", async function() {
        const clock = sinon.useFakeTimers();
        const dataSpy = sinon.spy();

        let thermometer = await new Thermometer({
          pin: 17,
          io: Analog
        });

        thermometer.on("data", dataSpy);

        thermometer.smoothing = 5;

        [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].forEach(value => {
          thermometer.io.value = value;
          clock.tick(101);
        });
        assert.equal(dataSpy.callCount, 2);
        assert.equal(dataSpy.lastCall.args[0].celsius, 8);

        thermometer.smoothing = 10;

        [11, 12, 13, 14, 15, 16, 17, 18, 19, 20].forEach(value => {
          thermometer.io.value = value;
          clock.tick(101);
        });
        assert.equal(dataSpy.callCount, 3);
        assert.equal(dataSpy.lastCall.args[0].celsius, 15.5);
      });

    });

  });

  describe("Methods", function() {

    describe("disable", function() {
      it("should disable the reading interval when called", async function() {
        const dataSpy = sinon.spy();
        const clock = sinon.useFakeTimers();

        let thermometer = await new Thermometer({
          pin: 17,
          io: Analog
        });

        thermometer.on("data", dataSpy);

        clock.tick(10000);
        assert.equal(dataSpy.callCount, 10);

        thermometer.disable();

        clock.tick(10000);
        assert.equal(dataSpy.callCount, 10);

        clock.restore();
      });
    });

    describe("enable", function() {
      it("should enable the reading interval when called", async function() {
        const dataSpy = sinon.spy();
        const clock = sinon.useFakeTimers();

        let thermometer = await new Thermometer({
          pin: 17,
          io: Analog,
          enabled: false
        });

        thermometer.on("data", dataSpy);

        clock.tick(10000);
        assert.equal(dataSpy.callCount, 0);

        thermometer.enable();

        clock.tick(10000);
        assert.equal(dataSpy.callCount, 10);

        thermometer.disable();
        clock.restore();
      });
    });

    describe("read", function() {
      it("should return the current value when called", async function() {
        const dataSpy = sinon.spy();

        let thermometer = await new Thermometer({
          pin: 17,
          io: Analog
        });

        thermometer.io.value = 123;
        assert.equal(thermometer.read(), 123);

        thermometer.io.value = 456;
        assert.equal(thermometer.read(), 456);

        thermometer.disable();
      });
    });

    describe("scale", function() {

      it("should accept two params or an array", async function() {

        let thermometer = await new Thermometer({
          pin: 17,
          io: Analog
        });

        thermometer.scale(0, 255);
        thermometer.io.value = 123;
        thermometer.read();
        assert.equal(Math.abs(thermometer.value - 31) < 1, true);

        thermometer.scale([0, 512]);
        thermometer.io.value = 123;
        thermometer.read();
        assert.equal(Math.abs(thermometer.value - 62) < 1, true);

        thermometer.disable();
      });

      it("should scale the current value when read", async function() {

        let thermometer = await new Thermometer({
          pin: 17,
          io: Analog
        });

        thermometer.io.value = 123;
        assert.equal(thermometer.read(), 123);

        thermometer.io.value = 456;
        assert.equal(thermometer.read(), 456);

        thermometer.scale(0, 255);
        thermometer.io.value = 123;
        thermometer.read();
        assert.equal(Math.abs(thermometer.value - 31) < 1, true);

        thermometer.io.value = 456;
        thermometer.read();
        assert.equal(Math.abs(thermometer.value - 114) < 1, true);

        thermometer.disable();
      });
    });

    describe("scaleto", function() {
      it("should scale the returned value only", async function() {

        let thermometer = await new Thermometer({
          pin: 17,
          io: Analog
        });

        thermometer.io.value = 123;
        assert.equal(thermometer.read(), 123);
        assert.equal(thermometer.value, 123);
        assert.equal(thermometer.scaleTo(0, 2047), 246);
        assert.equal(thermometer.scaleTo(0, 255), 30);
        assert.equal(thermometer.value, 123);

        thermometer.scale(0, 255);
        thermometer.io.value = 123;
        thermometer.read();
        assert.equal(Math.abs(thermometer.value - 30) < 1, true);
        assert.equal(Math.abs(thermometer.value - 30) !== 0, true);
        assert.equal(thermometer.scaleTo(0, 2047), 246);

        thermometer.disable();
      });
    });

    describe("fscaleto", function() {

    });

    describe("within", function() {
      it("should fire the within callback when with the range", async function() {

        const clock = sinon.useFakeTimers();
        const withinSpy = sinon.spy();

        let thermometer = await new Thermometer({
          pin: 17,
          io: Analog
        });

        thermometer.within([150, 160], withinSpy);

        thermometer.io.value = 100;
        clock.tick(5000);
        assert.equal(withinSpy.callCount, 0);

        thermometer.io.value = 155;
        clock.tick(5000);
        assert.equal(withinSpy.callCount, 5);

        thermometer.io.value = 100;
        clock.tick(5000);
        assert.equal(withinSpy.callCount, 5);

        clock.restore();
      });
    });

  });

  describe("Events", function() {

    describe("data", function() {

      it("should emit data events when enabled", async function() {

        const clock = sinon.useFakeTimers();
        const dataSpy = sinon.spy();

        let thermometer = await new Thermometer({
          pin: 17,
          io: Analog
        });

        thermometer.on("data", dataSpy);

        clock.tick(10001);
        assert.equal(dataSpy.callCount, 10);

        thermometer.disable();

        clock.tick(10001);
        assert.equal(dataSpy.callCount, 10);

        thermometer.enable();

        clock.tick(10001);
        assert.equal(dataSpy.callCount, 20);

        thermometer.disable();
        clock.restore();
      });

      it("should pass the correct value to the callback", async function() {

        const clock = sinon.useFakeTimers();
        const dataSpy = sinon.spy();

        let thermometer = await new Thermometer({
          pin: 17,
          io: Analog
        });

        thermometer.on("data", dataSpy);

        thermometer.io.value = 432;

        clock.tick(1001);
        assert.equal(dataSpy.callCount, 1);
        assert.equal(dataSpy.getCall(0).args[0].raw, 432);

        thermometer.disable();
        clock.restore();
      });

      it("should pass the scaled value to the callback", async function() {

        const clock = sinon.useFakeTimers();
        const dataSpy = sinon.spy();

        let thermometer = await new Thermometer({
          pin: 17,
          io: Analog,
          scale: [0, 255]
        });

        thermometer.on("data", dataSpy);

        thermometer.io.value = 432;

        clock.tick(1001);
        assert.equal(dataSpy.callCount, 1);
        assert.equal(thermometer.raw, 432);
        assert.equal(Math.abs(dataSpy.getCall(0).args[0].celsius - 107.68) <= 0.1, true);

        thermometer.disable();
        clock.restore();
      });

    });

    describe("change", function() {
      it("should emit change events when enabled", async function() {

        const clock = sinon.useFakeTimers();
        const changeSpy = sinon.spy();

        let thermometer = await new Thermometer({
          pin: 17,
          io: Analog
        });

        thermometer.on("change", changeSpy);

        clock.tick(1001);
        assert.equal(changeSpy.callCount, 0);

        thermometer.io.value = 123;
        clock.tick(1001);
        assert.equal(changeSpy.callCount, 1);

        thermometer.disable();
        thermometer.io.value = 234;
        clock.tick(1001);
        assert.equal(changeSpy.callCount, 1);

        thermometer.enable();
        thermometer.io.value = 456;
        clock.tick(1001);
        assert.equal(changeSpy.callCount, 2);

        thermometer.disable();
        clock.restore();
      });

      it("should pass the correct value to the callback", async function() {

        const clock = sinon.useFakeTimers();
        const changeSpy = sinon.spy();

        let thermometer = await new Thermometer({
          pin: 17,
          io: Analog
        });

        thermometer.on("change", changeSpy);

        clock.tick(1001);
        assert.equal(changeSpy.callCount, 0);

        thermometer.io.value = 123;
        clock.tick(1001);
        assert.equal(changeSpy.callCount, 1);
        assert.equal(changeSpy.getCall(0).args[0].raw, 123);
        assert.equal(thermometer.value, 123);

        thermometer.disable();
        thermometer.io.value = 234;
        clock.tick(1001);
        assert.equal(changeSpy.callCount, 1);
        assert.equal(thermometer.value, 123);

        thermometer.enable();
        thermometer.io.value = 456;
        clock.tick(1001);
        assert.equal(changeSpy.callCount, 2);
        assert.equal(changeSpy.getCall(1).args[0].raw, 456);
        assert.equal(thermometer.value, 456);

        thermometer.io.value = 432;

        clock.tick(1001);
        assert.equal(changeSpy.callCount, 3);
        assert.equal(changeSpy.getCall(2).args[0].raw, 432);

        thermometer.disable();
        clock.restore();
      });

      it("should pass the scaled value to the callback", async function() {

        const clock = sinon.useFakeTimers();
        const changeSpy = sinon.spy();

        let thermometer = await new Thermometer({
          pin: 17,
          io: Analog,
          scale: [0, 255]
        });

        thermometer.on("change", changeSpy);

        clock.tick(1001);
        assert.equal(changeSpy.callCount, 0);

        thermometer.io.value = 123;
        clock.tick(1001);
        assert.equal(changeSpy.callCount, 1);
        assert.equal(Math.abs(changeSpy.getCall(0).args[0].celsius - 31) <= 1, true);
        assert.equal(Math.abs(thermometer.value - 30) !== 0, true);

        thermometer.disable();
        thermometer.io.value = 234;
        clock.tick(1001);
        assert.equal(changeSpy.callCount, 1);
        assert.equal(Math.abs(thermometer.value - 30) !== 0, true);

        thermometer.enable();
        thermometer.io.value = 456;
        clock.tick(1001);
        assert.equal(changeSpy.callCount, 2);
        assert.equal(Math.abs(changeSpy.getCall(1).args[0].celsius - 114) <= 1, true);
        assert.equal(Math.abs(thermometer.value - 114) !== 0, true);

        thermometer.io.value = 432;

        clock.tick(1001);
        assert.equal(changeSpy.callCount, 3);
        assert.equal(Math.abs(changeSpy.getCall(2).args[0].celsius - 108) <= 1, true);

        thermometer.disable();
        clock.restore();
      });
    });

    describe("limit", function() {

      it("should emit limit events when enabled", async function() {

        const clock = sinon.useFakeTimers();
        let thermometer = await new Thermometer({
          pin: 17,
          io: Analog,
          limit: [256, 768]
        });

        const calls = {
          "lower": 0,
          "upper": 0
        };

        thermometer.on("limit", function(data) {
          if (data.boundary === "lower") {
            assert.equal(thermometer.raw <= 256, true);
            calls.lower++;
          } else {
            assert.equal(thermometer.raw >= 768, true);
            calls.upper++;
          }
        });

        clock.tick(1005);
        thermometer.io.value = 127;
        clock.tick(1005);
        thermometer.io.value = 256;
        clock.tick(1005);
        thermometer.io.value = 512;
        clock.tick(1005);
        thermometer.io.value = 768;
        clock.tick(1005);
        thermometer.io.value = 895;
        clock.tick(1005);
        thermometer.io.value = 1023;
        clock.tick(1005);

        assert.equal(calls.lower, 3);
        assert.equal(calls.upper, 3);

        thermometer.disable();

        clock.tick(1005);
        thermometer.io.value = 127;
        clock.tick(1005);
        thermometer.io.value = 256;
        clock.tick(1005);
        thermometer.io.value = 512;
        clock.tick(1005);
        thermometer.io.value = 768;
        clock.tick(1005);
        thermometer.io.value = 895;
        clock.tick(1005);
        thermometer.io.value = 1023;
        clock.tick(1005);

        assert.equal(calls.lower, 3);
        assert.equal(calls.upper, 3);

        thermometer.enable();

        clock.tick(1005);
        thermometer.io.value = 127;
        clock.tick(1005);
        thermometer.io.value = 256;
        clock.tick(1005);
        thermometer.io.value = 512;
        clock.tick(1005);
        thermometer.io.value = 768;
        clock.tick(1005);
        thermometer.io.value = 895;
        clock.tick(1005);
        thermometer.io.value = 1023;
        clock.tick(1005);

        assert.equal(calls.lower, 5);
        assert.equal(calls.upper, 7);

        clock.restore();
        thermometer.disable();

      });

    });

    describe("limit:lower", function() {
      it("should emit limit:lower events when enabled", async function() {

        const clock = sinon.useFakeTimers();
        let thermometer = await new Thermometer({
          pin: 17,
          io: Analog,
          limit: [256, 768]
        });

        const calls = {
          "limit:lower": 0
        };

        thermometer.on("limit:lower", function(data) {
          assert.equal(thermometer.raw <= 256, true);
          calls["limit:lower"]++;
        });

        clock.tick(1005);
        thermometer.io.value = 127;
        clock.tick(1005);
        thermometer.io.value = 256;
        clock.tick(1005);
        thermometer.io.value = 512;
        clock.tick(1005);
        thermometer.io.value = 768;
        clock.tick(1005);
        thermometer.io.value = 895;
        clock.tick(1005);
        thermometer.io.value = 1023;
        clock.tick(1005);

        assert.equal(calls["limit:lower"], 3);

        thermometer.disable();

        clock.tick(1005);
        thermometer.io.value = 127;
        clock.tick(1005);
        thermometer.io.value = 256;
        clock.tick(1005);
        thermometer.io.value = 512;
        clock.tick(1005);
        thermometer.io.value = 768;
        clock.tick(1005);
        thermometer.io.value = 895;
        clock.tick(1005);
        thermometer.io.value = 1023;
        clock.tick(1005);

        assert.equal(calls["limit:lower"], 3);

        thermometer.enable();

        clock.tick(1005);
        thermometer.io.value = 127;
        clock.tick(1005);
        thermometer.io.value = 256;
        clock.tick(1005);
        thermometer.io.value = 512;
        clock.tick(1005);
        thermometer.io.value = 768;
        clock.tick(1005);
        thermometer.io.value = 895;
        clock.tick(1005);
        thermometer.io.value = 1023;
        clock.tick(1005);

        assert.equal(calls["limit:lower"], 5);

        clock.restore();
        thermometer.disable();

      });
    });

    describe("limit:upper", function() {
      it("should emit limit:upper events when enabled", async function() {

        const clock = sinon.useFakeTimers();
        let thermometer = await new Thermometer({
          pin: 17,
          io: Analog,
          limit: [256, 768]
        });

        const calls = {
          "limit:upper": 0
        };

        thermometer.on("limit:upper", function(data) {
          assert.equal(thermometer.raw >= 768, true);
          calls["limit:upper"]++;
        });

        clock.tick(1005);
        thermometer.io.value = 127;
        clock.tick(1005);
        thermometer.io.value = 256;
        clock.tick(1005);
        thermometer.io.value = 512;
        clock.tick(1005);
        thermometer.io.value = 768;
        clock.tick(1005);
        thermometer.io.value = 895;
        clock.tick(1005);
        thermometer.io.value = 1023;
        clock.tick(1005);

        assert.equal(calls["limit:upper"], 3);

        thermometer.disable();

        clock.tick(1005);
        thermometer.io.value = 127;
        clock.tick(1005);
        thermometer.io.value = 256;
        clock.tick(1005);
        thermometer.io.value = 512;
        clock.tick(1005);
        thermometer.io.value = 768;
        clock.tick(1005);
        thermometer.io.value = 895;
        clock.tick(1005);
        thermometer.io.value = 1023;
        clock.tick(1005);

        assert.equal(calls["limit:upper"], 3);

        thermometer.enable();

        clock.tick(1005);
        thermometer.io.value = 127;
        clock.tick(1005);
        thermometer.io.value = 256;
        clock.tick(1005);
        thermometer.io.value = 512;
        clock.tick(1005);
        thermometer.io.value = 768;
        clock.tick(1005);
        thermometer.io.value = 895;
        clock.tick(1005);
        thermometer.io.value = 1023;
        clock.tick(1005);

        assert.equal(calls["limit:upper"], 7);

        clock.restore();
        thermometer.disable();

      });
    });

    describe("raw", function() {
      it("should emit data events when enabled", async function() {

        const clock = sinon.useFakeTimers();
        const rawSpy = sinon.spy();

        let thermometer = await new Thermometer({
          pin: 17,
          io: Analog
        });

        thermometer.on("raw", rawSpy);

        clock.tick(10001);
        assert.equal(rawSpy.callCount, 100);

        thermometer.disable();

        clock.tick(10001);
        assert.equal(rawSpy.callCount, 100);

        thermometer.enable();

        clock.tick(10001);
        assert.equal(rawSpy.callCount, 200);

        thermometer.disable();
        clock.restore();
      });

      it("should pass the correct value to the callback", async function() {

        const clock = sinon.useFakeTimers();
        const rawSpy = sinon.spy();

        let thermometer = await new Thermometer({
          pin: 17,
          io: Analog
        });

        thermometer.on("raw", rawSpy);

        thermometer.io.value = 432;

        clock.tick(1001);
        assert.equal(rawSpy.callCount, 10);
        assert.equal(rawSpy.getCall(0).args[0], 432);

        thermometer.disable();
        clock.restore();
      });
    });

  });

});
