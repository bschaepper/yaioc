"use strict";

class DependencySchema {

    constructor(resolver) {
        this.resolver = resolver;
    }

    /**
     *
     * @param {{dependencyNames?: string[]}} component
     * @return {string[]}
     */
    getComponentDependencies(component) {
        const dependencyNames = component.dependencyNames || [];

        return dependencyNames;
    }

    /**
     * @return {[name: string, deps: string[]][]}
     */
    getSchema () {
        const registeredNames = this.resolver.resolveRegisteredNames();
        const schema = registeredNames.map((name) => {
            const component = this.resolver.lookupDeep(name);
            const depsNames = this.getComponentDependencies(component);

            return [name, depsNames];
        });

        return schema;
    }

    /**
     * @return {string}
     */
    getDependencyDotFile () {
        const schema = this.getSchema();
        const depsPairsForDot = [].concat(...schema.map(([name, deps]) => deps.map(dep => `  ${name} -> ${dep};`)));
        const dotFileContent = [].concat(
            "digraph yaiocDeps {",
            depsPairsForDot,
            "}"
        ).join("\n");

        return dotFileContent;
    }
}

module.exports = DependencySchema;