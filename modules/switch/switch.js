import { Emitter } from "../util/event.js";
import {normalizeParams, getProvider} from "../util/fn.js";


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

      const Provider = await getProvider(ioOpts, "builtin/digital");
      this.io = new Provider({
        pin: ioOpts.pin,
        mode: Provider.Input,
        edge: Provider.Rising | Provider.Falling,
        onReadable: () => { this.emit(this.isOpen ? "open" : "close") }
      });

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
      
      return this;
    })();
    
    
  }

}

export default Switch;