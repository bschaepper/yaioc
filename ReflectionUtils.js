"use strict";

const ARGUMENT_NAMES = /([^\s,]+)/g;
const IS_PASCAL_CASE = /^[A-Z][a-zA-Z0-9]*$/;
const STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg;


class ReflectionUtils {

    static isConstructor(functionToInspect, name) {
        return typeof functionToInspect === "function" && IS_PASCAL_CASE.test(name);
    }

    static getDependencyNames(targetFunction) {
        // based on http://stackoverflow.com/a/9924463/1551204
        const source = ReflectionUtils.getConstructorSource(targetFunction);
        const argumentNames = source.slice(source.indexOf("(") + 1, source.indexOf(")")).match(ARGUMENT_NAMES);
        return argumentNames || [];
    }

    static getConstructorSource(targetFunction) {
        let source = targetFunction.toString().replace(STRIP_COMMENTS, "");

        if (source.indexOf("class") === 0) {
            source = ReflectionUtils.getClassConstructorSource(source);
        }

        return source;
    }

    static getClassConstructorSource(source) {
        const constructorIndex = source.indexOf("constructor");
        return constructorIndex === -1 ? "" : source.slice(constructorIndex);
    }

    static createInstance(constructor, argumentsList) {
        const constructorArguments = [null].concat(Array.prototype.slice.call(argumentsList || []));
        return new (Function.prototype.bind.apply(constructor, constructorArguments))();
    }

}

module.exports = ReflectionUtils;
