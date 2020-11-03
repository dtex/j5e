/**
 * For working with switches
 * @module j5e/switch
 * @requires module:j5e/event
 * @requires module:j5e/fn
 */

import { Emitter } from "j5e/event";
import { normalizeDevice, normalizeIO, getProvider } from "j5e/fn";

/**
 * Class representing a switch
 * @classdesc The Switch class allows for control of digital switches
 * @async
 * @extends module:j5e/event.Emitter
 * @fires Switch#open
 * @fires Switch#close
 */
class Switch extends Emitter {

  /**
   * Instantiate a switch
   * @param {number|string|object} io - Pin identifier or IO Options (See {@tutorial C-INSTANTIATING})
   * @param {object} options - Device configuration options
   * @example
   * <caption>Use a switch to control an LED</caption>
   * import Switch from "j5e/switch";
   * import LED from "j5e/led";
   *
   * const mySwitch = await new Switch(12);
   * const led = await new LED(13);
   *
   * mySwitch.on("open", function() {
   *   led.off();
   * });
   *
   * mySwitch.on("close", function() {
   *   led.on();
   * });
   */
  constructor(io, options) {
    return (async() => {
      options = normalizeDevice(options);
      io = normalizeIO(io);
      super();

      const Provider = await getProvider(io, "builtin/digital");
      this.io = new Provider({
        pin: io.pin,
        mode: Provider.Input,
        edge: Provider.Rising | Provider.Falling,
        onReadable: () => {
          this.emit(this.isOpen ? "open" : "close");
        }
      });

      return this;
    })();

  }

  /**
   * True if the switch is closed (current is flowing)
   * @returns {boolean}
   * @readonly
   */
  get isClosed() {
    return Boolean(this.io.read());
  }

  /**
   * True if the switch is open (current is not flowing)
   * @returns {boolean}
   * @readonly
   */
  get isOpen() {
    return !Boolean(this.io.read());
  }

}

export default Switch;
