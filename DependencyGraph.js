"use strict";

var DependencyGraphPrinter = require("./DependencyGraphPrinter");


class DependencyGraph {

    constructor(resolver, dependencyName) {
        this.resolver = resolver;
        this.stack = [];
        Object.assign(this, this.getDependencyGraph(dependencyName));
    }

    getDependencyGraph(dependencyName) {
        this.pushStack(dependencyName);
        var dependency = this.lookup(dependencyName);
        var node = this.createNode(dependency, dependencyName);
        this.popStack();

        return node;
    }

    pushStack(dependencyName) {
        var stackIndex = this.stack.indexOf(dependencyName);
        this.stack.push(dependencyName);

        if (stackIndex !== -1) {
            throw new Error("circular reference detected: " + this.getReferenceTrace(stackIndex));
        }
    }

    getReferenceTrace(stackIndex) {
        return this.stack.slice(stackIndex).join(" -> ");
    }

    popStack() {
        return this.stack.pop();
    }

    lookup(dependencyName) {
        var dependency = this.resolver.lookupDeep(dependencyName);

        if (!dependency) {
            throw new Error("no component with given name '" + dependencyName + "' was found");
        }

        return dependency;
    }

    createNode(dependency, dependencyName) {
        var dependencyNames = dependency.dependencyNames || [];

        return {
            name: dependencyName,
            dependencies: dependencyNames.map((name) => this.getDependencyGraph(name))
        };
    }

    draw() {
        return new DependencyGraphPrinter(this).draw();
    }

}

module.exports = DependencyGraph;