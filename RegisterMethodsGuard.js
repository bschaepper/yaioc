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

        return RegisterMethodsGuard.rearrangeEsModule(args) || args;
    }

    static checkName(name) {
        if (!name || typeof name !== "string" && !name.name && !this.isEsModuleWithNamedDefaultExport(name)) {
            throw new Error("no name provided for dependency");
        }
    }

    static isEsModuleWithNamedDefaultExport(candidate) {
        return candidate && candidate.__esModule && candidate.default && candidate.default.name;
    }

    static rearrangeEsModule(args) {
        if (RegisterMethodsGuard.isEsModuleWithNamedDefaultExport(args[0])) {
            return [args[0].default.name, args[0].default];
        }

        if (RegisterMethodsGuard.isEsModuleWithNamedDefaultExport(args[1])) {
            return [args[0], args[1].default];
        }
    }

}

module.exports = RegisterMethodsGuard;
