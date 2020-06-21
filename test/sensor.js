import assert from 'assert';
import sinon from 'sinon';
import { Analog } from "@dtex/mock-io";
import Sensor from 'j5e/sensor';

describe('Sensor - Generic', function() {
  
  describe('Instantiation', function() {
    
    it('should return a valid Sensor instance when passed an options object', async function() {
      
      let sensor = await new Sensor({
        pin: 17,
        io: Analog
      });
      
      assert.equal(sensor instanceof Sensor, true);
      assert.equal(sensor.io instanceof Analog, true);
      assert.equal(sensor.interval, 100);
      assert.equal(sensor.smoothing, 10);

      sensor.disable();

    });

    it('should return the correct default property values', async function() {
      
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

    it('should make 10 readings per second', async function() {
      
      const clock = sinon.useFakeTimers();
      let sensor = await new Sensor({
        pin: 17,
        io: Analog
      });
    
      const writeSpy = sinon.spy(sensor.io, "read");

      clock.tick(1050);
      assert.equal(writeSpy.callCount, 10);
      clock.restore();
      
      sensor.disable();

    });

  });

  describe('enabled option: false', function() {

    it('should return the correct default property values', async function() {
      
      let sensor = await new Sensor(
        { pin: 17, io: Analog },
        { enabled: false }
      );
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
    
    it('should not start making readings', async function() {
      
      const clock = sinon.useFakeTimers();
      let sensor = await new Sensor(
        { pin: 17, io: Analog },
        { enabled: false }
      );
    
      const writeSpy = sinon.spy(sensor.io, "read");

      clock.tick(1050);
      assert.equal(writeSpy.callCount, 0);
      clock.restore();
      
      sensor.disable();

    });

  });

  describe('interval option: 50', function() {

    it('should return the correct default property values', async function() {
      
      let sensor = await new Sensor(
        { pin: 17, io: Analog },
        { interval: 50 }
      );
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
    
    it('should make 20 readings per second', async function() {
      
      const clock = sinon.useFakeTimers();
      let sensor = await new Sensor(
        { pin: 17, io: Analog },
        { interval: 50 }
      );
    
      const writeSpy = sinon.spy(sensor.io, "read");

      clock.tick(1005);
      assert.equal(writeSpy.callCount, 20);
      clock.restore();
      
      sensor.disable();

    });

  });

  describe('range option: [256, 758]', function() {

    it('should return the correct default property values', async function() {
      
      let sensor = await new Sensor(
        { pin: 17, io: Analog },
        { range: [256, 758] }
      );
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
    
    it('should map value properly', async function() {
      
      let sensor = await new Sensor(
        { pin: 17, io: Analog },
        { range: [256, 768] }
      );
    
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

  describe('option limit: [256, 758]', function() {

    it('should return the correct default property values', async function() {
      
      let sensor = await new Sensor(
        { pin: 17, io: Analog },
        { range: [256, 758] }
      );

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
    
    it('should emit upper and lower limit events', async function() {
      
      const clock = sinon.useFakeTimers();
      let sensor = await new Sensor(
        { pin: 17, io: Analog },
        { limit: [256, 768] }
      );

      const calls = {
        "lower": 0,
        "upper": 0,
        "limit:lower": 0,
        "limit:upper": 0
      }

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

  describe('option threshold: 20', function() {

    it('should return the correct default property values', async function() {
      
      let sensor = await new Sensor(
        { pin: 17, io: Analog },
        { threshold: 20 }
      );

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

    it('should emit change event when the threshold is exceeded', async function() {
      
      const clock = sinon.useFakeTimers();
      
      let sensor = await new Sensor(
        { pin: 17, io: Analog },
        { threshold: 20 }
      );
      
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
      sensor.io.value = 20;
      clock.tick(1005);
      sensor.io.value = 100;
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

  /*

  // Methods to test
  enable()
  disable()
  scale()
  scaleTo()
  fscaleTo()
*/



});