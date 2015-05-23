"use strict";

var ARGUMENT_NAMES = /([^\s,]+)/g;
var IS_PASCAL_CASE = /^[A-Z][a-zA-Z]*$/;
var STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg;

var Resolver = require("./Resolver");


function Container(wrappedContainer) {
    this.factories = {};
    this.resolver = new Resolver(this);
    this.wrappedContainer = wrappedContainer;
}

Container.prototype = {

    register: function (name, object) {
        return this.isConstructor(object, name) ?
            this.registerConstructor(name, object) :
            this.registerValue(name, object);
    },

    registerConstructor: function (name, constructorFunction) {
        var dependencyNames = this.getDependencyNames(constructorFunction);
        return this.registerFactory(name, this.createInstanceFactory(constructorFunction), dependencyNames);
    },

    createInstanceFactory: function (constructorFunction) {
        return function () {
            var instance = Object.create(constructorFunction.prototype);
            constructorFunction.apply(instance, arguments);
            return instance;
        }.bind(this);
    },

    registerValue: function (name, object) {
        return this.registerFactory(name, function () {
            return object;
        }, []);
    },

    registerFactory: function (name, factory, dependencyNames) {
        if (!dependencyNames) {
            dependencyNames = this.getDependencyNames(factory);
        }

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

    get: function (name) {
        return this.resolver.get(name);
    }

};

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

module.exports = Container;
