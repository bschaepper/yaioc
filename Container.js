"use strict";

var STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg;
var ARGUMENT_NAMES = /([^\s,]+)/g;
var IS_PASCAL_CASE = /^[A-Z][a-zA-Z]*$/;

function Container(wrappedContainer) {
    this.dependencies = {};
    this.wrappedContainer = wrappedContainer;
}

Container.prototype = {

    register: function (name, object) {
        if (typeof name === "function") {
            object = name;
            name = name.name;
        }

        if (!name) {
            throw new Error("no name provided for dependency");
        }

        this.dependencies[name] = object;
    },

    get: function (name) {
        var dependency = this.resolve(name);

        return this.isConstructor(dependency, name) ? this.createInstance(dependency) : dependency;
    },

    resolve: function (name) {
        return this.dependencies[name] || this.resolveConstructor(name) || this.resolveInWrappedContainer(name);
    },

    resolveConstructor: function (name) {
        return (this.holdsConstructorFor(name) && this.get(this.toPascalCase(name)));
    },

    resolveInWrappedContainer: function (name) {
        return this.wrappedContainer && this.wrappedContainer.resolve(name);
    },

    holdsConstructorFor: function (name) {
        return this.toPascalCase(name) in this.dependencies;
    },

    toPascalCase: function (name) {
        return name[0].toUpperCase() + name.substring(1);
    },

    isConstructor: function (functionToInspect, name) {
        return typeof functionToInspect === "function" && IS_PASCAL_CASE.test(name);
    },

    createInstance: function (constructorFunction) {
        var dependencies = this.resolveDependencies(constructorFunction);

        var instance = Object.create(constructorFunction.prototype);
        constructorFunction.apply(instance, dependencies);

        return instance;
    },

    resolveDependencies: function (constructorFunction) {
        var dependencies = this.getDependencyNames(constructorFunction);
        return dependencies.map(this.get, this);
    },

    getDependencyNames: function (targetFunction) {
        // based on http://stackoverflow.com/a/9924463/1551204
        var fnStr = targetFunction.toString().replace(STRIP_COMMENTS, "");
        var result = fnStr.slice(fnStr.indexOf("(") + 1, fnStr.indexOf(")")).match(ARGUMENT_NAMES);
        return result || [];
    }

};

module.exports = Container;
