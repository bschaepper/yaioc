"use strict";

const chai = require("chai");
const expect = chai.expect;

const yaioc = require("../yaioc");

const TargetFunction = require("./TestMocks").TargetFunction;
const TargetClass = require("./TestMocks").TargetClass;


describe("Register and Resolve Tests", () => {

    let container;

    beforeEach(() => {
        container = yaioc.container();
    });

    describe("register and resolve value objects", () => {

        it("should return simple value objects", () => {
            const dependencyOne = {};
            container.registerValue("dependencyOne", dependencyOne);

            const resolved = container.get("dependencyOne");

            expect(resolved).to.be.equal(dependencyOne);
        });

        it("should return simple value objects registered via general method", () => {
            const dependencyOne = {};
            container.register("dependencyOne", dependencyOne);

            const resolved = container.get("dependencyOne");

            expect(resolved).to.be.equal(dependencyOne);
        });

    });

    describe("register and resolve classes and dependencies", () => {

        it("should instantiate object with dependencies", () => {
            const dependencyOne = {};
            container.register("dependencyOne", dependencyOne);
            const dependencyTwo = {};
            container.register("dependencyTwo", dependencyTwo);
            container.registerConstructor("TargetFunction", TargetFunction);

            const instance = container.get("targetFunction");

            expect(instance.args.length).to.be.eql(2);
            expect(instance.dependencyOne).to.be.eql(dependencyOne);
            expect(instance.dependencyTwo).to.be.eql(dependencyTwo);
            expect(instance).to.be.instanceof(TargetFunction);
        });

        it("should instantiate object with dependencies via general method", () => {
            container.register("dependencyOne", {});
            container.register("dependencyTwo", {});
            container.register("TargetFunction", TargetFunction);

            const instance = container.get("targetFunction");

            expect(instance.args.length).to.be.eql(2);
            expect(instance).to.be.instanceof(TargetFunction);
        });

        it("should instantiate classes with dependencies", () => {
            const dependencyOne = {};
            container.register("dependencyOne", dependencyOne);
            const dependencyTwo = {};
            container.register("dependencyTwo", dependencyTwo);
            container.registerConstructor("TargetClass", TargetClass);

            const instance = container.get("targetClass");

            expect(instance.args.length).to.be.eql(2);
            expect(instance.dependencyOne).to.be.eql(dependencyOne);
            expect(instance.dependencyTwo).to.be.eql(dependencyTwo);
            expect(instance).to.be.instanceof(TargetClass);
        });

        it("should instantiate classes with dependencies via general method", () => {
            container.register("dependencyOne", {});
            container.register("dependencyTwo", {});
            container.register("TargetClass", TargetClass);

            const instance = container.get("targetClass");

            expect(instance.args.length).to.be.eql(2);
            expect(instance).to.be.instanceof(TargetClass);
        });

        it("should instantiate classes with default (no) constructor", () => {
            const EmptyClass = class {};
            container.register("dependencyOne", {});
            container.register("dependencyTwo", {});
            container.register("TargetClass", EmptyClass);

            const instance = container.get("targetClass");

            expect(instance).to.be.instanceof(EmptyClass);
        });

        it("should not instantiate classes which is resolved with upper camel case name", () => {
            const EmptyClass = class {};
            container.register("dependencyOne", {});
            container.register("dependencyTwo", {});
            container.register("TargetClass", EmptyClass);

            const resolved = container.get("TargetClass");

            expect(resolved).to.be.equal(EmptyClass);
        });

        it("should resolve types which end in upper case", () => {
            function TypeAB() { TargetFunction.call(this); }

            container.register(TypeAB);

            const instance = container.get("typeAB");
            expect(instance).to.be.instanceof(TypeAB);
        });

        it("should use name of function if present", () => {

            container.register(TargetFunction);

            expect(container.adaptors.has("TargetFunction")).to.be.eql(true);
        });

        it("should instantiate registered constructor function as dependency", () => {
            function Dependency() {}
            function Target(dependency) { this.dependency = dependency; }
            container.register(Dependency);
            container.register(Target);

            const targetInstance = container.get("target");

            expect(targetInstance.dependency).to.be.instanceof(Dependency);
        });

    });

    describe("registerFactory", () => {

        it("should resolve to result of given function", () => {
            const result = {};
            container.registerFactory("factoryThing", () => {
                return result;
            });

            const actualResult = container.get("factoryThing");

            expect(actualResult).to.be.eql(result);
        });

        it("should resolve and provide dependencies of given function", () => {
            const dependencyOne = {};
            container.register("dependencyOne", dependencyOne);
            container.registerFactory("factoryThing", (dependencyOne) => {
                return dependencyOne;
            });

            const actualResult = container.get("factoryThing");

            expect(actualResult).to.be.equal(dependencyOne);
        });

        it("should resolve and provide dependencies of given cached function", () => {
            const dependencyOne = {};
            container.register("dependencyOne", dependencyOne);
            container.cache().registerFactory("factoryThing", (dependencyOne) => {
                return dependencyOne;
            });

            const actualResult = container.get("factoryThing");

            expect(actualResult).to.be.equal(dependencyOne);
        });

    });

    describe("registerAdaptor", () => {

        it("should resolve to result of given function", () => {
            const result = {};
            container.registerAdaptor("adaptorThing", () => {
                return result;
            });

            const actualResult = container.get("adaptorThing");

            expect(actualResult).to.be.eql(result);
        });

        it("should resolve to result of given adaptor object", () => {
            const result = {};
            container.registerAdaptor("adaptorThing", {
                getComponentInstance: function () {
                    return result;
                }
            });

            const actualResult = container.get("adaptorThing");

            expect(actualResult).to.be.eql(result);
        });

        it("should call adaptor with container", () => {
            let actualContainer;
            function IntoThing (adaptorThing) {
                console.log(adaptorThing);
            }
            container.register(IntoThing);
            container.registerAdaptor("adaptorThing", (container) => {
                actualContainer = container;
                return {};
            });

            container.get("intoThing");

            expect(actualContainer).to.be.eql(container);
        });

        it("should call adaptor with insertion point name", () => {
            let actualInto;
            function IntoThing (adaptorThing) {
                console.log(adaptorThing);
            }
            container.register(IntoThing);
            container.registerAdaptor("adaptorThing", (container, into) => {
                actualInto = into;
                return {};
            });

            container.get("intoThing");

            expect(actualInto).to.be.eql("intoThing");
        });

        it("should call adaptor with insertion point name undefined for top level get", () => {
            let actualInto;
            container.registerAdaptor("adaptorThing", (container, into) => {
                actualInto = into;
                return {};
            });

            container.get("adaptorThing");

            expect(actualInto).to.be.eql(void 0);
        });

    });

});
