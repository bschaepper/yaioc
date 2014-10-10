# yaioc: Yet Another IOC-Container for Node.js

[![Build Status](https://travis-ci.org/bschaepper/yaioc.svg?branch=master)](https://travis-ci.org/bschaepper/yaioc)


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

### Container hierarchies

A container can get access to components registered in a wrapped container, but not vice-versa 

    var wrappedContainer = yaioc.container();
    var container = yaioc.container(wrappedContainer);
    
    var foo = {}, bar = {};
    wrappedContainer.register("foo", foo);
    container.register("bar", bar);

    assert(container.get("foo") === foo);
    assert(wrappedContainer.get("bar") === undefined);
