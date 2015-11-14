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
yaioc.container = (childContainer) => new Container(childContainer);

module.exports = yaioc;
