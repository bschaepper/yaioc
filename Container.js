"use strict";

var Resolver = require("./Resolver");
var ReflectionUtils = require("./ReflectionUtils");
var ValueAdapter = require("./ValueAdapter");
var DependencyResolvingAdapter = require("./DependencyResolvingAdapter");
var ConstructorAdapter = require("./ConstructorAdapter");
var Cache = require("./Cache");


class Container {

    constructor(wrappedContainer) {
        this.adaptors = new Map();
        this.resolver = new Resolver(this, Container.getWrappedResolvers(wrappedContainer));
        Container.guardRegisterFunctions(this);
    }

    static getWrappedResolvers(wrappedContainer) {
        if (!wrappedContainer) {
            return [];
        }

        if (!Array.isArray(wrappedContainer)) {
            return [wrappedContainer.resolver];
        }

        return wrappedContainer.map((container) => container.resolver);
    }

    register(name, object) {
        return ReflectionUtils.isConstructor(object, name) ?
            this.registerConstructor(name, object) :
            this.registerValue(name, object);
    }

    registerConstructor(name, constructorFunction, dependencyNames) {
        return this.registerAdaptor(name, new ConstructorAdapter(name, constructorFunction, dependencyNames));
    }

    registerValue(name, object) {
        return this.registerAdaptor(name, new ValueAdapter(object));
    }

    registerFactory(name, factory, dependencyNames) {
        return this.registerAdaptor(name, new DependencyResolvingAdapter(name, factory, dependencyNames));
    }

    registerAdaptor(name, adaptor) {
        if (typeof adaptor === "function") {
            adaptor = { getComponentInstance: adaptor };
        }

        this.adaptors.set(name, adaptor);
    }

    cache() {
        var container = new Container(this);
        Cache.call(container, this);
        this.cache = container.cache;
        return container;
    }

    get(name, target) {
        return this.resolver.get(name, target);
    }

    lookup(name) {
        return this.adaptors.get(name);
    }

    static guardRegisterFunctions(container) {
        Object.getOwnPropertyNames(Object.getPrototypeOf(container))
            .filter((methodName) => methodName.indexOf("register") === 0)
            .forEach((methodName) => {
                container[methodName] = addPreconditionsCheck(container[methodName]);
            });

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
    }

}

module.exports = Container;
