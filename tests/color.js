import assert from 'assert';
import sinon from 'sinon';
import { I2C } from "@dtex/mock-io";
import Color from '@j5e/color';

describe('Color', function() {
  
  describe('Instantiation', function() {
    
    it('should return a valid Color instance when passed an options object', async function() {
      
      const color = await new Color({
        io: I2C
      });
      
      assert.equal(color instanceof Color, true);

    });

  });

});