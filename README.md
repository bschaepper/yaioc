# yaioc: Yet Another IOC-Container for Node.js

[![Build Status](https://travis-ci.org/bschaepper/yaioc.svg?branch=master)](https://travis-ci.org/bschaepper/yaioc)
[![Coverage Status](https://coveralls.io/repos/bschaepper/yaioc/badge.png?branch=master)](https://coveralls.io/r/bschaepper/yaioc?branch=master)

## Goals

* Small
* Unobtrusive, invisible to managed components
* Easy to use
* Pluggable/embeddable by design
* No meta-data or scripting required
* Inspired by [PicoContainer](http://picocontainer.codehaus.org)


## Installation

yaioc is available via npm: `npm install yaioc`

## Usage

```javascript
// Write components
function Foo() {
}

function Bar(foo, value) {
  this.foo = foo;
  this.value = value;
}


// Assemble in container
var container = yaioc.container();
container.register(Foo);
container.register(Bar);
container.register("value", "static value");


// Instantiate components
var bar = container.get("bar");

assert(bar instanceof Bar);
assert(bar.foo instanceof Foo);
assert(bar.value === "static value");
```

Of course, you can use more modern constructs like classes and ESModules too.

### Naming Conventions

```javascript
var FooBar = ...; // this refers to a Class/Constructor function named "FooBar"
var fooBar = ...; // this refers to an instance of FooBar
function SomeConstructor(fooBar) { ... } // an instance of FooBar will be passed in
```

### Factories

Components can also be registered as Factories, a function which provides the result of a component lookup:

```javascript
var container = yaioc.container();
container.register("value", "static value");
container.registerFactory("foo", function (value) {
    return { value: value };
});


var foo = container.get("foo");

assert(foo.value === "static value");
```

### Adaptors

Adaptors work similar to Factories, but are very low level. This is the most basic Interface,
an adaptor will have to resolve all dependencies for itself. This is useful if you have to do
additional work, or a conditional lookup:

```javascript
var container = yaioc.container();
container.register("evenValue", "even value");
container.register("oddValue", "odd value");
container.registerAdaptor("foo", function (container) {
    var value = container.get(Date.now() % 2 ? "oddValue" : "evenValue");
    return { value: value };
});


var foo = container.get("foo");

assert(foo.value === "even value" || foo.value === "odd value");
```

There is also an object-oriented interface for adaptors. This is handy for extracting a more
advanced calculation or lookup to a separate class.

```javascript
function FooAdaptor() {
}

FooAdaptor.prototype.getComponentInstance = function (container) {
    var result;
    // work
    return new Foo(result);
};


var container = yaioc.container();
container.registerAdaptor("foo", new FooAdaptor());


var foo = container.get("foo");

assert(foo instanceof Foo);
```

Additionally an adaptor will get passed the name of its target component:

```javascript
var container = yaioc.container();
container.register(function NeedsFoo(foo) {});
container.registerAdaptor("foo", function (container, target) {
    assert(target === "NeedsFoo");
});

var foo = container.get("foo");
```

### Caching

If you want to have a single instance of a component, use caching:

```javascript
container.cache().registerFactory("foo", function factory() {
    return {};
});

var fooOne = container.get("foo");
var fooTwo = container.get("foo");

assert(fooOne === fooTwo);
```

This works with factories and constructors:

```javascript
container.cache().register(Foo);

var fooOne = container.get("foo");
var fooTwo = container.get("foo");

assert(fooOne === fooTwo);
```


### Component Scan

A convenient way to register many components is the component scan facility.
Internally this uses the [glob module](https://github.com/isaacs/node-glob), so many wildcard expressions are allowed.
All matched files will be `require`d and `register`ed.

```javascript
var container = yaioc.container();
var MyController = require("./ctrls/MyController");

container.scanComponents(__dirname + "/**/*Controller.js");

assert(container.get("MyController") === MyController);
assert(container.get("myController") instanceof MyController);
```


### Container hierarchies

A container can get access to components registered in wrapped containers, but not vice-versa.
If you want to wrap multiple containers, pass in an array of containers

```javascript
var wrappedContainer = yaioc.container();
var container = yaioc.container(wrappedContainer);

var foo = {}, bar = {};
wrappedContainer.register("foo", foo);
container.register("bar", bar);

assert(container.get("foo") === foo);
assert(wrappedContainer.get("bar") === undefined);
```

### Dependency Graph

There is a method to give you an overview of all dependencies and transient dependencies of
any given component:

```javascript
function Foo(baz) {}
function Bar(foo, value) {}
function BarDependent(bar) {}

var container = yaioc.container();
container.register(Foo);
container.register(Bar);
container.register(BarDependent);
container.register("baz", "");
container.register("value", "static value");

var graph = container.getDependencyGraph("bar");
console.log(graph.draw());
```

This will print a tree of dependencies:

```
bar
├┬ foo
│└─ baz
└─ value
```

Additionally, there will be an error if either a dependency is not found, or a circular
reference is detected.

### Dependency Schema

In order to get an overall picture about the regitstered components and their dependecies
in the container, you can use the method `getDependencySchema`:

```javascript
function Foo(baz) {}
function Bar(foo, value) {}
function BarDependent(bar) {}

var container = yaioc.container();
container.register(Foo);
container.register(Bar);
container.register(BarDependent);
container.register("baz", "");
container.register("value", "static value");

var schema = container.getDependencySchema();
console.log(schema.getDependencyDotFile());
```
That outputs content of a [Dot File](https://en.wikipedia.org/wiki/DOT_(graph_description_language)).
```
digraph yaiocDeps {
  foo -> baz;
  bar -> foo;
  bar -> value;
  barDependent -> bar;
}
```
You can use any cli or [online tool](https://bit.ly/38P2WdS) to generate the visual output.
