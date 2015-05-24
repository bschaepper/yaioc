"use strict";

var Registry = require("./Registry");


function Cache(registry) {
    this.registry = registry;
    this.factories = registry.factories;
}

Cache.prototype = Object.create(Registry.prototype);

Cache.prototype.registerFactory = function (name, factory, dependencyNames) {
    factory = this.createFactoryCache(factory);
    dependencyNames = dependencyNames || this.getDependencyNames(factory);

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
