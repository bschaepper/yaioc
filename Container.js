"use strict";

const glob = require("glob");
const Resolver = require("./Resolver");
const ReflectionUtils = require("./ReflectionUtils");
const ValueAdapter = require("./ValueAdapter");
const DependencyResolvingAdapter = require("./DependencyResolvingAdapter");
const ConstructorAdapter = require("./ConstructorAdapter");
const Cache = require("./Cache");
const DependencyGraph = require("./DependencyGraph");
const RegisterMethodsGuard = require("./RegisterMethodsGuard");


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
        if (ReflectionUtils.isConstructor(object, name)) {
            this.registerConstructor(Resolver.toLowerCamelCase(name), object);
        }

        this.registerValue(name, object);
    }

    registerConstructor(name, constructorFunction, dependencyNames) {
        this.registerAdaptor(name, new ConstructorAdapter(name, constructorFunction, dependencyNames));
    }

    registerValue(name, object) {
        this.registerAdaptor(name, new ValueAdapter(object));
    }

    registerFactory(name, factory, dependencyNames) {
        this.registerAdaptor(name, new DependencyResolvingAdapter(name, factory, dependencyNames));
    }

    registerAdaptor(name, adaptor) {
        if (typeof adaptor === "function") {
            adaptor = {getComponentInstance: adaptor};
        }

        this.adaptors.set(name, adaptor);
    }

    cache() {
        const container = new Container(this);
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

    scanComponents(path) {
        for (const file of glob.sync(path)) {
            const component = require(file);
            const name = Container.getComponentName(component, file);

            this.register(name, component);
        }
    }

    static getComponentName(component, file) {
        if (component.name) {
            return component.name;
        }

        const name = file.split("/").pop().split(".");
        name.pop();
        return name.join(".");
    }
}

module.exports = Container;
