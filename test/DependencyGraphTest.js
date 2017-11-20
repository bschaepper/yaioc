"use strict";

const chai = require("chai");
const expect = chai.expect;

const yaioc = require("../yaioc");
const DependencyGraph = require("../DependencyGraph");
const DependencyGraphPrinter = require("../DependencyGraphPrinter");

const TargetFunction = require("./TestMocks").TargetFunction;


describe("Dependency Graph Test", () => {

    let container;

    beforeEach(() => {
        container = yaioc.container();
        container.register(TargetFunction);
        container.registerAdaptor("dependencyOne", { dependencyNames: ["foo", "bar"] });
        container.register("dependencyTwo", {});
        container.register("foo", {});
        container.register("bar", {});
    });

    describe("getDependencyGraph", () => {

        it("should get dependency graph", () => {

            const graph = container.getDependencyGraph("targetFunction");

            expect(graph).to.be.an.instanceof(DependencyGraph);
            expect(graph.name).to.be.eql("targetFunction");
            expect(graph.dependencies.length).to.be.eql(2);
            expect(graph.dependencies[0].name).to.be.eql("dependencyOne");
            expect(graph.dependencies[0].dependencies.length).to.be.eql(2);
            expect(graph.dependencies[0].dependencies[0].name).to.be.eql("foo");
            expect(graph.dependencies[0].dependencies[1].name).to.be.eql("bar");
            expect(graph.dependencies[1].name).to.be.eql("dependencyTwo");
        });

        it("should draw dependency graph", () => {
            container.register(TargetFunction);
            container.register("dependencyOne", {});
            container.register("dependencyTwo", {});

            const graph = container.getDependencyGraph("targetFunction");

            expect(graph.draw()).to.be.eql([
                "targetFunction",
                "├─ dependencyOne",
                "└─ dependencyTwo"
            ].join("\n"));
        });

        it("should draw deep dependency graph", () => {
            const graph = new DependencyGraphPrinter({
                name: "TargetFunction",
                dependencies: [
                    {
                        name: "dependencyOne",
                        dependencies: [
                            { name: "foo" },
                            { name: "bar", dependencies: [{ name: "baz" }] }
                        ]
                    }, {
                        name: "dependencyTwo",
                        dependencies: [{ name: "fizz", dependencies: [{ name: "buzz" }] }]
                    },                     {
                        name: "dependencyThree"
                    }
                ]
            });

            expect(graph.draw()).to.be.eql([
                "TargetFunction",
                "├┬ dependencyOne",
                "│├─ foo",
                "│└┬ bar",
                "│  └─ baz",
                "├┬ dependencyTwo",
                "│└┬ fizz",
                "│  └─ buzz",
                "└─ dependencyThree"
            ].join("\n"));
        });

        it("should throw if component with given name was not found", () => {
            const error = "no component with given name 'nothing' was found";

            const getOperation = container.getDependencyGraph.bind(container, "nothing");

            expect(getOperation).to.throw(error);
        });

        it("should throw if there is a circular dependency", () => {
            const error = "circular reference detected: a -> b -> a";
            container.registerFactory("a", () => {}, ["b"]);
            container.registerFactory("b", () => {}, ["a"]);

            const getOperation = container.getDependencyGraph.bind(container, "a");

            expect(getOperation).to.throw(error);
        });

    });

});
