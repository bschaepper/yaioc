"use strict";

const chai = require("chai");
const expect = chai.expect;

const yaioc = require("../yaioc");

const TargetFunction = require("./TestMocks").TargetFunction;


describe("Yaioc Behaviors Tests", () => {

    let container;

    beforeEach(() => {
        container = yaioc.container();
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
