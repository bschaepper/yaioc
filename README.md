yaioc
=====

Yet Another IOC-Container for Node.js

## Usage ##

    function Foo() {
    }
    
    function Bar(foo, value) {
      this.foo = foo;
      this.value = value;
    }

    var container = yaioc.container();
    container.register(Foo);
    container.register(Bar);
    container.register("value", "static value");
    
    var bar = container.get("bar");
    
    assert(bar instanceof Bar);
    assert(bar.foo instanceof Foo);
    assert(bar.value === "static value");
