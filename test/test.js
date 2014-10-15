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

        it("should instantiate object with dependencies", function () {
            var dependencyOne = {};
            container.register("dependencyOne", dependencyOne);
            var dependencyTwo = {};
            container.register("dependencyTwo", dependencyTwo);

            container.register("TargetFunction", TargetFunction);

            var instance = container.get("TargetFunction");

            expect(instance.args.length).to.be.eql(2);
            expect(instance.dependencyOne).to.be.eql(dependencyOne);
            expect(instance.dependencyTwo).to.be.eql(dependencyTwo);
            expect(instance).to.be.instanceof(TargetFunction);
        });

        it("should throw if dependency cannot be resolved" /*

         resolveDependencies: function (constructorFunction, name) {
         var dependencies = this.getDependencyNames(constructorFunction);
         return dependencies.map(function (dependencyName) {
         var dependency = this.get(dependencyName);

         if (!dependency) {
         throw new Error("Could not satisfy dependency '" + dependencyName + "' required by '" + name + "'");
         }

         return dependency;
         }, this);
         },

        */);

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

            expect("TargetFunction" in container.dependencies).to.be.eql(true);
            expect(container.dependencies.TargetFunction).to.be.eql(TargetFunction);
        });

        it("should throw if no name is present and cannot be resolver", function () {

            var callRegister = container.register.bind({});

            expect(callRegister).to.throw(/no name provided for dependency/);
        });

    });

    describe("getDependencyNames", function () {

        it("should return empty list if no dependencies found", function () {

            var names = container.getDependencyNames(function () {
            });

            expect(names).to.be.an("array");
            expect(names.length).to.be.eql(0);
        });

        it("should return names of dependencies found", function () {

            var names = container.getDependencyNames(TargetFunction);

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

    });

});
