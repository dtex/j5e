const assert = require('assert');
const sinon = require('sinon');

import { Digital } from "@dtex/mock-io";
import { constrain, normalizeParams, timer } from '../packages/fn';

describe('Fn', function() {
  
  describe('normalizeParams', function() {
    
    it('should return valid ioOpts and deviceOpts when passed a provider class and pin number', function() {
      const {ioOpts, deviceOpts} = normalizeParams(13, Digital);
      assert.equal(Object.is(ioOpts.io, Digital), true);
      assert.equal(ioOpts.pin, 13);
      assert.equal(typeof deviceOpts, "object");
      assert.equal(Object.keys(deviceOpts).length, 0);
    });

    it('should return valid ioOpts and deviceOpts when passed a provider object', function() {
      const {ioOpts, deviceOpts} = normalizeParams({
        io: Digital,
        pin: 13
      });
      assert.equal(Object.is(ioOpts.io, Digital), true);
      assert.equal(ioOpts.pin, 13);
      assert.equal(typeof deviceOpts, "object");
      assert.equal(Object.keys(deviceOpts).length, 0);
    });

    it('should return valid ioOpts and deviceOpts when passed a provider object and device object', function() {
      const {ioOpts, deviceOpts} = normalizeParams({
        io: Digital,
        pin: 13
      }, {
        someProp: 1
      });
      assert.equal(Object.is(ioOpts.io, Digital), true);
      assert.equal(ioOpts.pin, 13);
      assert.equal(typeof deviceOpts, "object");
      assert.equal(Object.keys(deviceOpts).length, 1);
      assert.equal(Object.keys(deviceOpts)[0], "someProp");
    });

  });

  describe('constrain', function() {
   
    it('should return the value when value is in range', function() {
      const result = constrain(128, 0, 255);
      assert.equal(result, 128);
    });

    it('should return the max when value is beyond range', function() {
      const result = constrain(512, 0, 255);
      assert.equal(result, 255);
    });

    it('should return the min when value is below range', function() {
      const result = constrain(1, 128, 255);
      assert.equal(result, 128);
    });

    it('should work with a negative min', function() {
      const result = constrain(128, -128, 255);
      assert.equal(result, 128);
    });

    it('should work with all negative numbers', function() {
      const result = constrain(-128, -255, -0);
      assert.equal(result, -128);
    });

  });

  // describe('setInterval', function() {
  //   it('should return the GLOBAL setInterval by default', function() {
  //     const localSetInterval = setInterval;
  //     assert.equal(Object.is(localSetInterval, GLOBAL.setInterval), true);
  //   });
  // });

});