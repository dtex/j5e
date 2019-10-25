const chai = require('chai');
const assert = require('assert');
const sinon = require('sinon');

import { Digital } from './../../mock/provider.js';
import Fn from './../fn.js';

describe('Fn', function() {
  
  describe('Normalize', function() {
    
    it('should return valid ioOpts and deviceOpts when passed a provider class and pin number', function() {
      
      const {ioOpts, deviceOpts} = normalizeParams(Digital, 13);
      assert.equal(led instanceof Led, true);
      assert.equal(led.io instanceof Digital, true);
      assert.equal(led.LOW, 0);
      assert.equal(led.HIGH, 1);
    
    });

  });

});