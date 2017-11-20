"use strict";


class RegisterMethodsGuard {

    static guard(container) {
        RegisterMethodsGuard.getRegisterMethods(container).forEach((methodName) => {
            container[methodName] = RegisterMethodsGuard.addPreconditionsCheck(container[methodName]);
        });
    }

    static getRegisterMethods(container) {
        return Object.getOwnPropertyNames(Object.getPrototypeOf(container))
            .filter((methodName) => methodName.startsWith("register"));
    }

    static addPreconditionsCheck(method) {
        return function (...args) {
            return method.apply(this, RegisterMethodsGuard.arrangeAndCheckArguments(args));
        };
    }

    static arrangeAndCheckArguments(args) {
        RegisterMethodsGuard.checkName(args[0]);

        if (typeof args[0] === "function") {
            args.unshift(args[0].name);
        }

        return args;
    }

    static checkName(name) {
        if (!name || typeof name !== "string" && !name.name) {
            throw new Error("no name provided for dependency");
        }
    }

}

module.exports = RegisterMethodsGuard;
