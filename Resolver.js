"use strict";


function Resolver(registry, wrappedResolvers) {
    this.registry = registry;
    this.wrappedResolvers = wrappedResolvers;
}

Resolver.prototype = {

    get: function (name) {
        return this.resolve(name) || this.resolveInWrappedResolver(name);
    },

    resolve: function (name) {
        var factory = this.registry.lookup(name);

        if (!factory) {
            name = this.toPascalCase(name);
            factory = this.registry.lookup(name);
        }

        if (factory) {
            var dependencies = this.resolveDependencies(factory.dependencyNames, name);

            return factory.factory.apply(null, dependencies);
        }
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

    resolveInWrappedResolver: function (name) {
        var found;

        this.wrappedResolvers.some(function (resolver) {
            found = resolver.get(name);
            return found;
        });

        return found;
    }

};

module.exports = Resolver;
