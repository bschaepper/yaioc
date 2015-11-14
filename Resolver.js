"use strict";


class Resolver {

    constructor(container, wrappedResolvers) {
        this.container = container;
        this.wrappedResolvers = wrappedResolvers;
    }

    get(name, target) {
        return this.resolve(name, target) || this.resolveInWrappedResolver(name, target);
    }

    resolve(name, target) {
        var adaptor = this.container.lookup(name);

        if (!adaptor) {
            name = this.toPascalCase(name);
            adaptor = this.container.lookup(name);
        }

        if (adaptor) {
            return adaptor.getComponentInstance(this.container, target);
        }
    }

    toPascalCase(name) {
        return name[0].toUpperCase() + name.substring(1);
    }

    resolveInWrappedResolver(name, target) {
        var found;

        this.wrappedResolvers.some((resolver) => {
            found = resolver.get(name, target);
            return found;
        });

        return found;
    }

}

module.exports = Resolver;
