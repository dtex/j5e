import { Emitter } from "@embedded/event";
import {normalizeParams} from "@embedded/fn";

/*
 * Switch
 * @constructor
 *
 * @param {opts} 
 *
 */

class Switch extends Emitter {
  
  #io;
  #state = {
    normallyOpen: true,
    raw: null 
  };
  
  constructor(io, pin) {    
    super();
    const {ioOpts, deviceOpts} = normalizeParams(io, pin);
    
    this.#io = new ioOpts.io({
      pin: ioOpts.pin,
      mode: ioOpts.io.Input,
      edge: ioOpts.io.Rising | ioOpts.io.Falling,
      onReadable: () => {
        if (this.isOpen) {
          this.emit("open");
        } else {
          this.emit("close");
        }
      }
    });
    
    // Is this instance Normally Open
    this.#state.normallyOpen = deviceOpts.type !== "NC";

    Object.defineProperties(this, {
      isClosed: {
        get: () => {
          return !this.#io.read();
        }
      },
      isOpen: {
        get: () => {
          return this.#io.read();
        }
      }
    });

  }

}

export default Switch;