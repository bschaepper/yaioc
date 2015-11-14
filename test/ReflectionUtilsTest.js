"use strict";

var chai = require("chai");
var expect = chai.expect;

var TargetFunction = require("./TestMocks").TargetFunction;
var TargetClass = require("./TestMocks").TargetClass;

var ReflectionUtils = require("../ReflectionUtils");


describe("Reflection Utils Test", function () {

    describe("getDependencyNames", function () {

        it("should return empty list if no dependencies found", function () {

            var names = ReflectionUtils.getDependencyNames(function () {
            });

            expect(names).to.be.an("array");
            expect(names.length).to.be.eql(0);
        });

        it("should return names of dependencies found", function () {

            var names = ReflectionUtils.getDependencyNames(TargetFunction);

            expect(names).to.be.eql(["dependencyOne", "dependencyTwo"]);
        });

        it("should return names of dependencies found in class", function () {

            var names = ReflectionUtils.getDependencyNames(TargetClass);

            expect(names).to.be.eql(["dependencyOne", "dependencyTwo"]);
        });

    });

    describe("isConstructor", function () {

        it("should return true for a pascal case function", function () {

            var isConstructor = ReflectionUtils.isConstructor(TargetFunction, TargetFunction.name);

            expect(isConstructor).to.be.eql(true);
        });

        it("should return true for a class", function () {

            var isConstructor = ReflectionUtils.isConstructor(TargetClass, TargetClass.name);

            expect(isConstructor).to.be.eql(true);

        });

        it("should return false for a lower case function", function () {

            var isConstructor = ReflectionUtils.isConstructor(TargetFunction, "foo");

            expect(isConstructor).to.be.eql(false);
        });

        it("should return false for non-function thing", function () {

            var isConstructor = ReflectionUtils.isConstructor({}, "Foo");

            expect(isConstructor).to.be.eql(false);
        });

    });

    describe("createInstance", function () {

        it("should return instance of given function", function () {

            var instance = ReflectionUtils.createInstance(TargetFunction);

            expect(instance).to.be.instanceOf(TargetFunction);
        });

        it("should return instance of given class", function () {

            var instance = ReflectionUtils.createInstance(TargetClass);

            expect(instance).to.be.instanceOf(TargetClass);
        });

        it("should return instance of given function with arguments", function () {
            var argumentList = ["foo", "bar"];

            var instance = ReflectionUtils.createInstance(TargetFunction, argumentList);

            expect(instance.dependencyOne).to.be.eql(argumentList[0]);
            expect(instance.dependencyTwo).to.be.eql(argumentList[1]);
        });

        it("should return instance of given class with arguments", function () {
            var argumentList = ["foo", "bar"];

            var instance = ReflectionUtils.createInstance(TargetClass, argumentList);

            expect(instance.dependencyOne).to.be.eql(argumentList[0]);
            expect(instance.dependencyTwo).to.be.eql(argumentList[1]);
        });

    });

});
