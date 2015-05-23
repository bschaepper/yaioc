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

yaioc.container = function (childContainer) {
    return new Container(childContainer);
};

module.exports = yaioc;
