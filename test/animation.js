const assert = require('assert');
const sinon = require('sinon');

import { Digital, PWM } from "@dtex/mock-io";
import Animation from "../modules/util/animation";
import Led from "../modules/led/led";

describe('Animation', function() {
  
  describe('instantiation', function() {
    
    it('should return a valid Animation instance when passed a target', async function() {
      
      const led = await new Led({
        pin: 12,
        io: Digital
      });

      const animation = await new Animation(led);
      
      assert.equal(led instanceof Led, true);
      assert.equal(led.LOW, 0);
      assert.equal(led.HIGH, 1);

      assert.equal(animation instanceof Animation, true);
      assert.equal(animation.defaultTarget instanceof Led, true);

    });

  });

  describe('enqueue', function() {
    
    it('should create a segment opts object with all the default values', async function() {
      
      const clock = sinon.useFakeTimers();
      
      const led = await new Led({
        pin: 12,
        io: Digital
      });

      sinon.spy(led.io, "write");
      
      const animation = await new Animation(led);
      animation.enqueue({
        keyFrames: [0, 1],
      });

      // Segments enqueud to an idle animation immediately pop off the segment queue
      assert.equal(animation.segments.length, 0);
      
      assert.equal(animation.keyFrames.length, 1);
      assert.equal(animation.keyFrames[0].length, 2);

      assert.equal(animation.keyFrames[0][0].value, 0);
      assert.equal(typeof animation.keyFrames[0][0].easing, "function");
      assert.equal(animation.keyFrames[0][0].easing(0.25), 0.25);
      assert.equal(animation.keyFrames[0][1].value, 1);

      clock.tick(1050);
      assert.equal(led.io.write.callCount, 50);

      clock.restore();
      
    });

  });

});