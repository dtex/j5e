import { Emitter } from "@j5e/event";
import {normalizeParams, loadModule} from "@j5e/fn";


// TODO: Research "Normally Open" vs "Sink Drive"
/*
 * Switch
 * @constructor
 *
 * @param {opts} 
 *
 */

class Switch extends Emitter {
  
  #state = {
    normallyOpen: true,
    raw: null 
  };

  constructor(io, device) { 
    return (async () => {
      const {ioOpts, deviceOpts} = normalizeParams(io, device);
      super();


      // Is this instance Normally Open
      this.#state.normallyOpen = deviceOpts.type !== "NC";

      Object.defineProperties(this, {
        isClosed: {
          get: () => {
            return !this.io.read();
          }
        },
        isOpen: {
          get: () => {
            return this.io.read();
          }
        }
      });
      
      if (!ioOpts.provider || typeof ioOpts.provider === "string") {
        const Provider = await import(ioOpts.provider || "builtin/digital");
        this.io = new Provider.default({
          pin: ioOpts.pin,
          mode: Provider.default.Input,
          edge: Provider.default.Rising | Provider.default.Falling,
          onReadable: () => { this.emit(this.isOpen ? "open" : "close") }
        });
      } else {
        this.io = ioOpts.provider;
      }
      
      return this;
    })();
    
    
  }

}

export default Switch;