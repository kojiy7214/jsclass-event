# jsclass-event
Tiny &amp; easy to use event driven frame work.  

## What Makes "jsclass-event" Unique
With less than 50 lines of code, "jsclass-event" provides basic event driven
features.  Further more it is easy to use, and produces very clean code.

## How to Use
### Making Your Object Event Aware
There are two ways.  First is to extend your class based on "jsclass-event",
Alternative is to attach objects to "jsclass-event" afterwards.

```
const EventAware = require("jsclass-event");

class A extends EventAware{
};  // any object created based on class A will be event-aware

class B{
};

let b = new B();
EventAware.attach(b); // object b is event-aware

EventAware.detach(b); // you can also detach to make object non-event-aware
```

### Sending and Receiving Messages Between Event Aware Objects
Developers can send message along with data, using dispatch() and dispatchTo()
methods.  The difference between two methods is that by using dispatchTo() method
developers can filter objects to receive the message, while dispatch() broadcasts
message to every event-aware objects.
To receive a message, developers have to create a method with "on" prefixed.
For example, to receive a message "hello", you just have to define a method named
"onHello".

```
//simple dispatch example
const EventAware = require("jsclass-event");

class A extends EventAware{
  sayHello(){
    this.dispatch("hello", "class A"); //1st arg is a message, 2nd arg is data
  }
}

class B extends EventAware{
  onHello(data){
    console.log("Hello to B from " + data);
  }
}


class C extends EventAware{
  onHello(data){
    console.log("Hello to C from " + data);
  }
}

let a = new A();
let b = new B();
let c = new C();

a.sayHello();

> Hello to B from class A
> Hello to C from class A
```

```
//simple dispatchTo example
const EventAware = require("jsclass-event");

class A extends EventAware{
  sayHello(){
    // 1st arg is a filter function, if function returns false, then the receiver will be ignored
    // in this case, object c based on class C, won't receive the message
    this.dispatchTo(o=> o instanceof B, "hello", "class A");
  }
}

class B extends EventAware{
  onHello(data){
    console.log("Hello to B from " + data);
  }
}

class C extends EventAware{
  onHello(data){
    console.log("Hello to C from " + data);
  }
}

let a = new A();
let b = new B();
let c = new C();

a.sayHello();

> Hello to B from class A
```

## Works with "jsclass-mixin"
When developer decide to extend his/her class from "jsclass-event", developer
should give up to extend from other classes.  That is a huge limitation, while
Java Script allows only single inheritance.
Now its not a limitation any more!  "jsclass-event" can be used with
["jsclass-mixin"](https://www.npmjs.com/package/jsclass-mixin)!  
Check out the code below!

```
const EventAware = require("jsclass-event");
const mix = require("jsclass-mixin");

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

> Hello to mixed-B from class A
```
