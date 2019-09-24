/**
 * Emitter
 * @constructor
 *
 *
 *
 */

class Emitter {

  constructor() {
    this.events = {};
  }

  on(event, listener) {
    if (typeof this.events[event] !== 'object') {
        this.events[event] = [];
    }
    this.events[event].push(listener);
  }

  removeListener(event, listener) {
    if (typeof this.events[event] === 'object') {
      let idx = this.events[event].indexOf(listener);
      if (idx > -1) {
        this.events[event].splice(idx, 1);
      }
    }
  }

  emit(event) {
    const args = [].slice.call(arguments, 1);

    if (typeof this.events[event] === 'object') {
      let listeners = this.events[event].slice();
        
      for (let i = 0, length = listeners.length; i < length; i++) {
        listeners[i].apply(this, args);
      }
    }
  }

  once(event, listener) {
    this.on(event, function g () {
      this.removeListener(event, g);
      listener.apply(this, arguments);
    });
  }

};

export { Emitter };

