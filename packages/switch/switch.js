import { Emitter } from "@embedded/event"

**
 * Switch
 * @constructor
 *
 * @param {opts} 
 *
 */

class Switch extends Emitter {
  
  #state = {
    isOpen: true
  };
  
  constructor(opts) {    
    
    if (!opts.io) opts = { io: opts };
    
    this.io = opts.io;
    
    

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

};

export default Switch;