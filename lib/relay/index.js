/**
 * Relay
 * @module j5e/relay
 * @requires module:j5e/fn
 */

import { normalizeParams, getProvider } from "j5e/fn";

/**
 * Class representing a relay
 * @classdesc The Relay class allows for control of a relay
 * @async
 */
class Relay {

  #state = {
    isInverted: false,
    isClosed: false,
    value: null
  }

  /**
   * Instantiate Relay
   * @param {object} options - A pin number, pin identifier or a complete options object (See {@tutorial C-INSTANTIATING}
   * @param {string} options.type - "NO" (Normally Open) or "NC" (Normally Closed)
   * @example
   * <caption>Use a Relay</caption>
   * import Relay from "j5e/relay";
   *
   * const relay = await new Relay(12);
   *
   */
  constructor(options) {
    return (async() => {
      options = normalizeParams(options);

      const Provider = await getProvider(options, "builtin/digital");
      this.io = new Provider({
        pin: options.pin,
        mode: Provider.Output
      });

      if (options.type === "NC") {
        this.#state.isInverted = true;
      }

      return this;
    })();

  }

  /**
   * A numerical value representing the relay state
   * @type {number}
   * @readonly
   */
  get value() {
    return Number(this.isClosed);
  }

  /**
   * True if the relay is closed
   * @type {boolean}
   * @readonly
   */
  get isClosed() {
    return this.#state.isClosed;
  }

  /**
   * "NC" if the relay is normally closed, "NO" if the relay is normally open
   * @type {string}
   * @readonly
   */
  get type() {
    return this.#state.isInverted ? "NC" : "NO";
  }

  /**
   * Close the relay circuit
   * @return {Relay}
   * @example
   * import Relay from "j5e/relay"
   *
   * const relay = await new Relay(12);
   *
   * // Turn it on
   * relay.close();
   *
   * // Wait 5 seeconds and turn it off
   * system.setTimeout(function() {
   *   relay.open();
   * }, 5000);
   */
  close() {
    this.io.write(
      this.#state.isInverted ? 0 : 2 ** (this.io.resolution || 1) - 1
    );
    this.#state.isClosed = true;

    return this;
  }

  /**
   * Open the relay circuit
   * @return {Relay}
   * @example
   * import Relay from "j5e/relay"
   *
   * const relay = await new Relay(12);
   *
   * // Turn it on
   * relay.close();
   *
   * // Wait 5 seeconds and turn it off
   * system.setTimeout(function() {
   *   relay.open();
   * }, 5000);
   */
  open() {

    this.io.write(
      this.#state.isInverted ? 2 ** (this.io.resolution || 1) - 1 : 0
    );
    this.#state.isClosed = false;

    return this;
  }

  /**
   * Toggle the relay circuit
   * @return {Relay}
   * @example
   * import Relay from "j5e/relay"
   *
   * const relay = await new Relay(12);
   *
   * // Turn it on
   * relay.toggle();
   *
   * // Wait 5 seeconds and turn it off
   * system.setTimeout(function() {
   *   relay.toggle();
   * }, 5000);
   */
  toggle() {

    if (this.#state.isClosed) {
      this.open();
    } else {
      this.close();
    }

    return this;
  }

}

export default Relay;
