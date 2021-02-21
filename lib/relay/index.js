/**
 * Relay
 * @module j5e/relay
 * @requires module:j5e/fn
 */

import { normalizeDevice, normalizeIO, getProvider } from "j5e/fn";

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
   * @param {number|string|object} io - Pin identifier or IO Options (See {@tutorial C-INSTANTIATING})
   * @param {object} options - Device configuration options
   * @param {string} options.type - "NO" (Normally Open) or "NC" (Normally Closed)
   * @example
   * <caption>Use a Relay</caption>
   * import Relay from "j5e/relay";
   *
   * const relay = await new Relay(12);
   *
   */
  constructor(io) {
    return (async() => {
      io = normalizeIO(io);

      const Provider = await getProvider(io, "Digital");
      this.io = new Provider({
        pin: io.pin,
        mode: Provider.Output
      });

      this.configure();
      return this;
    })();

  }

  /**
   * Configure a Relay
   * @returns {Relay} The instance on which the method was called
   * @param {object} options - Device configuration options
   * @param {number} [options.type="NO"] - "NC" if a relay is normally closed, "NO" if it is normally open
   * @example
   * import Relay from "j5e/relay";
   *
   * const relay = await new Relay(14);
   * relay.configure({
   *   type: "NC"
   * });
   *
   * // With type: "NC", relay.open() sets pin 14 high
   * relay.open();
   */
  configure(options = {}) {
    options = normalizeDevice(options);

    if (typeof options.type !== "undefined") {
      this.#state.isInverted = options.type === "NC" ? true : false;
    }

    return this;
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
