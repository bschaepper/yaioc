"use strict";

var Resolver = require("./Resolver");
var ReflectionUtils = require("./ReflectionUtils");
var ValueAdapter = require("./ValueAdapter");
var DependencyResolvingAdapter = require("./DependencyResolvingAdapter");
var ConstructorAdapter = require("./ConstructorAdapter");
var Cache = require("./Cache");
var DependencyGraph = require("./DependencyGraph");
var RegisterMethodsGuard = require("./RegisterMethodsGuard");


class Container {

    constructor(wrappedContainer) {
        this.adaptors = new Map();
        this.resolver = new Resolver(this, Container.getWrappedResolvers(wrappedContainer));
        RegisterMethodsGuard.guard(this);
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

    getDependencyGraph(dependencyName) {
        return new DependencyGraph(this.resolver, dependencyName);
    }

}

module.exports = Container;
