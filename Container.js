"use strict";

var ARGUMENT_NAMES = /([^\s,]+)/g;
var IS_PASCAL_CASE = /^[A-Z][a-zA-Z]*$/;
var STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg;


function Container(wrappedContainer) {
    this.factories = {};
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
        return this.resolve(name) || this.resolveInWrappedContainer(name);
    },

    resolve: function (name) {
        var factory = this.factories[name];

        if (!factory) {
            name = this.toPascalCase(name);
            factory = this.factories[name];
        }

        if (factory) {
            var dependencies = this.resolveDependencies(factory.dependencyNames, name);

            return factory.factory.apply(null, dependencies);
        }
    },

    toPascalCase: function (name) {
        return name[0].toUpperCase() + name.substring(1);
    },

    resolveDependencies: function (dependencyNames, name) {
        var dependencies = dependencyNames.map(this.get, this);

        dependencies.forEach(this.checkDependency.bind(this, dependencyNames, name));

        return dependencies;
    },

    checkDependency: function (dependencyNames, name, dependency, index) {
        if (!dependency) {
            throw new Error("Could not satisfy dependency '" + dependencyNames[index] + "' required by '" + name + "'");
        }
    },

    resolveInWrappedContainer: function (name) {
        return this.wrappedContainer && this.wrappedContainer.get(name);
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
