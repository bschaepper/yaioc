"use strict";

const chai = require("chai");
const expect = chai.expect;

const yaioc = require("../yaioc");

const TargetFunction = require("./TestMocks").TargetFunction;


describe("DependencySchema Test", () => {

    let container;

    beforeEach(() => {
        container = yaioc.container();
        container.register(TargetFunction);
        container.registerAdaptor("dependencyOne", { dependencyNames: ["foo", "bar"] });
        container.register("dependencyTwo", {});
        container.register("foo", {});
        container.register("bar", {});
    });

    describe("getRegisteredNames", () => {
        it("returns all registered names in the container", () => {
            expect(container.getRegisteredNames()).to.be.eql([
                "targetFunction",
                "TargetFunction",
                "dependencyOne",
                "dependencyTwo",
                "foo",
                "bar",
            ]);
        });
    });

    describe("getDependencySchema", () => {
        const expectedResult = `
digraph yaiocDeps {
  targetFunction -> dependencyOne;
  targetFunction -> dependencyTwo;
  dependencyOne -> foo;
  dependencyOne -> bar;
}`.trim();

        it("returns schema in a dot file format", () => {
            expect(container.getDependencySchema().getDependencyDotFile()).to.be.eql(expectedResult);

        });
        it("returns schema in a dot file format", () => {
            const parentContainer = yaioc.container(container);
            expect(parentContainer.getDependencySchema().getDependencyDotFile()).to.be.eql(expectedResult);

        });
    });
});
