"use strict";


function ValueAdapter(value) {
    this.value = value;
}

ValueAdapter.prototype = {

    getComponentInstance: function () {
        return this.value;
    }

};

module.exports = ValueAdapter;
