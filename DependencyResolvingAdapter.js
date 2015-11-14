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
        var dependencies = this.lookupDependencies(container);
        dependencies.forEach(this.checkDependency, this);

        return dependencies;
    },

    lookupDependencies: function (container) {
        return this.dependencyNames.map(function (dependency) {
            return container.get(dependency, this.name);
        }, this);
    },

    checkDependency: function (dependency, index) {
        if (!dependency) {
            var dependencyName = this.dependencyNames[index];
            throw new Error("Could not satisfy dependency '" + dependencyName + "' required by '" + this.name + "'");
        }
    }

};

module.exports = DependencyResolvingAdapter;
