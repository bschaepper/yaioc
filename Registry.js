"use strict";

var ReflectionUtils = require("./ReflectionUtils");


function Registry() {
    this.factories = {};
}

Registry.prototype = {

    register: function (name, object) {
        return ReflectionUtils.isConstructor(object, name) ?
            this.registerConstructor(name, object) :
            this.registerValue(name, object);
    },

    registerConstructor: function (name, constructorFunction, dependencyNames) {
        dependencyNames = dependencyNames || ReflectionUtils.getDependencyNames(constructorFunction);
        return this.registerFactory(name, this.createInstanceFactory(constructorFunction), dependencyNames);
    },

    createInstanceFactory: function (constructorFunction) {
        return function () {
            return ReflectionUtils.createInstance(constructorFunction, arguments);
        }.bind(this);
    },

    registerValue: function (name, object) {
        return this.registerFactory(name, function () {
            return object;
        }, []);
    },

    registerFactory: function (name, factory, dependencyNames) {
        dependencyNames = dependencyNames || ReflectionUtils.getDependencyNames(factory);

        this.factories[name] = {
            factory: factory,
            dependencyNames: dependencyNames
        };
    },

    registerAdaptor: function (name, adaptor) {
        this.factories[name] = {
            factory: adaptor,
            dependencyNames: []
        };
    },

    lookup: function (name) {
        return this.factories[name];
    }

};

module.exports = Registry;
