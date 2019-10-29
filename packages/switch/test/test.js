const chai = require('chai');
const assert = require('assert');
const sinon = require('sinon');

import { Digital } from './../../mock/provider.js';
import Switch from './../switch.js';

describe('Switch', function() {
  
  describe('Instantiation', function() {
    
    it('should return a valid Switch instance when passed an io class and pin number', function() {
      
      const myswitch = new Switch(Digital, 13);
      
      assert.equal(myswitch instanceof Switch, true);

    });
  });
});