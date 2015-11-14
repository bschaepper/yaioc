"use strict";

var ReflectionUtils = require("./ReflectionUtils");


function DependencyResolvingAdapter(name, factory, dependencyNames) {
    this.name = name;
    this.factoryCallback = factory;
    this.dependencyNames = dependencyNames || ReflectionUtils.getDependencyNames(factory);
}

DependencyResolvingAdapter.prototype = {

    getComponentInstance: function (container) {
        var dependencies = this.resolveDependencies(container);
        return this.factoryCallback.apply(null, dependencies);
    },

    resolveDependencies: function (container) {
        var dependencies = this.dependencyNames.map(container.get, container);
        dependencies.forEach(this.checkDependency.bind(this, this.dependencyNames, this.name));

        return dependencies;
    },

    checkDependency: function (dependencyNames, name, dependency, index) {
        if (!dependency) {
            throw new Error("Could not satisfy dependency '" + dependencyNames[index] + "' required by '" + name + "'");
        }
    }

};

module.exports = DependencyResolvingAdapter;
