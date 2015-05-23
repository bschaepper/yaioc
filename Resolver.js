"use strict";


function Resolver(container) {
    this.container = container;
}

Resolver.prototype = {

    get: function (name) {
        return this.resolve(name) || this.resolveInWrappedContainer(name);
    },

    resolve: function (name) {
        var factory = this.lookup(name);

        if (!factory) {
            name = this.toPascalCase(name);
            factory = this.lookup(name);
        }

        if (factory) {
            var dependencies = this.resolveDependencies(factory.dependencyNames, name);

            return factory.factory.apply(null, dependencies);
        }
    },

    lookup: function (name) {
        return this.container.factories[name];
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
        return this.container.wrappedContainer && this.container.wrappedContainer.get(name);
    }

};

module.exports = Resolver;
