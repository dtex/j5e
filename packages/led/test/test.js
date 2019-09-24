const chai = require('chai');
const assert = require('assert');
const sinon = require('sinon');

import { Digital } from './../../mock/provider.js';
import Led from './../led.js';

describe('Led', function() {
  
  describe('Instantiation', function() {
    
    it('should return a valid Led instance when passed an io instance', function() {
      
      const io = new Digital({
        pin: 12,
        mode: Digital.Output
      });
      
      const led = new Led(io);
      
      assert.equal(led instanceof Led, true);
      assert.equal(led.io instanceof Digital, true);
      assert.equal(led.LOW, 0);
      assert.equal(led.HIGH, 1);

    });

    it('should return a valid Led instance when passed an options object', function() {
      
      const io = new Digital({
        pin: 12,
        mode: Digital.Output
      });
      
      const led = new Led({
        io: io
      });
      
      assert.equal(led instanceof Led, true);
      assert.equal(led.io instanceof Digital, true);
      assert.equal(led.LOW, 0);
      assert.equal(led.HIGH, 1);

    });

  });

  describe('On', function() {
    
    const io = new Digital({
      pin: 12,
      mode: Digital.Output
    });
    const led = new Led(io);
    
    sinon.spy(io, "write");

    it('should call io digital.write with 1', function() {  
      assert.equal(led.value, 0);
      led.on();
      assert(io.write.calledOnceWith(1));
      assert.equal(led.value, 1);
    });

  });

  describe('Off', function() {
    
    const io = new Digital({
      pin: 12,
      mode: Digital.Output
    });
    const led = new Led(io);
    
    sinon.spy(io, "write");

    it('should call io digital.write with 0', function() {  
      assert.equal(led.value, 0);
      led.off();
      assert(io.write.calledOnceWith(0));
      assert.equal(led.value, 0);
    });

  });

  describe('Toggle', function() {
    
    const io = new Digital({
      pin: 12,
      mode: Digital.Output
    });
    const led = new Led(io);
    
    sinon.spy(io, "write");

    it('should call io digital.write twice, with 1 and 0', function() {  
      assert.equal(led.value, 0);
      
      led.toggle();
      assert(io.write.calledOnceWith(1));
      assert.equal(led.value, 1);
      
      led.toggle();
      assert.equal(io.write.callCount, 2);
      assert.equal(io.write.secondCall.args[0], 0);
      assert.equal(led.value, 0);

    });

  });

  describe('Blink', function() {
    
    const clock = sinon.useFakeTimers();
    const io = new Digital({
      pin: 12,
      mode: Digital.Output
    });
    const led = new Led(io);
    
    sinon.spy(io, "write");

    it('should change state 10 times in 1050 millisconeds', function() {  
      
      led.blink();
      clock.tick(1050);

      assert.equal(led.value, 0);
      assert.equal(io.write.callCount, 10);

    });

  });

  describe('Stop', function() {
    
    const clock = sinon.useFakeTimers();
    const io = new Digital({
      pin: 12,
      mode: Digital.Output
    });
    const led = new Led(io);
    
    sinon.spy(io, "write");

    it('should change state 5 times in 1050 millisconeds', function() {  
      
      led.blink();
      setTimeout(function() {
        led.stop();
      }, 550);
      clock.tick(1050);

      assert.equal(led.value, 1);
      assert.equal(io.write.callCount, 5);

    });

  });

});