/**
 * Class template
 * @module j5e/XXX
 * @requires module:j5e/event
 * @requires module:j5e/fn
 */

import { Emitter } from "j5e/event";
import { normalizeParams, getProvider } from "j5e/fn";

/**
 * Class representing XXX
 * @classdesc The XXX class allows for control of XXX
 * @async
 * @extends Emitter
 * @fires Switch#XXX
 * @fires Switch#XXX
 */
class XXX extends Emitter {

  #state = {
    someStateProp: true
  };

  /**
   * Instantiate XXX
   * @param {object} options - A pin number, pin identifier or a complete IO options object (See {@tutorial C-INSTANTIATING}
   * @property {boolean} XXX - True if XXX
   * @example
   * <caption>Use an XXX</caption>
   * import XXX from "j5e/XXX";
   *
   * const myxxx = await new XXX(12);
   *
   */
  constructor(options) {
    return (async() => {
      options = normalizeParams(options);
      super();

      const Provider = await getProvider(options, "builtin/digital");
      this.io = new Provider({
        pin: options.pin,
        mode: Provider.Input,
        onReadable: () => {
          this.emit(this.isOpen ? "open" : "close");
        }
      });

      return this;
    })();

  }

  /**
   * Get some read only value
   * @type {boolean}
   * @readonly
   * @example
   * <caption>Getter in action</caption>
   * import XXX from "j5e/XXX";
   *
   * const myxxx = await new XXX(12);
   * console.log(myxxx.someReadOnlyProperty)
   */
  get someReadOnlyProperty() {
    return Boolean(this.io.xxx);
  }

  /**
   * Get some readable/writable value
   * @type {number}
   * @example
   * <caption>Getter in action</caption>
   * import XXX from "j5e/XXX";
   *
   * const myxxx = await new XXX(12);
   * console.log(myxxx.someReadOnlyProperty)
   *
   * @example
   * <caption>Setter in action</caption>
   * import XXX from "j5e/XXX";
   *
   * const myxxx = await new XXX(12);
   * myxxx.someReadWriteProperty = 11;
   */
  get someReadWriteProperty() {
    return this.#state.xxx;
  }

  set someReadWriteProperty(newValue) {
    this.#state.xxx = Number(newValue);
  }

  /**
   * doSomething
   * @return {XXX}
   * @example
   * import XXX from "j5e/XXX";
   *
   * const myXXX = await new XXX(12);
   * myXXX.doSomething();
   */
  doSomething() {
    return this;
  }

}

export default XXX;
