"use strict";

var ReflectionUtils = require("./ReflectionUtils");
var DependencyResolvingAdapter = require("./DependencyResolvingAdapter");


function ConstructorAdapter(name, constructorFunction, dependencyNames) {
    dependencyNames = dependencyNames || ReflectionUtils.getDependencyNames(constructorFunction);

    var factory = function () {
        return ReflectionUtils.createInstance(constructorFunction, arguments);
    };

    DependencyResolvingAdapter.call(this, name, factory, dependencyNames);
}

ConstructorAdapter.prototype = Object.create(DependencyResolvingAdapter.prototype);

module.exports = ConstructorAdapter;
