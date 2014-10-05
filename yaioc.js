"use strict";

var Container = require("./Container");
var defaultContainer;


function yaioc() {
    if (!defaultContainer) {
        defaultContainer = new Container();
    }

    return defaultContainer;
}

yaioc.Container = Container;

yaioc.container = function () {
    return new Container();
};

module.exports = yaioc;