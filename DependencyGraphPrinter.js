"use strict";

class DependencyGraphPrinter {

    constructor(graph) {
        this.graph = graph;
    }

    draw() {
        var children = this.visit(this.graph);
        children.unshift(this.graph.name);
        return children.join("\n");
    }

    visit(root) {
        var dependencies = root.dependencies || [];
        return this.flatten(dependencies.map((node, i) => {
            var isLast = i === dependencies.length - 1;
            return this.visitNode(node, isLast);
        }));
    }

    flatten(array) {
        var flattened = [];

        array.forEach((dep) => {
            if (Array.isArray(dep)) {
                flattened = flattened.concat(dep);
            } else {
                flattened.push(dep);
            }
        });

        return flattened;
    }

    visitNode(node, isLast) {
        var dependencies = this.visit(node).map((s) => (isLast ? "  " : "│") + s);
        var nodeString = this.formatNode(isLast, dependencies, node);
        dependencies.unshift(nodeString);
        return dependencies;
    }

    formatNode(isLast, dependencies, node) {
        var nodePrefix = isLast ? "└" : "├";
        var childrenPrefix = dependencies.length ? "┬ " : "─ ";
        return nodePrefix + childrenPrefix + node.name;
    }
}

module.exports = DependencyGraphPrinter;
