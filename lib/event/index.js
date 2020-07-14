/**
 * event module - Houses event related mixins
 * @module j5e/event
 * @ignore
 */

/**
 * Provides an event base class for devices. It is not meant to be used directly.
 * @ignore
 */
export class Emitter {

  /**
   * @constructor
   */
  constructor() {
    this.events = {};
  }

  /**
   * Create an event listener
   * @param {string} event - The name of the event to listen for
   * @param {function} listener - A callback to run when the event is fired.
   */
  on(event, listener) {
    if (typeof this.events[event] !== "object") {
      this.events[event] = [];
    }
    this.events[event].push(listener);
  }

  /** Remove an event listener
   * @param {string} event - The name of the event that we are removing a listener from
   * @param {function} listener - The callback that we are removing
   */
  removeListener(event, listener) {
    if (typeof this.events[event] === "object") {
      let idx = this.events[event].indexOf(listener);
      if (idx > -1) {
        this.events[event].splice(idx, 1);
      }
    }
  }

  /** Emit an event
   * @param {string} event - The name of the event to emit
   */
  emit(event, ...rest) {
    if (typeof this.events[event] === "object") {
      let listeners = this.events[event].slice();

      for (let i = 0, length = listeners.length; i < length; i++) {
        listeners[i].apply(this, rest);
      }
    }
  }

  /**
   * Create an event listener that will only fire one time.
   * @param {string} event - The name of the event to listen for
   * @param {function} listener - A callback to run when the event is fired.
   */
  once(event, listener) {
    this.on(event, function g() {
      this.removeListener(event, g);
      listener.apply(this, arguments);
    });
  }

};
