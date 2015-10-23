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

### Naming Conventions

```javascript
var FooBar = ...; // this refers to a Class/Constructor function named "FooBar"
var fooBar = ...; // this refers to an instance of FooBar 
function SomeConstructor(fooBar) { ... } // an instance of FooBar will be passed in
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

### Caching

If you want to have a single instance of a component, use caching:

````javascript
container.cache().registerFactory("foo", function factory() {
    return {};
});

var fooOne = container.get("foo");
var fooTwo = container.get("foo");

assert(fooOne === fooTwo);
````

This works with factories and constructors:

````javascript
container.cache().register(Foo);

var fooOne = container.get("foo");
var fooTwo = container.get("foo");

assert(fooOne === fooTwo);
````



### Container hierarchies

A container can get access to components registered in a wrapped containers, but not vice-versa. 
If you want to wrap multiple containers, pass in an array of containers

```javascript
var wrappedContainer = yaioc.container();
var container = yaioc.container(wrappedContainer);

var foo = {}, bar = {};
wrappedContainer.register("foo", foo);
container.register("bar", bar);

assert(container.get("foo") === foo);
assert(wrappedContainer.get("bar") === undefined);
````
