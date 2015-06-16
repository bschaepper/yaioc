"use strict";

var Registry = require("./Registry");


function Cache(registry) {
    this.registry = registry;
    this.factories = registry.factories;
}

Cache.prototype = Object.create(Registry.prototype);

Cache.prototype.registerFactory = function (name, factory, dependencyNames) {
    dependencyNames = dependencyNames || this.getDependencyNames(factory);
    factory = this.createFactoryCache(factory);

    return this.registry.registerFactory(name, factory, dependencyNames);
};

Cache.prototype.createFactoryCache = function (factory) {
    var cached;

    return function () {
        cached = cached || factory.apply(null, arguments);
        return cached;
    };
};

module.exports = Cache;
