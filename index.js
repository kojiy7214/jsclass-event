let event_aware_set = Symbol();
let event_receiver_set = Symbol();

class EventAware {
  constructor(o) {
    let that = o || this;
    EventAware[event_aware_set].add(that);
  }

  dispatchTo(filter, event, ...args) {
    EventAware.dispatchTo(this, filter, event, ...args);
  }

  dispatch(event, ...args) {
    EventAware.dispatch(this, event, ...args);
  }

  static dispatchTo(src, filter, event, ...args) {
    let receiver_set = new Set([...EventAware[event_aware_set], ...EventAware[event_receiver_set]]);
    let funcname = "on" + event[0].toUpperCase() + event.slice(1);
    [...receiver_set].filter(filter).forEach(o => typeof o && o !== src && o[funcname] && o[funcname](...args));
  }

  static dispatch(src, event, ...args) {
    let receiver_set = new Set([...EventAware[event_aware_set], ...EventAware[event_receiver_set]]);
    let funcname = "on" + event[0].toUpperCase() + event.slice(1);
    receiver_set.forEach(o => typeof o && o !== src && o[funcname] && o[funcname](...args));
  }

  static detach(o) {
    if (EventAware[event_aware_set].has(o)) {
      EventAware[event_aware_set].delete(o);
      o.dispatch = () => {};
      o.dispatchTo = () => {}
    } else if (EventAware[event_receiver_set].has(o)) {
      EventAware[event_receiver_set].delete(o);
    }
  }

  static attach(o) {
    o.dispatchTo = function(filter, event, ...args) {
      EventAware.dispatchTo(o, filter, event, ...args);
    }

    o.dispatch = function(event, ...args) {
      EventAware.dispatch(o, event, ...args);
    }

    EventAware[event_aware_set].add(o);
  }

  static attachAsReceiver(o) {
    EventAware[event_receiver_set].add(o);
  }

  static clear() {
    EventAware[event_aware_set].clear();
  }
}
EventAware[event_aware_set] = (EventAware[event_aware_set] || new Set());
EventAware[event_receiver_set] = (EventAware[event_receiver_set] || new Set());
module.exports = EventAware;