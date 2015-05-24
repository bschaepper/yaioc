"use strict";

var chai = require("chai");
var expect = chai.expect;

var yaioc = require("../yaioc.js");


describe("yaioc test", function () {

    function TargetFunction(dependencyOne, dependencyTwo) {
        this.args = arguments;
        this.dependencyOne = dependencyOne;
        this.dependencyTwo = dependencyTwo;
    }

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

        it("should resolve types which end in upper case", function () {
            function TypeAB() { TargetFunction.call(this); }

            container.register(TypeAB);

            var instance = container.get("typeAB");
            expect(instance).to.be.instanceof(TypeAB);
        });

    });

    describe("get", function () {

        it("should instanciate registered constructor function as dependency", function () {
            function Dependency() {}
            function Target(dependency) { this.dependency = dependency; }
            container.register(Dependency);
            container.register(Target);

            var targetInstance = container.get("Target");

            expect(targetInstance.dependency).to.be.instanceof(Dependency);
        });

    });

    describe("register", function () {

        it("should use name of function if present", function () {

            container.register(TargetFunction);

            expect("TargetFunction" in container.registry.factories).to.be.eql(true);
        });

        it("should throw if no name is present and cannot be resolver", function () {

            var callRegister = container.register.bind(container, {});

            expect(callRegister).to.throw(/no name provided for dependency/);
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

    });

    describe("getDependencyNames", function () {

        it("should return empty list if no dependencies found", function () {

            var names = container.registry.getDependencyNames(function () {
            });

            expect(names).to.be.an("array");
            expect(names.length).to.be.eql(0);
        });

        it("should return names of dependencies found", function () {

            var names = container.registry.getDependencyNames(TargetFunction);

            expect(names).to.be.eql(["dependencyOne", "dependencyTwo"]);
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
