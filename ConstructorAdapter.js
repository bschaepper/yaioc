"use strict";

var ReflectionUtils = require("./ReflectionUtils");
var DependencyResolvingAdapter = require("./DependencyResolvingAdapter");


class ConstructorAdapter extends DependencyResolvingAdapter {

    constructor(name, constructorFunction, dependencyNames) {
        dependencyNames = dependencyNames || ReflectionUtils.getDependencyNames(constructorFunction);

        var factory = function () {
            return ReflectionUtils.createInstance(constructorFunction, arguments);
        };

        super(name, factory, dependencyNames);
    }

}

module.exports = ConstructorAdapter;
