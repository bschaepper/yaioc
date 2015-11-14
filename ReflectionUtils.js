"use strict";

var ARGUMENT_NAMES = /([^\s,]+)/g;
var IS_PASCAL_CASE = /^[A-Z][a-zA-Z]*$/;
var STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg;


module.exports = {

    isConstructor: function (functionToInspect, name) {
        return typeof functionToInspect === "function" && IS_PASCAL_CASE.test(name);
    },

    getDependencyNames: function (targetFunction) {
        // based on http://stackoverflow.com/a/9924463/1551204
        var source = this.getConstructorSource(targetFunction);
        var argumentNames = source.slice(source.indexOf("(") + 1, source.indexOf(")")).match(ARGUMENT_NAMES);
        return argumentNames || [];
    },

    getConstructorSource: function (targetFunction) {
        var source = targetFunction.toString().replace(STRIP_COMMENTS, "");

        if (source.indexOf("class") === 0) {
            source = this.getClassConstructorSource(source);
        }

        return source;
    },

    getClassConstructorSource: function (source) {
        var constructorIndex = source.indexOf("constructor");
        return constructorIndex === -1 ? "" : source.slice(constructorIndex);
    },

    createInstance: function (constructor, argumentsList) {
        var constructorArguments = [null].concat(Array.prototype.slice.call(argumentsList || []));
        return new (Function.prototype.bind.apply(constructor, constructorArguments))();
    }

};
