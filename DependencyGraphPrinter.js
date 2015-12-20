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
        var nodes = root.dependencies || [];
        return this.visitNodes(nodes).reduce((a, b) => a.concat(b), []);
    }

    visitNodes(dependencies) {
        return dependencies.map((node, i) => {
            var isLast = i === dependencies.length - 1;
            return this.visitNode(node, isLast);
        });
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
