import assert from 'assert';

import { Digital } from "@dtex/mock-io";
import Switch from 'j5e/switch';

describe('Switch', function() {
  
  describe('Instantiation', function() {
    
    it('should return a valid Switch instance when passed an io class and pin number', async function() {
      const myswitch = await new Switch({
        pin: 13,
        io: Digital
      });
      assert.equal(myswitch instanceof Switch, true);
      assert.equal(myswitch.io instanceof Digital, true);
    });
  });
});