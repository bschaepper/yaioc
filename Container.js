"use strict";

var Resolver = require("./Resolver");
var ReflectionUtils = require("./ReflectionUtils");
var ValueAdapter = require("./ValueAdapter");
var DependencyResolvingAdapter = require("./DependencyResolvingAdapter");
var ConstructorAdapter = require("./ConstructorAdapter");
var Cache = require("./Cache");


function Container(wrappedContainer) {
    this.adaptors = {};
    this.resolver = new Resolver(this, getWrappedResolvers(wrappedContainer));
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
        return ReflectionUtils.isConstructor(object, name) ?
            this.registerConstructor(name, object) :
            this.registerValue(name, object);
    },

    registerConstructor: function (name, constructorFunction, dependencyNames) {
        return this.registerAdaptor(name, new ConstructorAdapter(name, constructorFunction, dependencyNames));
    },

    registerValue: function (name, object) {
        return this.registerAdaptor(name, new ValueAdapter(object));
    },

    registerFactory: function (name, factory, dependencyNames) {
        return this.registerAdaptor(name, new DependencyResolvingAdapter(name, factory, dependencyNames));
    },

    registerAdaptor: function (name, adaptor) {
        if (typeof adaptor === "function") {
            adaptor = { getComponentInstance: adaptor };
        }

        this.adaptors[name] = adaptor;
    },

    cache: function () {
        var cache = new Container(this);
        Cache.call(cache, this);
        this.cache = cache.cache;
        return cache;
    },

    get: function (name) {
        return this.resolver.get(name);
    },

    lookup: function (name) {
        return this.adaptors[name];
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
