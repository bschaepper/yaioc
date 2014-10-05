"use strict";

var changeCase = require("change-case");

var STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg;
var ARGUMENT_NAMES = /([^\s,]+)/g;

function Container() {
    this.dependencies = {};
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
        var dependency = this.dependencies[name];

        if (this.isConstructor(dependency, name)) {
            return this.createInstance(dependency);
        } else if (!dependency && this.holdsConstructorFor(name)) {
            return this.get(changeCase.pascalCase(name));
        } else {
            return dependency;
        }
    },

    holdsConstructorFor: function (name) {
        return changeCase.pascalCase(name) in this.dependencies;
    },

    isConstructor: function (functionToInspect, name) {
        return typeof functionToInspect === "function" && changeCase.isUpperCase(name[0]);
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
        var fnStr = targetFunction.toString().replace(STRIP_COMMENTS, "");
        var result = fnStr.slice(fnStr.indexOf("(") + 1, fnStr.indexOf(")")).match(ARGUMENT_NAMES);
        return result || [];
    }

};

module.exports = Container;
