import assert from 'assert';
import sinon from 'sinon';

import { Digital } from "@dtex/mock-io";
import Button from 'j5e/button';

describe('Button', function() {
  
 describe('Instantiation', function() {
    
    it('should return a valid Button instance when passed an io class and pin number', async function() {
      const button = await new Button({
        pin: 13,
        io: Digital
      });
      assert.equal(button instanceof Button, true);
      assert.equal(button.io instanceof Digital, true);
    });
  });

  describe('Properties', function() {
    
    describe('isClosed', function() {
      it('should report isClosed is true when pin is high', async function() {
        const button = await new Button({
          pin: 13,
          io: Digital
        });
        
        button.io.write(1);
        assert.equal(button.isClosed, true);
        assert.equal(button.isOpen, false);
      });

      it('should report isClosed is false when pin is low', async function() {
        
        const button = await new Button({
          pin: 13,
          io: Digital
        });

        button.io.write(0);
        assert.equal(button.isClosed, false);
        assert.equal(button.isOpen, true);
      });

    });
    
    describe('isOpen', function() {
      it('should report isOpen is false when pin is high', async function() {
        const button = await new Button({
          pin: 13,
          io: Digital
        });
        
        button.io.write(1);
        assert.equal(button.isClosed, true);
        assert.equal(button.isOpen, false);
      });
    
      it('should report isOpen is true when pin is low', async function() {
        
        const button = await new Button({
          pin: 13,
          io: Digital
        });

        button.io.write(0);
        assert.equal(button.isClosed, false);
        assert.equal(button.isOpen, true);
      });
    });
  });

  describe('Events', function() {

    describe('close', function() {
      
      it('should fire "close" when a pin goes high', async function() {
        const clock = sinon.useFakeTimers();
        const button = await new Button({
          pin: 13,
          io: Digital
        });
        
        const closeListener = sinon.stub();
        
        button.on("close", function() { closeListener(); });

        button.io.write(1);
        clock.tick(10);
        assert.equal(closeListener.callCount, 1);

        button.io.write(0);
        clock.tick(1);
        
        // This should not emit (debounced)
        button.io.write(1);
        clock.tick(1);
        assert.equal(closeListener.callCount, 1);

        button.io.write(0);
        clock.tick(10);
        
        button.io.write(1);
        clock.tick(10);
        assert.equal(closeListener.callCount, 2);

        button.io.write(0);
        clock.tick(10);
        
        button.io.write(1);
        clock.tick(10);

        assert.equal(closeListener.callCount, 3);
        clock.restore();
      });
    });

    describe('open', function() {
      
      it('should fire "open" when a pin goes low', async function() {
        const clock = sinon.useFakeTimers();
        const button = await new Button({
          pin: 13,
          io: Digital
        });
        
        const openListener = sinon.stub();
        
        button.on("open", function() { openListener(); });

        button.io.write(1);
        clock.tick(10);
        
        button.io.write(0);
        clock.tick(10);
        assert.equal(openListener.callCount, 1);

        button.io.write(1);
        clock.tick(1);
        
        // This should not emit (debounced)
        button.io.write(0);
        clock.tick(1);
        assert.equal(openListener.callCount, 1);

        button.io.write(1);
        clock.tick(10);

        button.io.write(0);
        clock.tick(10);
        assert.equal(openListener.callCount, 2);
        
        button.io.write(1);
        clock.tick(10);

        button.io.write(0);
        clock.tick(10);
        assert.equal(openListener.callCount, 3);
        clock.restore();
      });
    });
  });


});