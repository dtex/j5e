import assert from 'assert';
import { PWM } from "@dtex/mock-io";
import RGB from '@j5e/rgb';

describe('RGB', function() {
  
  describe('Instantiation', function() {
    
    it('should return a valid RGB instance when passed three pin numbers', async function() {
      const rgb = await new RGB([ 
        {
          pin: 12, 
          io: PWM
        }, {
          pin: 13,
          io: PWM
        }, { 
          pin: 14,
          io: PWM 
        }
      ]);
      assert.equal(rgb instanceof RGB, true);
    });
  });
});