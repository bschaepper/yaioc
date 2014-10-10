yaioc
=====

Yet Another IOC-Container for Node.js

## Usage ##

    function Foo() {
    }
    
    function Bar(foo) {
      this.foo = foo;
    }

    var container = yaioc.container();
    container.register(Foo);
    container.register(Bar);
    
    var bar = container.get("bar");
    
    assert(bar instanceof Bar);
    assert(bar.foo instanceof Foo);
