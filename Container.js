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
        if (typeof name === "function") {
            return this.register(name.name, name);
        }

        this.checkDependencyName(name);

        return this.isConstructor(object, name) ?
            this.registerConstructor(name, object) :
            this.registerValue(name, object);
    },

    registerConstructor: function (name, constructorFunction) {
        if (typeof name === "function") {
            return this.registerConstructor(name.name, name);
        }

        this.checkDependencyName(name);

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
        if (typeof name === "function") {
            return this.registerValue(name.name, name);
        }

        this.checkDependencyName(name);

        return this.registerFactory(name, function () {
            return object;
        }, []);
    },

    registerFactory: function (name, factory, dependencyNames) {
        if (typeof name === "function") {
            return this.registerFactory(name.name, name);
        }

        this.checkDependencyName(name);

        if (!dependencyNames) {
            dependencyNames = this.getDependencyNames(factory);
        }

        this.factories[name] = {
            factory: factory,
            dependencyNames: dependencyNames
        };
    },

    checkDependencyName: function (name) {
        if (typeof name !== "string") {
            name = name.name;
        }

        if (!name) {
            throw new Error("no name provided for dependency");
        }
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

module.exports = Container;
