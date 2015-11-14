"use strict";


function Resolver(container, wrappedResolvers) {
    this.container = container;
    this.wrappedResolvers = wrappedResolvers;
}

Resolver.prototype = {

    get: function (name) {
        return this.resolve(name) || this.resolveInWrappedResolver(name);
    },

    resolve: function (name) {
        var adaptor = this.container.lookup(name);

        if (!adaptor) {
            name = this.toPascalCase(name);
            adaptor = this.container.lookup(name);
        }

        if (adaptor) {
            return adaptor.getComponentInstance(this.container);
        }
    },

    toPascalCase: function (name) {
        return name[0].toUpperCase() + name.substring(1);
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
