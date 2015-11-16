"use strict";

function Cache(container) {
	
	var cache = this;
    this.cache = function () {
        return cache;
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
