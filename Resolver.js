"use strict";


class Resolver {

    constructor(container, wrappedResolvers) {
        this.container = container;
        this.wrappedResolvers = wrappedResolvers;
    }

    get(name, target) {
        return this.resolve(name, target) || this.resolveInWrappedResolver(name, target);
    }

    resolveRegisteredNames() {
        const wrappedNames = [].concat(...this.wrappedResolvers.map((resolver) => resolver.resolveRegisteredNames()));
        const uniqueNames =  [...new Set([
            ...this.container.getRegisteredNames(),
            ...wrappedNames
        ])];

        return uniqueNames;
    }

    resolve(name, target) {
        const adaptor = this.lookup(name);

        if (adaptor) {
            return adaptor.getComponentInstance(this.container, target);
        }
    }

    lookup(name) {
        let adaptor = this.container.lookup(name);

        if (!adaptor) {
            name = Resolver.toUpperCamelCase(name);
            adaptor = this.container.lookup(name);
        }

        return adaptor;
    }

    lookupDeep(name) {
        return this.lookup(name) || this.lookupInWrappedResolver(name);
    }

    static toUpperCamelCase(name) {
        return name[0].toUpperCase() + name.substring(1);
    }

    static toLowerCamelCase(name) {
        return name[0].toLowerCase() + name.substring(1);
    }

    resolveInWrappedResolver(name, target) {
        return this.visitWrappedResolvers((resolver) => resolver.get(name, target));
    }

    lookupInWrappedResolver(name) {
        return this.visitWrappedResolvers((resolver) => resolver.lookup(name));
    }

    visitWrappedResolvers(callback) {
        let found;

        this.wrappedResolvers.some((resolver) => {
            found = callback(resolver);
            return found;
        });

        return found;
    }

}

module.exports = Resolver;
