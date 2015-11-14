"use strict";

var ReflectionUtils = require("./ReflectionUtils");


class DependencyResolvingAdapter {

    constructor(name, factory, dependencyNames) {
        this.name = name;
        this.factoryCallback = factory;
        this.dependencyNames = dependencyNames || ReflectionUtils.getDependencyNames(factory);
    }

    getComponentInstance(container) {
        var dependencies = this.resolveDependencies(container);
        return this.factoryCallback.apply(null, dependencies);
    }

    resolveDependencies(container) {
        var dependencies = this.lookupDependencies(container);
        dependencies.forEach(this.checkDependency, this);

        return dependencies;
    }

    lookupDependencies(container) {
        return this.dependencyNames.map((dependency) => container.get(dependency, this.name));
    }

    checkDependency(dependency, index) {
        if (!dependency) {
            var dependencyName = this.dependencyNames[index];
            throw new Error("Could not satisfy dependency '" + dependencyName + "' required by '" + this.name + "'");
        }
    }

}

module.exports = DependencyResolvingAdapter;
