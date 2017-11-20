"use strict";

const Container = require("./Container");


let defaultContainer;
function yaioc() {
    if (!defaultContainer) {
        defaultContainer = new Container();
    }

    return defaultContainer;
}

yaioc.Container = Container;
yaioc.container = (childContainer) => new Container(childContainer);

module.exports = yaioc;
