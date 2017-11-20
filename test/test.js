"use strict";

const chai = require("chai");
const expect = chai.expect;

const yaioc = require("../yaioc");

const TargetFunction = require("./TestMocks").TargetFunction;
const TargetClass = require("./TestMocks").TargetClass;


describe("yaioc test", () => {

    let container;

    beforeEach(() => {
        container = yaioc.container();
    });

    describe("register and resolve", () => {

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

    describe("errors", () => {

        it("should throw if dependency cannot be resolved", () => {
            const container = yaioc.container();
            container.register(TargetFunction);

            const action = container.get.bind(container, "targetFunction");

            expect(action).to.throw(/Could not satisfy dependency/);
        });

        it("should include name of missing dependency", () => {
            const container = yaioc.container();
            container.register(TargetFunction);

            const action = container.get.bind(container, "targetFunction");

            expect(action).to.throw(/dependencyOne/);
        });

        it("should include traget name of missing dependency", () => {
            const container = yaioc.container();
            container.register(TargetFunction);

            const action = container.get.bind(container, "targetFunction");

            expect(action).to.throw(/TargetFunction/i);
        });

        it("should throw if no name is present and cannot be resolved", () => {

            const callRegister = container.register.bind(container, {});

            expect(callRegister).to.throw(/no name provided for dependency/);
        });

    });

    describe("cache", () => {

        it("should resolve to new instance on every call", () => {
            container.register("dependencyOne", {});
            container.register("dependencyTwo", {});
            container.register(TargetFunction);

            const instanceA = container.get("targetFunction");
            const instanceB = container.get("targetFunction");

            expect(instanceA).to.be.instanceof(TargetFunction);
            expect(instanceB).to.be.instanceof(TargetFunction);
            expect(instanceA === instanceB).to.be.eql(false);
        });

        it("should resolve to same instance on every call, when registered in cache", () => {
            container.register("dependencyOne", {});
            container.register("dependencyTwo", {});
            container.cache().register(TargetFunction);

            const instanceA = container.get("targetFunction");
            const instanceB = container.get("targetFunction");

            expect(instanceA).to.be.instanceof(TargetFunction);
            expect(instanceB).to.be.instanceof(TargetFunction);
            expect(instanceA === instanceB).to.be.eql(true);
        });

        it("should forgive subsequent cache() calls and return same cache", () => {
            const cachedContainer1 = container.cache();

            const cachedContainer2 = cachedContainer1.cache();

            expect(cachedContainer1 === cachedContainer2).to.be.eql(true);
        });

        it("should allow short form of adaptor to be cached", () => {
            container.cache().registerAdaptor("targetAdaptor", () => {
                return {};
            });

            const instanceA = container.get("targetAdaptor");
            const instanceB = container.get("targetAdaptor");

            expect(instanceA === instanceB).to.be.eql(true);
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

    describe("ease of use", () => {

        it("yaioc() should return a Container instance", () => {
            const container = yaioc();

            expect(container).to.be.instanceof(yaioc.Container);
        });

        it("yaioc() should return always the same Container instance", () => {
            const container1 = yaioc();
            const container2 = yaioc();

            expect(container1 === container2).to.be.eql(true);
        });

    });

    describe("child containers", () => {

        it("should optionally take a container in constructor, which is used for dependency resolving", () => {
            const wrappedContainer = yaioc.container();
            const container = yaioc.container(wrappedContainer);

            const foo = {};
            wrappedContainer.register("foo", foo);

            const resolvedFoo = container.get("foo");

            expect(resolvedFoo === foo).to.be.eql(true);
        });

        it("should optionally take an array of child containers", () => {
            const childContainers = [yaioc.container(), yaioc.container()];
            const container = yaioc.container(childContainers);

            const foos = [{}, {}];
            childContainers[0].register("foo0", foos[0]);
            childContainers[1].register("foo1", foos[1]);

            const resolvedFoos = [container.get("foo0"), container.get("foo1")];

            expect(resolvedFoos[0] === foos[0]).to.be.eql(true);
            expect(resolvedFoos[1] === foos[1]).to.be.eql(true);
        });

        it("should not resolve dependencies in outer container", () => {
            const wrappedContainer = yaioc.container();
            const container = yaioc.container(wrappedContainer);

            const foo = {};
            container.register("foo", foo);

            const resolvedFoo = wrappedContainer.get("foo");

            expect(resolvedFoo).to.be.eql(void 0);
        });

        it("should resolve constructors in wrapped container", () => {
            const wrappedContainer = yaioc.container();
            const container = yaioc.container(wrappedContainer);
            wrappedContainer.register(TargetFunction);
            wrappedContainer.register("dependencyOne", {});
            wrappedContainer.register("dependencyTwo", {});

            const targetFunction = container.get("targetFunction");

            expect(targetFunction).to.be.a.instanceof(TargetFunction);
        });

    });

    describe("component scan", () => {

        it("should match components and add to container", () => {

            container.scanComponents(__dirname + "/**/*Mocks.js");

            expect(container.lookup("TestMocks")).to.be.an("object");
        });

    });

});
