import { Emitter } from "@embedded/event"

/*
 * Switch
 * @constructor
 *
 * @param {opts} 
 *
 */

class Switch extends Emitter {
  
  #state = {
    isOpen: true,
    normallyOpen: true,
    raw: null 
  };
  
  constructor(opts) {    
    
    if (!opts.io) opts = { io: opts };
    
    this.io = opts.io;
    
    // Is this instance Normally Open
    this.#state.normallyOpen = opts.type !== "NC";

    Object.defineProperties(this, {
      isClosed: {
        get: function() {
          return this.#state.value;
        }
      },
      isOpen: {
        get: function() {
          return this.#state.mode;
        }
      }
    });

  }


  /*

  // Create a 5 ms debounce boundary on event triggers
  // this avoids button events firing on
  // press noise and false positives
  var trigger = Fn.debounce(function(key) {
    aliases[key].forEach(function(type) {
      this.emit(type, null);
    }, this);
  }, 5);
  
  

  // Logical Defaults
  var closeValue = 1;
  var openValue = 0;

  if (invert) {
    closeValue ^= 1;
    openValue ^= 1;
  }

  this.io.pinMode(this.pin, this.io.MODES.INPUT);

  if (isNormallyOpen) {
    this.io.digitalWrite(this.pin, this.io.HIGH);
  }

  this.io.digitalRead(this.pin, function(data) {
    raw = data;

    trigger.call(this, this.isOpen ? "open" : "close");
  }.bind(this));

  Object.defineProperties(this, {
    value: {
      get: function() {
        return Number(this.isOpen);
      }
    },
    invert: {
      get: function() {
        return invert;
      },
      set: function(value) {
        invert = value;
        closeValue = invert ? 0 : 1;
        openValue = invert ? 1 : 0;
      }
    },
    closeValue: {
      get: function() {
        return closeValue;
      },
      set: function(value) {
        closeValue = value;
        openValue = value ^ 1;
      }
    },
    openValue: {
      get: function() {
        return openValue;
      },
      set: function(value) {
        openValue = value;
        closeValue = value ^ 1;
      }
    },
    isOpen: {
      get: function() {
        return raw === openValue;
      }
    },
    isClosed: {
      get: function() {
        return raw === closeValue;
      }
    },
  });
}

util.inherits(Switch, Emitter);


/**
 * Fired when the Switch is close
 *
 * @event
 * @name close
 * @memberOf Switch
 *


/**
 * Fired when the Switch is opened
 *
 * @event
 * @name open
 * @memberOf Switch
 *


/**
 * Switches()
 * new Switches()
 *
 * Constructs an Array-like instance of all servos
 *

function Switches(numsOrObjects) {
  if (!(this instanceof Switches)) {
    return new Switches(numsOrObjects);
  }

  Object.defineProperty(this, "type", {
    value: Switch
  });

  Collection.Emitter.call(this, numsOrObjects);
}

util.inherits(Switches, Collection.Emitter);

Collection.installMethodForwarding(
  Switches.prototype, Switch.prototype
);

// Assign Switches Collection class as static "method" of Switch.
Switch.Collection = Switches;



module.exports = Switch;

*/

};

export default Switch;