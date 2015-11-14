"use strict";

var Resolver = require("./Resolver");
var Registry = require("./Registry");
var Cache = require("./Cache");


function Container(wrappedContainer) {
    this.registry = new Registry();
    this.resolver = new Resolver(this.registry, getWrappedResolvers(wrappedContainer));
}

function getWrappedResolvers(wrappedContainer) {
    if (!wrappedContainer) {
        return [];
    }

    if (!Array.isArray(wrappedContainer)) {
        return [wrappedContainer.resolver];
    }

    return wrappedContainer.map(function (container) {
        return container.resolver;
    });
}

Container.prototype = {

    register: function (name, object) {
        return this.registry.register(name, object);
    },

    registerValue: function (name, object) {
        return this.registry.registerValue(name, object);
    },

    registerConstructor: function (name, constructorFunction, dependencyNames) {
        return this.registry.registerConstructor(name, constructorFunction, dependencyNames);
    },

    registerFactory: function (name, factory, dependencyNames) {
        return this.registry.registerFactory(name, factory, dependencyNames);
    },

    registerAdaptor: function (name, adaptor) {
        var container = this;
        return this.registry.registerAdaptor(name, function () {
            return adaptor(container);
        });
    },

    cache: function () {
        var cache = Object.create(Container.prototype);
        this.cache = function () { return cache; };
        cache.registry = new Cache(this.registry);
        cache.resolver = this.resolver;
        return cache;
    },

    get: function (name) {
        return this.resolver.get(name);
    }

};

module.exports = Container;


Object.keys(Container.prototype).forEach(function (methodName) {
    if (methodName.indexOf("register") !== 0) {
        return;
    }

    Container.prototype[methodName] = addPreconditionsCheck(Container.prototype[methodName]);

    function addPreconditionsCheck(method) {
        return function () {
            return method.apply(this, arrangeAndCheckArguments(arguments));
        };
    }

    function arrangeAndCheckArguments(args) {
        args = Array.prototype.slice.call(args);
        checkName(args[0]);

        if (typeof args[0] === "function") {
            args.unshift(args[0].name);
        }

        return args;
    }

    function checkName(name) {
        if (!name || typeof name !== "string" && !name.name) {
            throw new Error("no name provided for dependency");
        }
    }
});
