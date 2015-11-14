"use strict";


function Resolver(container, wrappedResolvers) {
    this.container = container;
    this.wrappedResolvers = wrappedResolvers;
}

Resolver.prototype = {

    get: function (name, target) {
        return this.resolve(name, target) || this.resolveInWrappedResolver(name, target);
    },

    resolve: function (name, target) {
        var adaptor = this.container.lookup(name);

        if (!adaptor) {
            name = this.toPascalCase(name);
            adaptor = this.container.lookup(name);
        }

        if (adaptor) {
            return adaptor.getComponentInstance(this.container, target);
        }
    },

    toPascalCase: function (name) {
        return name[0].toUpperCase() + name.substring(1);
    },

    resolveInWrappedResolver: function (name, target) {
        var found;

        this.wrappedResolvers.some(function (resolver) {
            found = resolver.get(name, target);
            return found;
        });

        return found;
    }

};

module.exports = Resolver;
