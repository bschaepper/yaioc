"use strict";

var ARGUMENT_NAMES = /([^\s,]+)/g;
var IS_PASCAL_CASE = /^[A-Z][a-zA-Z]*$/;
var STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg;


function Registry() {
    this.factories = {};
}

Registry.prototype = {

    register: function (name, object) {
        return this.isConstructor(object, name) ?
            this.registerConstructor(name, object) :
            this.registerValue(name, object);
    },

    registerConstructor: function (name, constructorFunction, dependencyNames) {
        dependencyNames = dependencyNames || this.getDependencyNames(constructorFunction);
        return this.registerFactory(name, this.createInstanceFactory(constructorFunction), dependencyNames);
    },

    createInstanceFactory: function (constructorFunction) {
        return function () {
            var args = [null].concat(Array.prototype.slice.call(arguments))
            return new (Function.prototype.bind.apply(constructorFunction, args));
        }.bind(this);
    },

    registerValue: function (name, object) {
        return this.registerFactory(name, function () {
            return object;
        }, []);
    },

    registerFactory: function (name, factory, dependencyNames) {
        dependencyNames = dependencyNames || this.getDependencyNames(factory);

        this.factories[name] = {
            factory: factory,
            dependencyNames: dependencyNames
        };
    },

    isConstructor: function (functionToInspect, name) {
        return typeof functionToInspect === "function" && IS_PASCAL_CASE.test(name);
    },

    getDependencyNames: function (targetFunction) {
        // based on http://stackoverflow.com/a/9924463/1551204
        var fnStr = targetFunction.toString().replace(STRIP_COMMENTS, "");
        var result = fnStr.slice(fnStr.indexOf("(") + 1, fnStr.indexOf(")")).match(ARGUMENT_NAMES);
        return result || [];
    },

    lookup: function (name) {
        return this.factories[name];
    }

};

module.exports = Registry;
