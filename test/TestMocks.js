"use strict";

function TargetFunction(dependencyOne, dependencyTwo) {
    this.args = arguments;
    this.dependencyOne = dependencyOne;
    this.dependencyTwo = dependencyTwo;
}

class TargetClass {

    foo(){}

    constructor(dependencyOne, dependencyTwo) {
        this.args = arguments;
        this.dependencyOne = dependencyOne;
        this.dependencyTwo = dependencyTwo;
    }
}

function makeEsModule(defaultExport) {
    return {
        __esModule: true,
        default: defaultExport
    };
}

module.exports = {
    TargetFunction,
    TargetClass,

    makeEsModule
};
