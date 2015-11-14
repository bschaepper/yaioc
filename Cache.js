"use strict";

function Cache(container) {
    this.cache = function () {
        return this;
    };

    this.registerAdaptor = function (name, adaptor) {
        if (typeof adaptor === "function") {
            adaptor = { getComponentInstance: adaptor };
        }

        var cached;
        return container.registerAdaptor(name, {
            getComponentInstance: function (container) {
                cached = cached || adaptor.getComponentInstance(container);
                return cached;
            }
        });
    };
}

module.exports = Cache;
