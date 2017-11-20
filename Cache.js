"use strict";

function Cache(container) {
    this.cache = () => this;

    this.registerAdaptor = (name, adaptor) => {
        if (typeof adaptor === "function") {
            adaptor = { getComponentInstance: adaptor };
        }

        let cached;
        return container.registerAdaptor(name, {
            getComponentInstance: (container) => {
                cached = cached || adaptor.getComponentInstance(container);
                return cached;
            }
        });
    };
}

module.exports = Cache;
