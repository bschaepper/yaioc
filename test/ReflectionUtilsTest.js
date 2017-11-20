"use strict";

const chai = require("chai");
const expect = chai.expect;

const TargetFunction = require("./TestMocks").TargetFunction;
const TargetClass = require("./TestMocks").TargetClass;

const ReflectionUtils = require("../ReflectionUtils");


describe("Reflection Utils Test", () => {

    describe("getDependencyNames", () => {

        it("should return empty list if no dependencies found", () => {

            const names = ReflectionUtils.getDependencyNames(() => {
            });

            expect(names).to.be.an("array");
            expect(names.length).to.be.eql(0);
        });

        it("should return names of dependencies found", () => {

            const names = ReflectionUtils.getDependencyNames(TargetFunction);

            expect(names).to.be.eql(["dependencyOne", "dependencyTwo"]);
        });

        it("should return names of dependencies found in class", () => {

            const names = ReflectionUtils.getDependencyNames(TargetClass);

            expect(names).to.be.eql(["dependencyOne", "dependencyTwo"]);
        });

    });

    describe("isConstructor", () => {

        it("should return true for a pascal case function", () => {

            const isConstructor = ReflectionUtils.isConstructor(TargetFunction, TargetFunction.name);

            expect(isConstructor).to.be.eql(true);
        });

        it("should return true for a class", () => {

            const isConstructor = ReflectionUtils.isConstructor(TargetClass, TargetClass.name);

            expect(isConstructor).to.be.eql(true);

        });

        it("should return true for a pascal case function with number in name", () => {

            const isConstructor = ReflectionUtils.isConstructor(TargetFunction, TargetFunction.name + "1");

            expect(isConstructor).to.be.eql(true);
        });

        it("should return true for a class with number in name", () => {

            const isConstructor = ReflectionUtils.isConstructor(TargetClass, TargetClass.name + "12");

            expect(isConstructor).to.be.eql(true);

        });

        it("should return false for a lower case function", () => {

            const isConstructor = ReflectionUtils.isConstructor(TargetFunction, "foo");

            expect(isConstructor).to.be.eql(false);
        });

        it("should return false for non-function thing", () => {

            const isConstructor = ReflectionUtils.isConstructor({}, "Foo");

            expect(isConstructor).to.be.eql(false);
        });

    });

    describe("createInstance", () => {

        it("should return instance of given function", () => {

            const instance = ReflectionUtils.createInstance(TargetFunction);

            expect(instance).to.be.instanceOf(TargetFunction);
        });

        it("should return instance of given class", () => {

            const instance = ReflectionUtils.createInstance(TargetClass);

            expect(instance).to.be.instanceOf(TargetClass);
        });

        it("should return instance of given function with arguments", () => {
            const argumentList = ["foo", "bar"];

            const instance = ReflectionUtils.createInstance(TargetFunction, argumentList);

            expect(instance.dependencyOne).to.be.eql(argumentList[0]);
            expect(instance.dependencyTwo).to.be.eql(argumentList[1]);
        });

        it("should return instance of given class with arguments", () => {
            const argumentList = ["foo", "bar"];

            const instance = ReflectionUtils.createInstance(TargetClass, argumentList);

            expect(instance.dependencyOne).to.be.eql(argumentList[0]);
            expect(instance.dependencyTwo).to.be.eql(argumentList[1]);
        });

    });

});
