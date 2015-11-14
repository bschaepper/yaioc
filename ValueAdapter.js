"use strict";


class ValueAdapter {

    constructor(value) {
        this.value = value;
    }

    getComponentInstance() {
        return this.value;
    }

}

module.exports = ValueAdapter;
