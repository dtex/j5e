import assert from "assert";
import sinon from "sinon";
import { Analog } from "@dtex/mock-io";
import Light from "j5e/light";
import Sensor from "j5e/sensor";
import { Emitter } from "j5e/event";
import Withinable from "j5e/withinable";

describe("Light", function() {

  describe("Instantiation", async function() {

    it("should return a valid Light instance when passed an options object", async function() {
      let light = await new Light({
        pin: 17,
        io: Analog
      });
      assert.equal(light instanceof Light, true);
      assert.equal(light instanceof Sensor, true);
      assert.equal(light instanceof Emitter, true);
      assert.equal(light instanceof Withinable, true);
      assert.equal(light.io instanceof Analog, true);
      light.disable();
    });

    it("should return the correct default property values", async function() {
      let light = await new Light({
        pin: 17,
        io: Analog
      });
      assert.equal(light.interval, 100);
      assert.equal(light.smoothing, 10);
      assert.equal(light.raw, null);
      assert.equal(light.value, null);
      assert.equal(light.median, null);
      assert.equal(light.last, null);
      assert.equal(light.threshold, 1);
      assert.equal(light.limit, null);
      assert.equal(light.resolution, 1023);
      light.disable();
    });

    it("should make 10 readings per second", async function() {
      const clock = sinon.useFakeTimers();
      let light = await new Light({
        pin: 17,
        io: Analog
      });
      const readSpy = sinon.spy(light.io, "read");
      clock.tick(1050);
      assert.equal(readSpy.callCount, 10);
      clock.restore();
      light.disable();
    });

    describe("Options", function() {
      describe("enabled", function() {

        it("should return the correct default property values", async function() {

          let light = await new Light({
            pin: 17,
            io: Analog,
            enabled: false
          });
          assert.equal(light.interval, null);
          assert.equal(light.smoothing, 10);
          assert.equal(light.raw, null);
          assert.equal(light.value, null);
          assert.equal(light.median, null);
          assert.equal(light.last, null);
          assert.equal(light.threshold, 1);
          assert.equal(light.limit, null);
          assert.equal(light.resolution, 1023);

          light.disable();

        });

        it("should not start making readings", async function() {

          const clock = sinon.useFakeTimers();
          let light = await new Light({
            pin: 17,
            io: Analog,
            enabled: false
          });

          const writeSpy = sinon.spy(light.io, "read");

          clock.tick(1050);
          assert.equal(writeSpy.callCount, 0);
          clock.restore();

          light.disable();

        });

      });

      describe("interval", function() {

        it("should return the correct default property values", async function() {

          let light = await new Light({
            pin: 17,
            io: Analog,
            interval: 50
          });
          assert.equal(light.interval, 50);
          assert.equal(light.smoothing, 10);
          assert.equal(light.raw, null);
          assert.equal(light.value, null);
          assert.equal(light.median, null);
          assert.equal(light.last, null);
          assert.equal(light.threshold, 1);
          assert.equal(light.limit, null);
          assert.equal(light.resolution, 1023);

          light.disable();

        });

        it("should make 20 readings per second", async function() {

          const clock = sinon.useFakeTimers();
          let light = await new Light({
            pin: 17,
            io: Analog,
            interval: 50
          });

          const writeSpy = sinon.spy(light.io, "read");

          clock.tick(1005);
          assert.equal(writeSpy.callCount, 20);
          clock.restore();

          light.disable();

        });

      });

      describe("range", function() {

        it("should return the correct default property values", async function() {

          let light = await new Light({
            pin: 17,
            io: Analog,
            range: [256, 758]
          });
          assert.equal(light.interval, 100);
          assert.equal(light.smoothing, 10);
          assert.equal(light.raw, null);
          assert.equal(light.value, null);
          assert.equal(light.median, null);
          assert.equal(light.last, null);
          assert.equal(light.threshold, 1);
          assert.equal(light.limit, null);
          assert.equal(light.resolution, 1023);

          light.disable();

        });

        it("should map value properly", async function() {

          let light = await new Light({
            pin: 17,
            io: Analog,
            range: [256, 768]
          });

          light.io.value = 0;
          assert.equal(light.raw, null);
          assert.equal(light.value, null);
          light.read();
          assert.equal(light.raw, 0);
          assert.equal(light.value, 0);
          light.io.value = 127;
          light.read();
          assert.equal(light.raw, 127);
          assert.equal(light.value, 0);
          light.io.value = 256;
          light.read();
          assert.equal(light.raw, 256);
          assert.equal(light.value, 0);
          light.io.value = 512;
          light.read();
          assert.equal(light.raw, 512);
          assert.equal(light.value, 511.5);
          light.io.value = 768;
          light.read();
          assert.equal(light.raw, 768);
          assert.equal(light.value, 1023);
          light.io.value = 1023;
          light.read();
          assert.equal(light.raw, 1023);
          assert.equal(light.value, 1023);

          light.disable();

        });

      });

      describe("limit", function() {

        it("should return the correct default property values", async function() {

          let light = await new Light({
            pin: 17,
            io: Analog,
            limit: [256, 758]
          });

          assert.equal(light.interval, 100);
          assert.equal(light.smoothing, 10);
          assert.equal(light.raw, null);
          assert.equal(light.value, null);
          assert.equal(light.median, null);
          assert.equal(light.last, null);
          assert.equal(light.threshold, 1);
          assert.equal(light.limit[0], 256);
          assert.equal(light.limit[1], 758);
          assert.equal(light.resolution, 1023);

          light.disable();

        });

        it("should emit upper and lower limit events", async function() {

          const clock = sinon.useFakeTimers();
          let light = await new Light({
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
          light.on("limit", function(data) {
            if (data.boundary === "lower") {
              assert.equal(light.raw <= 256, true);
              calls.lower++;
            } else {
              assert.equal(light.raw >= 768, true);
              calls.upper++;
            }
          });

          light.on("limit:lower", function(data) {
            assert.equal(light.raw <= 256, true);
            calls["limit:lower"]++;
          });

          light.on("limit:upper", function(data) {
            assert.equal(light.raw >= 768, true);
            calls["limit:upper"]++;
          });

          clock.tick(1005);
          light.io.value = 127;
          clock.tick(1005);
          light.io.value = 256;
          clock.tick(1005);
          light.io.value = 512;
          clock.tick(1005);
          light.io.value = 768;
          clock.tick(1005);
          light.io.value = 895;
          clock.tick(1005);
          light.io.value = 1023;
          clock.tick(1005);

          assert.equal(calls.lower, 3);
          assert.equal(calls.upper, 3);
          assert.equal(calls["limit:lower"], 3);
          assert.equal(calls["limit:upper"], 3);

          clock.restore();
          light.disable();

        });

      });

      describe("threshold", function() {

        it("should return the correct default property values", async function() {

          let light = await new Light({
            pin: 17,
            io: Analog,
            threshold: 20
          });

          assert.equal(light.interval, 100);
          assert.equal(light.smoothing, 10);
          assert.equal(light.raw, null);
          assert.equal(light.value, null);
          assert.equal(light.median, null);
          assert.equal(light.last, null);
          assert.equal(light.threshold, 20);
          assert.equal(light.limit, null);
          assert.equal(light.resolution, 1023);

          light.disable();

        });

        it("should emit change event when the threshold is exceeded", async function() {


          const clock = sinon.useFakeTimers();
          let light = await new Light({
            pin: 17,
            io: Analog,
            threshold: 20
          });

          let last = 0;
          let count = 0;
          light.on("change", function(data) {
            assert(Math.abs(data - last) >= 20, true);
            last = data;
            count++;
          });

          clock.tick(1005);
          light.io.value = 10;
          clock.tick(1005);
          clock.tick(1005);
          light.io.value = 100;
          light.io.value = 20;
          clock.tick(1005);
          light.io.value = 110;
          clock.tick(1005);
          light.io.value = 900;
          clock.tick(1005);
          light.io.value = 919;
          clock.tick(1005);
          light.io.value = 920;
          clock.tick(1005);

          assert.equal(count, 4);

          light.disable();

        });

      });
    });
  });

  describe("Properties", function() {

    describe("interval", function() {

      it("should return the correct default value", async function() {
        let light = await new Light({
          pin: 17,
          io: Analog
        });
        assert.equal(light.interval, 100);
        light.disable();
      });

      it("should run at the correct default frequency", async function() {
        const clock = sinon.useFakeTimers();
        let light = await new Light({
          pin: 17,
          io: Analog
        });
        const readSpy = sinon.spy(light.io, "read");
        clock.tick(1050);
        assert.equal(readSpy.callCount, 10);
        clock.restore();
        light.disable();
      });

      it("should return the correct value when passed the interval param", async function() {
        let light = await new Light({
          pin: 17,
          io: Analog,
          interval: 10
        });
        assert.equal(light.interval, 10);
        light.disable();
      });

      it("should run at the correct frequency when passed the interval param", async function() {
        const clock = sinon.useFakeTimers();
        let light = await new Light({
          pin: 17,
          io: Analog,
          interval: 10
        });
        const readSpy = sinon.spy(light.io, "read");
        clock.tick(1005);
        assert.equal(readSpy.callCount, 100);
        clock.restore();
        light.disable();
      });

      it("should return the correct value when set", async function() {
        let light = await new Light({
          pin: 17,
          io: Analog,
          interval: 10
        });
        light.interval = 20;
        assert.equal(light.interval, 20);
        light.disable();
      });

      it("should run at the correct frequency when set", async function() {
        const clock = sinon.useFakeTimers();
        let light = await new Light({
          pin: 17,
          io: Analog,
          interval: 10
        });
        light.interval = 20;
        const readSpy = sinon.spy(light.io, "read");
        clock.tick(1005);
        assert.equal(readSpy.callCount, 50);
        clock.restore();
        light.disable();
      });

    });

    describe("raw", function() {

      it("should return the correct value", async function() {
        let light = await new Light({
          pin: 17,
          io: Analog
        });
        light.io.value = 123;
        light.read();
        assert.equal(light.raw, 123);
        light.disable();
      });

      it("should return the correct value regardless of range", async function() {
        let light = await new Light({
          pin: 17,
          io: Analog,
          range: [400, 800]
        });
        light.io.value = 123;
        light.read();
        assert.equal(light.raw, 123);
        light.disable();
      });

      it("should return the correct value regardless of limit", async function() {
        let light = await new Light({
          pin: 17,
          io: Analog,
          limit: [400, 800]
        });
        light.io.value = 123;
        light.read();
        assert.equal(light.raw, 123);
        light.disable();
      });

      it("should return the correct value regardless of scale", async function() {
        let light = await new Light({
          pin: 17,
          io: Analog,
          scale: [400, 800]
        });
        light.io.value = 123;
        light.read();
        assert.equal(light.raw, 123);
        light.disable();
      });

    });

    describe("value", function() {

      it("should return the correct value", async function() {
        let light = await new Light({
          pin: 17,
          io: Analog
        });
        light.io.value = 123;
        light.read();
        assert.equal(light.value, 123);
        light.disable();
      });

      it("should return the correct value based on range", async function() {
        let light = await new Light({
          pin: 17,
          io: Analog,
          range: [400, 800]
        });
        [[123, 0], [400, 0], [600, 511.5], [800, 1023], [1000, 1023]].forEach(inAndOut => {
          light.io.value = inAndOut[0];
          light.read();
          assert.equal(light.value, inAndOut[1]);
        });

        light.disable();
      });

      it("should return the correct value based on scale", async function() {
        let light = await new Light({
          pin: 17,
          io: Analog,
          scale: [400, 800]
        });
        [[0, 400], [400, 556], [600, 634], [800, 712], [1000, 791]].forEach(inAndOut => {
          light.io.value = inAndOut[0];
          light.read();
          assert.equal(Math.abs(light.value - inAndOut[1]) < 1, true);
        });

        light.disable();
      });

      it("should return the correct value based on scale and range", async function() {
        let light = await new Light({
          pin: 17,
          io: Analog,
          range: [400, 800],
          scale: [0, 255]
        });
        [[0, 0], [400, 0], [600, 127.5], [800, 255], [1000, 255]].forEach(inAndOut => {
          light.io.value = inAndOut[0];
          light.read();
          assert.equal(Math.abs(light.value - inAndOut[1]) < 1, true);
        });

        light.disable();
      });
    });

    describe("level", function() {

      it("should return the correct value", async function() {
        const clock = sinon.useFakeTimers();

        let light = await new Light({
          pin: 17,
          io: Analog
        });

        light.io.value = 123;
        light.read();
        clock.tick(1000);
        assert.equal(light.level, 0.12);
        light.disable();
      });

      it("should return the correct value based on range", async function() {

        const light = await new Light({
          pin: 17,
          io: Analog,
          range: [400, 800]
        });

        [[123, 0.12], [400, 0.39], [600, 0.59], [800, 0.78], [1000, 0.98]].forEach(inAndOut => {
          light.io.value = inAndOut[0];
          light.read();
          assert.equal(light.level, inAndOut[1]);
        });

        light.disable();

      });

      it("should return the correct value based on scale", async function() {
        let light = await new Light({
          pin: 17,
          io: Analog,
          scale: [400, 800]
        });
        [[0, 0], [400, 0], [600, 0.5], [800, 1], [1000, 1]].forEach(inAndOut => {
          light.io.value = inAndOut[0];
          light.read();
          assert.equal(light.level, inAndOut[1]);
        });

        light.disable();
      });

      it("should return the correct value based on scale and range", async function() {
        let light = await new Light({
          pin: 17,
          io: Analog,
          range: [400, 800],
          scale: [0, 255]
        });
        [[0, 0], [400, 1], [600, 1], [800, 1], [1000, 1]].forEach(inAndOut => {
          light.io.value = inAndOut[0];
          light.read();
          assert.equal(light.level, inAndOut[1]);
        });

        light.disable();
      });
    });

    describe("scaled", function() {

      it("should return the correct value", async function() {
        let light = await new Light({
          pin: 17,
          io: Analog
        });
        light.io.value = 123;
        light.read();
        assert.equal(light.scaled, 123);
        light.disable();
      });

      it("should return the correct value based on range", async function() {
        let light = await new Light({
          pin: 17,
          io: Analog,
          range: [400, 800]
        });
        [[123, 0], [400, 0], [600, 511.5], [800, 1023], [1000, 1023]].forEach(inAndOut => {
          light.io.value = inAndOut[0];
          light.read();
          assert.equal(light.scaled, inAndOut[1]);
        });

        light.disable();
      });

      it("should return the correct value based on scale", async function() {
        let light = await new Light({
          pin: 17,
          io: Analog,
          scale: [400, 800]
        });
        [[0, 400], [400, 556], [600, 634], [800, 712], [1000, 791]].forEach(inAndOut => {
          light.io.value = inAndOut[0];
          light.read();
          assert.equal(Math.abs(light.scaled - inAndOut[1]) < 1, true);
        });

        light.disable();
      });

      it("should return the correct value based on scale and range", async function() {
        let light = await new Light({
          pin: 17,
          io: Analog,
          range: [400, 800],
          scale: [0, 255]
        });
        [[0, 0], [400, 0], [600, 127.5], [800, 255], [1000, 255]].forEach(inAndOut => {
          light.io.value = inAndOut[0];
          light.read();
          assert.equal(Math.abs(light.scaled - inAndOut[1]) < 1, true);
        });

        light.disable();
      });
    });

    describe("resolution", function() {

      it("should return 2^10-1", async function() {
        let light = await new Light({
          pin: 17,
          io: Analog
        });
        assert.equal(light.resolution, 1023);
        light.disable();
      });
    });

    describe("limit", function() {

      it("should return null when limit is not set", async function() {
        let light = await new Light({
          pin: 17,
          io: Analog
        });
        assert.equal(light.limit, null);
        light.disable();
      });

      it("should return limit set in options", async function() {
        let light = await new Light({
          pin: 17,
          io: Analog,
          limit: [200, 823]
        });
        assert.equal(light.limit[0], 200);
        assert.equal(light.limit[1], 823);
        light.disable();
      });

      it("should be settable", async function() {
        let light = await new Light({
          pin: 17,
          io: Analog,
          limit: [200, 823]
        });
        assert.equal(light.limit[0], 200);
        assert.equal(light.limit[1], 823);
        light.limit = [300, 900];
        assert.equal(light.limit[0], 300);
        assert.equal(light.limit[1], 900);
        light.disable();
      });

      it("should be settable", async function() {
        let light = await new Light({
          pin: 17,
          io: Analog,
          limit: [200, 800]
        });
        assert.equal(light.limit[0], 200);
        assert.equal(light.limit[1], 800);
        light.limit = [300, 900];
        assert.equal(light.limit[0], 300);
        assert.equal(light.limit[1], 900);
        light.disable();
      });

      it("should adjust when the limit changes", async function() {

        const clock = sinon.useFakeTimers();
        let light = await new Light({
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

        light.on("limit", function(data) {
          if (data.boundary === "lower") {
            assert.equal(light.raw <= 256, true);
            calls.lower++;
          } else {
            assert.equal(light.raw >= 768, true);
            calls.upper++;
          }
        });

        light.on("limit:lower", function(data) {
          assert.equal(light.raw <= 256, true);
          calls["limit:lower"]++;
        });

        light.on("limit:upper", function(data) {
          assert.equal(light.raw >= 768, true);
          calls["limit:upper"]++;
        });

        clock.tick(1005);
        light.io.value = 127;
        clock.tick(1005);
        light.io.value = 256;
        clock.tick(1005);
        light.io.value = 512;
        clock.tick(1005);
        light.io.value = 768;
        clock.tick(1005);
        light.io.value = 895;
        clock.tick(1005);
        light.io.value = 1023;
        clock.tick(1005);

        assert.equal(calls.lower, 3);
        assert.equal(calls.upper, 3);
        assert.equal(calls["limit:lower"], 3);
        assert.equal(calls["limit:upper"], 3);

        light.limit = [200, 800];

        light.io.value = 127;
        clock.tick(1005);
        light.io.value = 256;
        clock.tick(1005);
        light.io.value = 512;
        clock.tick(1005);
        light.io.value = 768;
        clock.tick(1005);
        light.io.value = 895;
        clock.tick(1005);
        light.io.value = 1023;
        clock.tick(1005);

        assert.equal(calls.lower, 4);
        assert.equal(calls.upper, 5);
        assert.equal(calls["limit:lower"], 4);
        assert.equal(calls["limit:upper"], 5);

        clock.restore();
        light.disable();

      });

    });

    describe("threshold", function() {

      it("should return null when threshold is not set", async function() {
        let light = await new Light({
          pin: 17,
          io: Analog
        });
        assert.equal(light.threshold, 1);
        light.disable();
      });

      it("should return the threshold set in options", async function() {
        let light = await new Light({
          pin: 17,
          io: Analog,
          threshold: 5
        });
        assert.equal(light.threshold, 5);
        light.disable();
      });

      it("should be settable", async function() {
        let light = await new Light({
          pin: 17,
          io: Analog
        });
        assert.equal(light.threshold, 1);
        light.threshold = 5;
        assert.equal(light.threshold, 5);
        light.disable();
      });

      it("should adjust when the threshold changes", async function() {

        const clock = sinon.useFakeTimers();
        let light = await new Light({
          pin: 17,
          io: Analog
        });

        const changeSpy = sinon.spy();

        light.on("change", changeSpy);

        clock.tick(1005);
        light.io.value = 1;
        clock.tick(1005);
        light.io.value = 2;
        clock.tick(1005);
        light.io.value = 5;
        clock.tick(1005);
        light.io.value = 7;
        clock.tick(1005);
        light.io.value = 10;
        clock.tick(1005);

        assert.equal(changeSpy.callCount, 5);

        light.threshold = 5;

        light.io.value = 11;
        clock.tick(1005);
        light.io.value = 14;
        clock.tick(1005);
        light.io.value = 20;
        clock.tick(1005);
        light.io.value = 25;
        clock.tick(1005);
        light.io.value = 27;
        clock.tick(1005);
        light.io.value = 1023;
        clock.tick(1005);

        assert.equal(changeSpy.callCount, 8);

        clock.restore();
        light.disable();

      });

    });

    describe("smoothing", function() {

      it("should return 10 when smoothing options is not passed", async function() {
        let light = await new Light({
          pin: 17,
          io: Analog
        });
        assert.equal(light.smoothing, 10);
        light.disable();
      });

      it("should return the smoothing set in options", async function() {
        let light = await new Light({
          pin: 17,
          io: Analog,
          smoothing: 5
        });
        assert.equal(light.smoothing, 5);
        light.disable();
      });

      it("should be settable", async function() {
        let light = await new Light({
          pin: 17,
          io: Analog
        });
        assert.equal(light.smoothing, 10);
        light.smoothing = 5;
        assert.equal(light.smoothing, 5);
        light.disable();
      });

      it("should emit the correct events and values when smoothing is ", async function() {
        const clock = sinon.useFakeTimers();
        const dataSpy = sinon.spy();

        let light = await new Light({
          pin: 17,
          io: Analog
        });

        light.on("data", dataSpy);

        [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].forEach(value => {
          light.io.value = value;
          clock.tick(101);
        });
        assert.equal(dataSpy.callCount, 1);
        assert.equal(dataSpy.lastCall.args, 6);

        [11, 12, 13, 14, 15, 16, 17, 18, 19, 20].forEach(value => {
          light.io.value = value;
          clock.tick(101);
        });
        assert.equal(dataSpy.callCount, 2);
        assert.equal(dataSpy.lastCall.args, 16);
      });

      it("should emit the correct events and values when smoothing is 5", async function() {
        const clock = sinon.useFakeTimers();
        const dataSpy = sinon.spy();

        let light = await new Light({
          pin: 17,
          io: Analog
        });

        light.on("data", dataSpy);

        light.smoothing = 5;

        [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].forEach(value => {
          light.io.value = value;
          clock.tick(101);
        });
        assert.equal(dataSpy.callCount, 2);
        assert.equal(dataSpy.lastCall.args, 8);

        [11, 12, 13, 14, 15, 16, 17, 18, 19, 20].forEach(value => {
          light.io.value = value;
          clock.tick(101);
        });
        assert.equal(dataSpy.callCount, 4);
        assert.equal(dataSpy.lastCall.args, 18);
      });

      it("should emit the correct events and values when smoothing changes", async function() {
        const clock = sinon.useFakeTimers();
        const dataSpy = sinon.spy();

        let light = await new Light({
          pin: 17,
          io: Analog
        });

        light.on("data", dataSpy);

        light.smoothing = 5;

        [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].forEach(value => {
          light.io.value = value;
          clock.tick(101);
        });
        assert.equal(dataSpy.callCount, 2);
        assert.equal(dataSpy.lastCall.args, 8);

        light.smoothing = 10;

        [11, 12, 13, 14, 15, 16, 17, 18, 19, 20].forEach(value => {
          light.io.value = value;
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

        let light = await new Light({
          pin: 17,
          io: Analog
        });

        light.on("data", dataSpy);

        clock.tick(10000);
        assert.equal(dataSpy.callCount, 10);

        light.disable();

        clock.tick(10000);
        assert.equal(dataSpy.callCount, 10);

        clock.restore();
      });
    });

    describe("enable", function() {
      it("should enable the reading interval when called", async function() {
        const dataSpy = sinon.spy();
        const clock = sinon.useFakeTimers();

        let light = await new Light({
          pin: 17,
          io: Analog,
          enabled: false
        });

        light.on("data", dataSpy);

        clock.tick(10000);
        assert.equal(dataSpy.callCount, 0);

        light.enable();

        clock.tick(10000);
        assert.equal(dataSpy.callCount, 10);

        light.disable();
        clock.restore();
      });
    });

    describe("read", function() {
      it("should return the current value when called", async function() {
        const dataSpy = sinon.spy();

        let light = await new Light({
          pin: 17,
          io: Analog
        });

        light.io.value = 123;
        assert.equal(light.read(), 123);

        light.io.value = 456;
        assert.equal(light.read(), 456);

        light.disable();
      });
    });

    describe("scale", function() {

      it("should accept two params or an array", async function() {

        let light = await new Light({
          pin: 17,
          io: Analog
        });

        light.scale(0, 255);
        light.io.value = 123;
        light.read();
        assert.equal(Math.abs(light.value - 31) < 1, true);

        light.scale([0, 512]);
        light.io.value = 123;
        light.read();
        assert.equal(Math.abs(light.value - 62) < 1, true);

        light.disable();
      });

      it("should scale the current value when read", async function() {

        let light = await new Light({
          pin: 17,
          io: Analog
        });

        light.io.value = 123;
        assert.equal(light.read(), 123);

        light.io.value = 456;
        assert.equal(light.read(), 456);

        light.scale(0, 255);
        light.io.value = 123;
        light.read();
        assert.equal(Math.abs(light.value - 31) < 1, true);

        light.io.value = 456;
        light.read();
        assert.equal(Math.abs(light.value - 114) < 1, true);

        light.disable();
      });
    });

    describe("scaleto", function() {
      it("should scale the returned value only", async function() {

        let light = await new Light({
          pin: 17,
          io: Analog
        });

        light.io.value = 123;
        assert.equal(light.read(), 123);
        assert.equal(light.value, 123);
        assert.equal(light.scaleTo(0, 2047), 246);
        assert.equal(light.scaleTo(0, 255), 30);
        assert.equal(light.value, 123);

        light.scale(0, 255);
        light.io.value = 123;
        light.read();
        assert.equal(Math.abs(light.value - 30) < 1, true);
        assert.equal(Math.abs(light.value - 30) !== 0, true);
        assert.equal(light.scaleTo(0, 2047), 246);

        light.disable();
      });
    });

    describe("fscaleto", function() {

    });

    describe("within", function() {
      it("should fire the within callback when with the range", async function() {

        const clock = sinon.useFakeTimers();
        const withinSpy = sinon.spy();

        let light = await new Light({
          pin: 17,
          io: Analog
        });

        light.within([150, 160], withinSpy);

        light.io.value = 100;
        clock.tick(5000);
        assert.equal(withinSpy.callCount, 0);

        light.io.value = 155;
        clock.tick(5000);
        assert.equal(withinSpy.callCount, 5);

        light.io.value = 100;
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

        let light = await new Light({
          pin: 17,
          io: Analog
        });

        light.on("data", dataSpy);

        clock.tick(10001);
        assert.equal(dataSpy.callCount, 10);

        light.disable();

        clock.tick(10001);
        assert.equal(dataSpy.callCount, 10);

        light.enable();

        clock.tick(10001);
        assert.equal(dataSpy.callCount, 20);

        light.disable();
        clock.restore();
      });

      it("should pass the correct value to the callback", async function() {

        const clock = sinon.useFakeTimers();
        const dataSpy = sinon.spy();

        let light = await new Light({
          pin: 17,
          io: Analog
        });

        light.on("data", dataSpy);

        light.io.value = 432;

        clock.tick(1001);
        assert.equal(dataSpy.callCount, 1);
        assert.equal(dataSpy.getCall(0).args[0], 432);

        light.disable();
        clock.restore();
      });

      it("should pass the scaled value to the callback", async function() {

        const clock = sinon.useFakeTimers();
        const dataSpy = sinon.spy();

        let light = await new Light({
          pin: 17,
          io: Analog,
          scale: [0, 255]
        });

        light.on("data", dataSpy);

        light.io.value = 432;

        clock.tick(1001);
        assert.equal(dataSpy.callCount, 1);
        assert.equal(light.raw, 432);
        assert.equal(dataSpy.getCall(0).args[0], 108);

        light.disable();
        clock.restore();
      });

    });

    describe("change", function() {
      it("should emit change events when enabled", async function() {

        const clock = sinon.useFakeTimers();
        const changeSpy = sinon.spy();

        let light = await new Light({
          pin: 17,
          io: Analog
        });

        light.on("change", changeSpy);

        clock.tick(1001);
        assert.equal(changeSpy.callCount, 0);

        light.io.value = 123;
        clock.tick(1001);
        assert.equal(changeSpy.callCount, 1);

        light.disable();
        light.io.value = 234;
        clock.tick(1001);
        assert.equal(changeSpy.callCount, 1);

        light.enable();
        light.io.value = 456;
        clock.tick(1001);
        assert.equal(changeSpy.callCount, 2);

        light.disable();
        clock.restore();
      });

      it("should pass the correct value to the callback", async function() {

        const clock = sinon.useFakeTimers();
        const changeSpy = sinon.spy();

        let light = await new Light({
          pin: 17,
          io: Analog
        });

        light.on("change", changeSpy);

        clock.tick(1001);
        assert.equal(changeSpy.callCount, 0);

        light.io.value = 123;
        clock.tick(1001);
        assert.equal(changeSpy.callCount, 1);
        assert.equal(changeSpy.getCall(0).args[0], 123);
        assert.equal(light.value, 123);

        light.disable();
        light.io.value = 234;
        clock.tick(1001);
        assert.equal(changeSpy.callCount, 1);
        assert.equal(light.value, 123);

        light.enable();
        light.io.value = 456;
        clock.tick(1001);
        assert.equal(changeSpy.callCount, 2);
        assert.equal(changeSpy.getCall(1).args[0], 456);
        assert.equal(light.value, 456);

        light.io.value = 432;

        clock.tick(1001);
        assert.equal(changeSpy.callCount, 3);
        assert.equal(changeSpy.getCall(2).args[0], 432);

        light.disable();
        clock.restore();
      });

      it("should pass the scaled value to the callback", async function() {

        const clock = sinon.useFakeTimers();
        const changeSpy = sinon.spy();

        let light = await new Light({
          pin: 17,
          io: Analog,
          scale: [0, 255]
        });

        light.on("change", changeSpy);

        clock.tick(1001);
        assert.equal(changeSpy.callCount, 0);

        light.io.value = 123;
        clock.tick(1001);
        assert.equal(changeSpy.callCount, 1);
        assert.equal(changeSpy.getCall(0).args[0], 31);
        assert.equal(Math.abs(light.value - 30) !== 0, true);

        light.disable();
        light.io.value = 234;
        clock.tick(1001);
        assert.equal(changeSpy.callCount, 1);
        assert.equal(Math.abs(light.value - 30) !== 0, true);

        light.enable();
        light.io.value = 456;
        clock.tick(1001);
        assert.equal(changeSpy.callCount, 2);
        assert.equal(changeSpy.getCall(1).args[0], 114);
        assert.equal(Math.abs(light.value - 114) !== 0, true);

        light.io.value = 432;

        clock.tick(1001);
        assert.equal(changeSpy.callCount, 3);
        assert.equal(changeSpy.getCall(2).args[0], 108);

        light.disable();
        clock.restore();
      });
    });

    describe("limit", function() {

      it("should emit limit events when enabled", async function() {

        const clock = sinon.useFakeTimers();
        let light = await new Light({
          pin: 17,
          io: Analog,
          limit: [256, 768]
        });

        const calls = {
          "lower": 0,
          "upper": 0
        };

        light.on("limit", function(data) {
          if (data.boundary === "lower") {
            assert.equal(light.raw <= 256, true);
            calls.lower++;
          } else {
            assert.equal(light.raw >= 768, true);
            calls.upper++;
          }
        });

        clock.tick(1005);
        light.io.value = 127;
        clock.tick(1005);
        light.io.value = 256;
        clock.tick(1005);
        light.io.value = 512;
        clock.tick(1005);
        light.io.value = 768;
        clock.tick(1005);
        light.io.value = 895;
        clock.tick(1005);
        light.io.value = 1023;
        clock.tick(1005);

        assert.equal(calls.lower, 3);
        assert.equal(calls.upper, 3);

        light.disable();

        clock.tick(1005);
        light.io.value = 127;
        clock.tick(1005);
        light.io.value = 256;
        clock.tick(1005);
        light.io.value = 512;
        clock.tick(1005);
        light.io.value = 768;
        clock.tick(1005);
        light.io.value = 895;
        clock.tick(1005);
        light.io.value = 1023;
        clock.tick(1005);

        assert.equal(calls.lower, 3);
        assert.equal(calls.upper, 3);

        light.enable();

        clock.tick(1005);
        light.io.value = 127;
        clock.tick(1005);
        light.io.value = 256;
        clock.tick(1005);
        light.io.value = 512;
        clock.tick(1005);
        light.io.value = 768;
        clock.tick(1005);
        light.io.value = 895;
        clock.tick(1005);
        light.io.value = 1023;
        clock.tick(1005);

        assert.equal(calls.lower, 5);
        assert.equal(calls.upper, 7);

        clock.restore();
        light.disable();

      });

    });

    describe("limit:lower", function() {
      it("should emit limit:lower events when enabled", async function() {

        const clock = sinon.useFakeTimers();
        let light = await new Light({
          pin: 17,
          io: Analog,
          limit: [256, 768]
        });

        const calls = {
          "limit:lower": 0
        };

        light.on("limit:lower", function(data) {
          assert.equal(light.raw <= 256, true);
          calls["limit:lower"]++;
        });

        clock.tick(1005);
        light.io.value = 127;
        clock.tick(1005);
        light.io.value = 256;
        clock.tick(1005);
        light.io.value = 512;
        clock.tick(1005);
        light.io.value = 768;
        clock.tick(1005);
        light.io.value = 895;
        clock.tick(1005);
        light.io.value = 1023;
        clock.tick(1005);

        assert.equal(calls["limit:lower"], 3);

        light.disable();

        clock.tick(1005);
        light.io.value = 127;
        clock.tick(1005);
        light.io.value = 256;
        clock.tick(1005);
        light.io.value = 512;
        clock.tick(1005);
        light.io.value = 768;
        clock.tick(1005);
        light.io.value = 895;
        clock.tick(1005);
        light.io.value = 1023;
        clock.tick(1005);

        assert.equal(calls["limit:lower"], 3);

        light.enable();

        clock.tick(1005);
        light.io.value = 127;
        clock.tick(1005);
        light.io.value = 256;
        clock.tick(1005);
        light.io.value = 512;
        clock.tick(1005);
        light.io.value = 768;
        clock.tick(1005);
        light.io.value = 895;
        clock.tick(1005);
        light.io.value = 1023;
        clock.tick(1005);

        assert.equal(calls["limit:lower"], 5);

        clock.restore();
        light.disable();

      });
    });

    describe("limit:upper", function() {
      it("should emit limit:upper events when enabled", async function() {

        const clock = sinon.useFakeTimers();
        let light = await new Light({
          pin: 17,
          io: Analog,
          limit: [256, 768]
        });

        const calls = {
          "limit:upper": 0
        };

        light.on("limit:upper", function(data) {
          assert.equal(light.raw >= 768, true);
          calls["limit:upper"]++;
        });

        clock.tick(1005);
        light.io.value = 127;
        clock.tick(1005);
        light.io.value = 256;
        clock.tick(1005);
        light.io.value = 512;
        clock.tick(1005);
        light.io.value = 768;
        clock.tick(1005);
        light.io.value = 895;
        clock.tick(1005);
        light.io.value = 1023;
        clock.tick(1005);

        assert.equal(calls["limit:upper"], 3);

        light.disable();

        clock.tick(1005);
        light.io.value = 127;
        clock.tick(1005);
        light.io.value = 256;
        clock.tick(1005);
        light.io.value = 512;
        clock.tick(1005);
        light.io.value = 768;
        clock.tick(1005);
        light.io.value = 895;
        clock.tick(1005);
        light.io.value = 1023;
        clock.tick(1005);

        assert.equal(calls["limit:upper"], 3);

        light.enable();

        clock.tick(1005);
        light.io.value = 127;
        clock.tick(1005);
        light.io.value = 256;
        clock.tick(1005);
        light.io.value = 512;
        clock.tick(1005);
        light.io.value = 768;
        clock.tick(1005);
        light.io.value = 895;
        clock.tick(1005);
        light.io.value = 1023;
        clock.tick(1005);

        assert.equal(calls["limit:upper"], 7);

        clock.restore();
        light.disable();

      });
    });

    describe("raw", function() {
      it("should emit data events when enabled", async function() {

        const clock = sinon.useFakeTimers();
        const rawSpy = sinon.spy();

        let light = await new Light({
          pin: 17,
          io: Analog
        });

        light.on("raw", rawSpy);

        clock.tick(10001);
        assert.equal(rawSpy.callCount, 100);

        light.disable();

        clock.tick(10001);
        assert.equal(rawSpy.callCount, 100);

        light.enable();

        clock.tick(10001);
        assert.equal(rawSpy.callCount, 200);

        light.disable();
        clock.restore();
      });

      it("should pass the correct value to the callback", async function() {

        const clock = sinon.useFakeTimers();
        const rawSpy = sinon.spy();

        let light = await new Light({
          pin: 17,
          io: Analog
        });

        light.on("raw", rawSpy);

        light.io.value = 432;

        clock.tick(1001);
        assert.equal(rawSpy.callCount, 10);
        assert.equal(rawSpy.getCall(0).args[0], 432);

        light.disable();
        clock.restore();
      });
    });

  });

});
