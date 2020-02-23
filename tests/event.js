const assert = require('assert');
const sinon = require('sinon');

import { Emitter } from '../packages/event';
import Switch from '../packages/switch';
import { Digital } from "@dtex/mock-io";

describe('Event', function() {
  
  describe('Instantiation', function() {
    
    it('should return a valid Emitter instance', async function() {
      
      const event = await new Emitter();
      
      assert.equal(event instanceof Emitter, true);

    });

  });

  describe('Intantiate a device with listener', function() {
    it('should be an instance of Emitter', async function() {
      
      const mySwitch = await new Switch({
        pin: 12,
        io: Digital
      });

      assert.equal(mySwitch instanceof Emitter, true);

    });

    it('should emit twice', async function() {
      
      const mySwitch = await new Switch({
        pin: 12,
        io: Digital
      });

      mySwitch.on("open", function() {
        assert.equal(mySwitch.isOpen, true);
      });

      mySwitch.on("close", function() {
        assert.equal(mySwitch.isClosed, true);
      });

      /* Need to add tests but I'm not sure mocha works with async and done() */


    });
  });
  

});