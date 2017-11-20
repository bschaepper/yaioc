"use strict";

class DependencyGraphPrinter {

    constructor(graph) {
        this.graph = graph;
    }

    draw() {
        const children = this.visit(this.graph);
        children.unshift(this.graph.name);
        return children.join("\n");
    }

    visit(root) {
        const nodes = root.dependencies || [];
        return this.visitNodes(nodes).reduce((a, b) => a.concat(b), []);
    }

    visitNodes(dependencies) {
        return dependencies.map((node, i) => {
            const isLast = i === dependencies.length - 1;
            return this.visitNode(node, isLast);
        });
    }

    visitNode(node, isLast) {
        const dependencies = this.visit(node).map((s) => (isLast ? "  " : "│") + s);
        const nodeString = this.formatNode(isLast, dependencies, node);
        dependencies.unshift(nodeString);
        return dependencies;
    }

    formatNode(isLast, dependencies, node) {
        const nodePrefix = isLast ? "└" : "├";
        const childrenPrefix = dependencies.length ? "┬ " : "─ ";
        return nodePrefix + childrenPrefix + node.name;
    }
}

module.exports = DependencyGraphPrinter;
