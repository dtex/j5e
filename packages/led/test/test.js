const chai = require('chai');
const assert = require('assert');
const sinon = require('sinon');

import Led from './../led.js';

describe('Led - Digital', function() {
  
  describe('Instantiation', function() {
    
    it('should return a valid Led instance when passed an options object', function() {
      
      const led = new Led({
        pin: 12,
        provider: "./../../mock/digital.js"
      });
      
      assert.equal(led instanceof Led, true);
      assert.equal(led.LOW, 0);
      assert.equal(led.HIGH, 1);

    });

  });

  describe('On', function() {
    
    const led = new Led({
      pin: 12,
      provider: "./../../mock/digital.js"
    });
    led.on("ready", () => {
      const writeSpy = sinon.spy(led.io, "write");

      it('should call io digital.write with 1', function() {  
        assert.equal(led.value, 0);
        led.on();
        assert.equal(writeSpy.getCall(0).args[0], 1);
        assert.equal(led.value, 1);
      });
    });

  });

  // describe('Off', function() {
    
  //   const led = new Led({
  //     pin: 12,
  //     provider: "./../../mock/digital.js"
  //   });
    
  //   const writeSpy = sinon.spy(led.io, "write");

  //   it('should call io digital.write with 0', function() {  
  //     led.on();
  //     assert.equal(led.value, 1);
  //     led.off();
  //     assert.equal(writeSpy.getCall(0).args[0], 1);
  //     assert.equal(writeSpy.getCall(1).args[0], 0);
  //     assert.equal(led.value, 0);
  //   });

  // });

  // describe('Toggle', function() {
    
  //   const led = new Led({
  //     pin: 12,
  //     provider: "./../../mock/digital.js"
  //   });
  //   const writeSpy = sinon.spy(led.io, "write");

  //   it('should call io digital.write twice, with 1 and 0', function() {  
  //     assert.equal(led.value, 0);
      
  //     led.toggle();
  //     assert(writeSpy.calledOnceWith(1));
  //     assert.equal(led.value, 1);
      
  //     led.toggle();
  //     assert.equal(writeSpy.callCount, 2);
  //     assert.equal(writeSpy.secondCall.args[0], 0);
  //     assert.equal(led.value, 0);

  //   });

  // });

  /*
  describe('Blink', function() {
    
    const clock = sinon.useFakeTimers();
    const led = new Led({
      pin: 12,
      provider: "./../../mock/digital.js"
    });
    
    const writeSpy = sinon.spy(led.io, "write");

    it('should change state 10 times in 1050 millisconeds', function() {  
      
      led.blink();
      clock.tick(1050);

      assert.equal(led.value, 0);
      assert.equal(writeSpy.callCount, 10);

    });

  });

  describe('Stop', function() {
    
    const clock = sinon.useFakeTimers();
    const led = new Led({
      pin: 12,
      provider: "./../../mock/digital.js"
    });
    
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
*/
});

describe('Led - PWM', function() {
  /*
  describe('Instantiation', function() {
    
    it('should return a valid Led instance when passed an options object', function() {
      
      const led = new Led({
        pin: 12,
        provider: "./../../mock/pwm.js"
      });
      
      assert.equal(led instanceof Led, true);
      assert.equal(led.LOW, 0);
      assert.equal(led.HIGH, 1023);

    });

  });

  describe('On', function() {
    
    const led = new Led({
      pin: 12,
      provider: "./../../mock/pwm.js"
    });
    const writeSpy = sinon.spy(led.io, "write");

    it('should call io digital.write with 1', function() {  
      assert.equal(led.value, 0);
      led.on();
      assert.equal(writeSpy.getCall(0).args[0], 1023);
      assert.equal(led.value, 1023);
    });

  });

  describe('Off', function() {
    
    const led = new Led({
      pin: 12,
      provider: "./../../mock/pwm.js"
    });
    
    const writeSpy = sinon.spy(led.io, "write");

    it('should call io digital.write with 0', function() {  
      led.on();
      assert.equal(led.value, 1023);
      led.off();
      assert.equal(writeSpy.getCall(0).args[0], 1023);
      assert.equal(writeSpy.getCall(1).args[0], 0);
      assert.equal(led.value, 0);
    });

  });

  describe('Toggle', function() {
    
    const led = new Led({
      pin: 12,
      provider: "./../../mock/pwm.js"
    });
    const writeSpy = sinon.spy(led.io, "write");

    it('should call io digital.write twice, with 1 and 0', function() {  
      assert.equal(led.value, 0);
      
      led.toggle();
      assert(writeSpy.calledOnceWith(1023));
      assert.equal(led.value, 1023  );
      
      led.toggle();
      assert.equal(writeSpy.callCount, 2);
      assert.equal(writeSpy.secondCall.args[0], 0);
      assert.equal(led.value, 0);

    });
  });

  describe('Brightness', function() {
    
    const led = new Led({
      pin: 12,
      provider: "./../../mock/pwm.js"
    });
    const writeSpy = sinon.spy(led.io, "write");

    it('should call io digital.write twice, with 0 and 512', function() {  
      assert.equal(led.value, 0);
      
      led.off();
      assert(writeSpy.calledOnceWith(0));
      assert.equal(led.value, 0  );
      
      led.brightness(512);
      assert.equal(writeSpy.callCount, 2);
      assert.equal(writeSpy.secondCall.args[0], 512);
      assert.equal(led.value, 512);

    });
  });
*/
    // describe('Fade', function() {
      
    //   const led = new Led({
    //     pin: 12,
    //     provider: "./../../mock/pwm.js"
    //   });
    //   const writeSpy = sinon.spy(led.io, "write");

    //   it('should call fade and...', function() {  
    //     led.off();
    //     assert.equal(led.value, 0);
    //     assert(writeSpy.calledOnceWith(0));
        
    //     led.fadeOn();
    //     //assert.equal(writeSpy.callCount, 2);
    //     //assert.equal(writeSpy.secondCall.args[0], 512);
    //     //assert.equal(led.value, 512);

    //   });
    // });

});