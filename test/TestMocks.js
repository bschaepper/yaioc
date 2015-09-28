"use strict";

function TargetFunction(dependencyOne, dependencyTwo) {
    this.args = arguments;
    this.dependencyOne = dependencyOne;
    this.dependencyTwo = dependencyTwo;
}

class TargetClass {
    constructor(dependencyOne, dependencyTwo) {
        this.args = arguments;
        this.dependencyOne = dependencyOne;
        this.dependencyTwo = dependencyTwo;
    }
}

module.exports = {
    TargetFunction: TargetFunction,
    TargetClass: TargetClass
};
