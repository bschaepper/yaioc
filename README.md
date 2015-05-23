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
````


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
````


### Container hierarchies

A container can get access to components registered in a wrapped container, but not vice-versa 

```javascript
var wrappedContainer = yaioc.container();
var container = yaioc.container(wrappedContainer);

var foo = {}, bar = {};
wrappedContainer.register("foo", foo);
container.register("bar", bar);

assert(container.get("foo") === foo);
assert(wrappedContainer.get("bar") === undefined);
````
