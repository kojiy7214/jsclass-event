let assert = require('assert');
let EventAware = require('../../jsclass-event');
let mix = require('jsclass-mixin');

describe('Basic Event Test', function() {
  class A extends EventAware {
    constructor() {
      super();
    }
  };

  class B extends EventAware {
    constructor() {
      super();
      this.data = undefined;
    }

    onEvent(data) {
      this.data = data;
    }
  };

  class C extends EventAware {
    constructor() {
      super();
      this.data = undefined;
    }

    onSignal(data) {
      this.data = data;
    }
  };

  class D {
    constructor() {
      this.data = undefined;
    }

    onEvent(data) {
      this.data = data;
    }
  };

  describe('broadcast event', function() {
    it('#dispatch(1-to-1)', function() {
      let a = new A();
      let b = new B();

      a.dispatch("event", "test");
      assert.equal(b.data, "test");
    })

    it('#dispatch(1-to-many)', function() {
      let a = new A();
      let b1 = new B();
      let b2 = new B();

      a.dispatch("event", "test");
      assert.equal(b1.data, "test");
      assert.equal(b2.data, "test");
    })

    it('#dispatch(1-to-none)', function() {
      let a = new A();
      let c = new C();

      a.dispatch("event", "test");
      assert.equal(c.data, undefined);
    })
  })

  describe('send event to filtered objects', function() {
    it('#dispatchTo()', function() {
      let a = new A();
      let b1 = new B();
      let b2 = new B();

      b1.flag = false;
      b2.flag = true;

      a.dispatchTo(o => o.flag, "event", "test");
      assert.equal(b1.data, undefined);
      assert.equal(b2.data, "test");
    })
  })

  describe('detach object', function() {
    it('#detach()', function() {
      let a = new A();
      let b = new B();

      a.dispatch("event", "test");
      assert.equal(b.data, "test");

      EventAware.detach(b);

      a.dispatch("event", "test2");
      assert.equal(b.data, "test");
    })
  })

  describe('atach/detach object', function() {
    it('#atach()', function() {
      let a = new A();
      let d = new D();

      a.dispatch("event", "test");
      assert.equal(d.data, undefined);

      EventAware.attach(d);

      a.dispatch("event", "test");
      assert.equal(d.data, "test");

      let b1 = new B();
      let b2 = new B();

      b1.flag = false;
      b2.flag = true;

      d.dispatchTo(o => o.flag, "event", "test");
      assert.equal(b1.data, undefined);
      assert.equal(b2.data, "test");

      d.dispatch("event", "test2")
      assert.equal(b1.data, "test2");
      assert.equal(b2.data, "test2");
    })

    it('#atachAsReceiver()', function() {
      let a = new A();
      let d = new class extends D {
        dispatchTo() {
          return "original";
        }
        dispatch() {
          return "original";
        }
      }();

      a.dispatch("event", "test");
      assert.equal(d.data, undefined);

      EventAware.attachAsReceiver(d);

      a.dispatch("event", "test");
      assert.equal(d.data, "test");

      assert.equal(d.dispatch(), "original");
      assert.equal(d.dispatchTo(), "original");

      EventAware.detach(d);

      a.dispatch("event", "test2");
      assert.equal(d.data, "test");
    })
  })

  describe('Use with "jsclass-mixin"', function() {
    it('#with jsclass-mixin', function() {
      class M {};

      class N extends mix(M, EventAware) {
        constructor(name) {
          super();
          this.name = name;
          EventAware.new(this);
        }

        sayHello() {
          this.dispatch("hello", "test");
        };

        onHello(data) {
          this.received = "test";
        };
      }


      let n1 = new N("n1");
      let n2 = new N("n2");

      assert.equal(n2.received, undefined);

      n1.sayHello();

      assert.equal(n2.received, "test");

    })
  })

  describe('README Example Verification', function() {
    it('#1()', function() {
      class A extends EventAware {}; // any object created based on class A will be event-aware

      class B {};

      let b = new B();
      EventAware.attach(b); // object b is event-aware
    })

    it('#2()', function() {
      class A extends EventAware {
        sayHello() {
          this.dispatch("hello", "class A"); //1st arg is a message, 2nd arg is data
        }
      }

      class B extends EventAware {
        onHello(data) {
          console.log("Hello to B from " + data);
        }
      }

      class C extends EventAware {
        onHello(data) {
          console.log("Hello to C from " + data);
        }
      }

      let a = new A();
      let b = new B();
      let c = new C();

      a.sayHello();
    })

    it('#3()', function() {
      class A extends EventAware {
        sayHello() {
          // 1st arg is a filter function, if function returns false, then the receiver will be ignored
          // In this case, object c based on class C, won't receive the message
          this.dispatchTo(o => o instanceof B, "hello", "class A");
        }
      }

      class B extends EventAware {
        onHello(data) {
          console.log("Hello to B from " + data);
        }
      }

      class C extends EventAware {
        onHello(data) {
          console.log("Hello to C from " + data);
        }
      }

      let a = new A();
      let b = new B();
      let c = new C();

      a.sayHello();
    })

    it('#4()', function() {
      EventAware.clear();

      class B {
        constructor() {
          this.onHello = function(data) {
            console.log("Hello to mixed-B from " + data);
          }
        }
      }

      class A extends mix(B, EventAware) {
        constructor() {
          super();
          EventAware.new(this);
        }

        sayHello() {
          this.dispatch("hello", "class A"); //1st arg is a message, 2nd arg is data
        }
      }

      let a1 = new A(); // sender
      let a2 = new A(); // receiver
      a1.sayHello();
    })
  })
})