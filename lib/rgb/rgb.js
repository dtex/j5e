import assert from 'assert';
import sinon from 'sinon';
import { PWM } from "@dtex/mock-io";
import RGB from 'j5e/rgb';

describe('RGB', function() {
  
  describe('Instantiation', function() {
    
    it('should return a valid RGB instance when passed three pin numbers', async function() {
      const rgb = await new RGB([{ pin: 12, io: PWM }, { pin: 13, io: PWM }, { pin: 14, io: PWM }]);
      assert.equal(rgb instanceof RGB, true);
      assert.equal(rgb.LOW.red, 0);
      assert.equal(rgb.LOW.green, 0);
      assert.equal(rgb.LOW.blue, 0);
      assert.equal(rgb.HIGH.red, 1023);
      assert.equal(rgb.HIGH.green, 1023);
      assert.equal(rgb.HIGH.blue, 1023);
    });

    it('should return set the LOW values to 0', async function() {
      const rgb = await new RGB([{ pin: 12, io: PWM }, { pin: 13, io: PWM }, { pin: 14, io: PWM }]);
      
      assert.equal(rgb.LOW.red, 0);
      assert.equal(rgb.LOW.green, 0);
      assert.equal(rgb.LOW.blue, 0);

    });

    it('should set the HIGH values to 1023', async function() {
      const rgb = await new RGB([{ pin: 12, io: PWM }, { pin: 13, io: PWM }, { pin: 14, io: PWM }]);
      
      assert.equal(rgb.HIGH.red, 1023);
      assert.equal(rgb.HIGH.green, 1023);
      assert.equal(rgb.HIGH.blue, 1023);

    });

    it('should set all three pins to zero', async function() {  
      const rgb = await new RGB([{ pin: 12, io: PWM }, { pin: 13, io: PWM }, { pin: 14, io: PWM }]);
  
      assert.equal(rgb.io.red.value, 0);
      assert.equal(rgb.io.green.value, 0);
      assert.equal(rgb.io.blue.value, 0);
      

    });

  });

  describe('On', function() {
    
    it('should set all three pins to high', async function() {  
      const rgb = await new RGB([{ pin: 12, io: PWM }, { pin: 13, io: PWM }, { pin: 14, io: PWM }]);
      assert.equal(rgb.io.red.value, 0);
      assert.equal(rgb.io.green.value, 0);
      assert.equal(rgb.io.blue.value, 0);
      rgb.on();
      assert.equal(rgb.io.red.value, 1023);
      assert.equal(rgb.io.green.value, 1023);
      assert.equal(rgb.io.blue.value, 1023);
    });

    it('should return itself', async function() {  
      const rgb = await new RGB([{ pin: 12, io: PWM }, { pin: 13, io: PWM }, { pin: 14, io: PWM }]);
      assert.equal(rgb.io.red.value, 0);
      assert.equal(rgb.io.green.value, 0);
      assert.equal(rgb.io.blue.value, 0);
      let result = rgb.on();
      assert.equal(result instanceof RGB, true);
      assert.equal(Object.is(rgb, result), true);
    });

  });

  describe('Off', function() {
    
    it('should set all three pins to low', async function() {  
      const rgb = await new RGB([{ pin: 12, io: PWM }, { pin: 13, io: PWM }, { pin: 14, io: PWM }]);
      rgb.on();
      assert.equal(rgb.io.red.value, 1023);
      assert.equal(rgb.io.green.value, 1023);
      assert.equal(rgb.io.blue.value, 1023);
      rgb.off();
      assert.equal(rgb.io.red.value, 0);
      assert.equal(rgb.io.green.value, 0);
      assert.equal(rgb.io.blue.value, 0);
    });

    it('should return itself', async function() {  
      const rgb = await new RGB([{ pin: 12, io: PWM }, { pin: 13, io: PWM }, { pin: 14, io: PWM }]);
      assert.equal(rgb.io.red.value, 0);
      assert.equal(rgb.io.green.value, 0);
      assert.equal(rgb.io.blue.value, 0);
      let result = rgb.on();
      assert.equal(result instanceof RGB, true);
      assert.equal(Object.is(rgb, result), true);
    });

  });

  describe('Pulse', function() {
    
    it('should pulse between off and white', async function() {  
  
      const clock = sinon.useFakeTimers();
      const rgb = await new RGB([{ pin: 12, io: PWM }, { pin: 13, io: PWM }, { pin: 14, io: PWM }]);
      const writeSpyRed = sinon.spy(rgb.io.red, "write");
      const writeSpyBlue = sinon.spy(rgb.io.blue, "write");
      const writeSpyGreen = sinon.spy(rgb.io.green, "write");
      rgb.on();
  
      assert.equal(rgb.io.red.value, 1023);
      assert.equal(rgb.io.green.value, 1023);
      assert.equal(rgb.io.blue.value, 1023);
      assert.equal(writeSpyRed.callCount, 1);
      assert.equal(writeSpyBlue.callCount, 1);
      assert.equal(writeSpyGreen.callCount, 1);
      
      rgb.pulse();
      clock.tick(1010);
      
      assert.equal(writeSpyRed.getCall(1).args[0], 1);
      assert.equal(writeSpyRed.getCall(26).args[0], 544);
      assert.equal(writeSpyRed.getCall(50).args[0], 1023);

      clock.tick(1000);
      
      assert.equal(writeSpyRed.callCount, 101);
      assert.equal(writeSpyRed.getCall(51).args[0], 1022);
      assert.equal(writeSpyRed.getCall(76).args[0], 479);
      assert.equal(writeSpyRed.getCall(100).args[0], 0);

      clock.restore();
    });
  });

});