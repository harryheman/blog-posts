class Emitter {
  constructor() {
    this.events = {}
  }

  emit(e, ...args) {
    if (this.events[e]) {
      this.events[e].forEach((fn) => fn(...args))
    }
    return this
  }

  on(e, fn) {
    this.events[e] ? this.events[e].push(fn) : (this.events[e] = [fn])
    return this
  }

  off(e, fn) {
    if (e && typeof fn === 'function') {
      const listeners = this.events[e]
      listeners.splice(
        listeners.findIndex((_fn) => _fn === fn),
        1
      )
    } else {
      this.events[e] = []
    }
    return this
  }
}

export default Emitter
