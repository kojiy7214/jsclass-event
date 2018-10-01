class EventAware {
  constructor(o) {
    let that = o || this;
    EventAware.__objects__.add(that);
  }

  dispatchTo(filter, event, ...args) {
    EventAware.dispatchTo(this, filter, event, ...args);
  }

  dispatch(event, ...args) {
    EventAware.dispatch(this, event, ...args);
  }

  static dispatchTo(src, filter, event, ...args) {
    let funcname = "on" + event[0].toUpperCase() + event.slice(1);
    [...EventAware.__objects__].filter(filter).forEach(o => typeof o && o !== src && o[funcname] && o[funcname](...args));
  }

  static dispatch(src, event, ...args) {
    let funcname = "on" + event[0].toUpperCase() + event.slice(1);
    EventAware.__objects__.forEach(o => typeof o && o !== src && o[funcname] && o[funcname](...args));
  }

  static detach(o) {
    EventAware.__objects__.delete(o);
  }

  static attach(o) {
    o.dispatchTo = function(filter, event, ...args) {
      EventAware.dispatchTo(o, filter, event, ...args);
    }

    o.dispatch = function(event, ...args) {
      EventAware.dispatch(o, event, ...args);
    }

    EventAware.__objects__.add(o);
  }

  static clear() {
    EventAware.__objects__.clear();
  }
}

EventAware.__objects__ = (EventAware.__objects__ || new Set());

module.exports = EventAware;