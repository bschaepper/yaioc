"use strict";

const ReflectionUtils = require("./ReflectionUtils");
const DependencyResolvingAdapter = require("./DependencyResolvingAdapter");


class ConstructorAdapter extends DependencyResolvingAdapter {

    constructor(name, constructorFunction, dependencyNames) {
        dependencyNames = dependencyNames || ReflectionUtils.getDependencyNames(constructorFunction);

        const factory = function () {
            return ReflectionUtils.createInstance(constructorFunction, arguments);
        };

        super(name, factory, dependencyNames);
    }

}

module.exports = ConstructorAdapter;
