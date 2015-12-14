"use strict";

var chai = require("chai");
var expect = chai.expect;

var yaioc = require("../yaioc");
var DependencyGraph = require("../DependencyGraph");

var TargetFunction = require("./TestMocks").TargetFunction;


describe("Dependency Graph Test", function () {

    var container;

    beforeEach(function () {
        container = yaioc.container();
        container.register(TargetFunction);
        container.registerAdaptor("dependencyOne", { dependencyNames: ["foo", "bar"] });
        container.register("dependencyTwo", {});
        container.register("foo", {});
        container.register("bar", {});
    });

    describe("getDependencyGraph", function () {

        it("should get dependency graph", function () {

            var graph = container.getDependencyGraph("TargetFunction");

            expect(graph).to.be.an.instanceof(DependencyGraph);
            expect(graph.name).to.be.eql("TargetFunction");
            expect(graph.dependencies.length).to.be.eql(2);
            expect(graph.dependencies[0].name).to.be.eql("dependencyOne");
            expect(graph.dependencies[0].dependencies.length).to.be.eql(2);
            expect(graph.dependencies[0].dependencies[0].name).to.be.eql("foo");
            expect(graph.dependencies[0].dependencies[1].name).to.be.eql("bar");
            expect(graph.dependencies[1].name).to.be.eql("dependencyTwo");
        });

        it("should draw dependency graph", function () {
            container.register(TargetFunction);
            container.register("dependencyOne", {});
            container.register("dependencyTwo", {});

            var graph = container.getDependencyGraph("TargetFunction");

            expect(graph.draw()).to.be.eql([
                "TargetFunction",
                "├─ dependencyOne",
                "└─ dependencyTwo"
            ].join("\n"));
        });

        it("should draw deep dependency graph", function () {
            var graph = new DependencyGraph({
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

        it("should throw if component with given name was not found", function () {
            var error = "no component with given name 'nothing' was found";

            var getOperation = container.getDependencyGraph.bind(container, "nothing");

            expect(getOperation).to.throw(error);
        });

        it("should throw if there is a circular dependency", function () {
            var error = "circular reference detected: a -> b -> a";
            container.registerFactory("a", () => {}, ["b"]);
            container.registerFactory("b", () => {}, ["a"]);

            var getOperation = container.getDependencyGraph.bind(container, "a");

            expect(getOperation).to.throw(error);
        });

    });

});
