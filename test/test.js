"use strict";

var chai = require("chai");
var expect = chai.expect;

var yaioc = require("../yaioc.js");

var TargetFunction = require("./TestMocks").TargetFunction;
var TargetClass = require("./TestMocks").TargetClass;


describe("yaioc test", function () {

    var container;

    beforeEach(function () {
        container = yaioc.container();
    });

    describe("register and resolve", function () {

        it("should return simple value objects", function () {
            var dependencyOne = {};
            container.registerValue("dependencyOne", dependencyOne);

            var resolved = container.get("dependencyOne");

            expect(resolved).to.be.equal(dependencyOne);
        });

        it("should return simple value objects registered via general method", function () {
            var dependencyOne = {};
            container.register("dependencyOne", dependencyOne);

            var resolved = container.get("dependencyOne");

            expect(resolved).to.be.equal(dependencyOne);
        });

        it("should instantiate object with dependencies", function () {
            var dependencyOne = {};
            container.register("dependencyOne", dependencyOne);
            var dependencyTwo = {};
            container.register("dependencyTwo", dependencyTwo);

            container.registerConstructor("TargetFunction", TargetFunction);

            var instance = container.get("TargetFunction");

            expect(instance.args.length).to.be.eql(2);
            expect(instance.dependencyOne).to.be.eql(dependencyOne);
            expect(instance.dependencyTwo).to.be.eql(dependencyTwo);
            expect(instance).to.be.instanceof(TargetFunction);
        });

        it("should instantiate object with dependencies via general method", function () {
            container.register("dependencyOne", {});
            container.register("dependencyTwo", {});
            container.register("TargetFunction", TargetFunction);

            var instance = container.get("TargetFunction");

            expect(instance.args.length).to.be.eql(2);
            expect(instance).to.be.instanceof(TargetFunction);
        });

        it("should instantiate classes with dependencies", function () {
            var dependencyOne = {};
            container.register("dependencyOne", dependencyOne);
            var dependencyTwo = {};
            container.register("dependencyTwo", dependencyTwo);

            container.registerConstructor("TargetClass", TargetClass);

            var instance = container.get("TargetClass");

            expect(instance.args.length).to.be.eql(2);
            expect(instance.dependencyOne).to.be.eql(dependencyOne);
            expect(instance.dependencyTwo).to.be.eql(dependencyTwo);
            expect(instance).to.be.instanceof(TargetClass);
        });

        it("should instantiate classes with dependencies via general method", function () {
            container.register("dependencyOne", {});
            container.register("dependencyTwo", {});
            container.register("TargetClass", TargetClass);

            var instance = container.get("TargetClass");

            expect(instance.args.length).to.be.eql(2);
            expect(instance).to.be.instanceof(TargetClass);
        });

        it("should instantiate classes with default (no) constructor", function () {
            var EmptyClass = class {};
            container.register("dependencyOne", {});
            container.register("dependencyTwo", {});
            container.register("TargetClass", EmptyClass);

            var instance = container.get("TargetClass");

            expect(instance).to.be.instanceof(EmptyClass);
        });

        it("should resolve types which end in upper case", function () {
            function TypeAB() { TargetFunction.call(this); }

            container.register(TypeAB);

            var instance = container.get("typeAB");
            expect(instance).to.be.instanceof(TypeAB);
        });

        it("should use name of function if present", function () {

            container.register(TargetFunction);

            expect("TargetFunction" in container.registry.factories).to.be.eql(true);
        });

    });

    describe("errors", function () {

        it("should throw if dependency cannot be resolved", function () {
            var container = yaioc.container();
            container.register(TargetFunction);

            var action = container.get.bind(container, "targetFunction");

            expect(action).to.throw(/Could not satisfy dependency/);
        });

        it("should include name of missing dependency", function () {
            var container = yaioc.container();
            container.register(TargetFunction);

            var action = container.get.bind(container, "targetFunction");

            expect(action).to.throw(/dependencyOne/);
        });

        it("should include traget name of missing dependency", function () {
            var container = yaioc.container();
            container.register(TargetFunction);

            var action = container.get.bind(container, "targetFunction");

            expect(action).to.throw(/TargetFunction/);
        });

        it("should throw if no name is present and cannot be resolved", function () {

            var callRegister = container.register.bind(container, {});

            expect(callRegister).to.throw(/no name provided for dependency/);
        });

    });

    describe("get", function () {

        it("should instantiate registered constructor function as dependency", function () {
            function Dependency() {}
            function Target(dependency) { this.dependency = dependency; }
            container.register(Dependency);
            container.register(Target);

            var targetInstance = container.get("Target");

            expect(targetInstance.dependency).to.be.instanceof(Dependency);
        });

    });

    describe("cache", function () {

        it("should resolve to new instance on every call", function () {
            container.register("dependencyOne", {});
            container.register("dependencyTwo", {});
            container.register(TargetFunction);

            var instanceA = container.get("targetFunction");
            var instanceB = container.get("targetFunction");

            expect(instanceA).to.be.instanceof(TargetFunction);
            expect(instanceB).to.be.instanceof(TargetFunction);
            expect(instanceA === instanceB).to.be.eql(false);
        });

        it("should resolve to same instance on every call, when registered in cache", function () {
            container.register("dependencyOne", {});
            container.register("dependencyTwo", {});
            container.cache().register(TargetFunction);

            var instanceA = container.get("targetFunction");
            var instanceB = container.get("targetFunction");

            expect(instanceA).to.be.instanceof(TargetFunction);
            expect(instanceB).to.be.instanceof(TargetFunction);
            expect(instanceA === instanceB).to.be.eql(true);
        });

    });

    describe("registerFactory", function () {

        it("should resolve to result of given function", function () {
            var result = {};
            container.registerFactory("factoryThing", function () {
                return result;
            });

            var actualResult = container.get("factoryThing");

            expect(actualResult).to.be.eql(result);
        });

        it("should resolve and provide dependencies of given function", function () {
            var dependencyOne = {};
            container.register("dependencyOne", dependencyOne);
            container.registerFactory("factoryThing", function (dependencyOne) {
                return dependencyOne;
            });

            var actualResult = container.get("factoryThing");

            expect(actualResult).to.be.equal(dependencyOne);
        });

        it("should resolve and provide dependencies of given cached function", function () {
            var dependencyOne = {};
            container.register("dependencyOne", dependencyOne);
            container.cache().registerFactory("factoryThing", function (dependencyOne) {
                return dependencyOne;
            });

            var actualResult = container.get("factoryThing");

            expect(actualResult).to.be.equal(dependencyOne);
        });

    });

    describe("registerAdaptor", function () {

        it("should resolve to result of given function", function () {
            var result = {};
            container.registerAdaptor("adaptorThing", function () {
                return result;
            });

            var actualResult = container.get("adaptorThing");

            expect(actualResult).to.be.eql(result);
        });

        it("should call adaptor with container", function () {
            var actualContainer;
            function IntoThing (adaptorThing) {
                console.log(adaptorThing);
            }
            container.register(IntoThing);
            container.registerAdaptor("adaptorThing", function (container) {
                actualContainer = container;
                return {};
            });

            container.get("intoThing");

            expect(actualContainer).to.be.eql(container);
        });

    });

    describe("ease of use", function () {

        it("yaioc() should return a Container instance", function () {
            var container = yaioc();

            expect(container).to.be.instanceof(yaioc.Container);
        });

        it("yaioc() should return always the same Container instance", function () {
            var container1 = yaioc();
            var container2 = yaioc();

            expect(container1 === container2).to.be.eql(true);
        });

    });

    describe("child containers", function () {

        it("should optionally take a container in constructor, which is used for dependency resolving", function () {
            var wrappedContainer = yaioc.container();
            var container = yaioc.container(wrappedContainer);

            var foo = {};
            wrappedContainer.register("foo", foo);

            var resolvedFoo = container.get("foo");

            expect(resolvedFoo === foo).to.be.eql(true);
        });

        it("should optionally take an array of child containers", function () {
            var childContainers = [yaioc.container(), yaioc.container()];
            var container = yaioc.container(childContainers);

            var foos = [{}, {}];
            childContainers[0].register("foo0", foos[0]);
            childContainers[1].register("foo1", foos[1]);

            var resolvedFoos = [container.get("foo0"), container.get("foo1")];

            expect(resolvedFoos[0] === foos[0]).to.be.eql(true);
            expect(resolvedFoos[1] === foos[1]).to.be.eql(true);
        });

        it("should not resolve dependencies in outer container", function () {
            var wrappedContainer = yaioc.container();
            var container = yaioc.container(wrappedContainer);

            var foo = {};
            container.register("foo", foo);

            var resolvedFoo = wrappedContainer.get("foo");

            expect(resolvedFoo).to.be.eql(void 0);
        });

        it("should resolve constructors in wrapped container", function () {
            var wrappedContainer = yaioc.container();
            var container = yaioc.container(wrappedContainer);
            wrappedContainer.register(TargetFunction);
            wrappedContainer.register("dependencyOne", {});
            wrappedContainer.register("dependencyTwo", {});

            var targetFunction = container.get("targetFunction");

            expect(targetFunction).to.be.a.instanceof(TargetFunction);
        });

    });

});
