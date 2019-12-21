"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Utils {
    constructor($options, $logger) {
        this.$options = $options;
        this.$logger = $logger;
    }
    getParsedTimeout(defaultTimeout) {
        let timeout = defaultTimeout;
        if (this.$options.timeout) {
            const parsedValue = parseInt(this.$options.timeout);
            if (!isNaN(parsedValue) && parsedValue >= 0) {
                timeout = parsedValue;
            }
            else {
                this.$logger.warn("Specify timeout in a number of seconds to wait. Default value: " + timeout + " seconds will be used.");
            }
        }
        return timeout;
    }
    getMilliSecondsTimeout(defaultTimeout) {
        const timeout = this.getParsedTimeout(defaultTimeout);
        return timeout * 1000;
    }
}
exports.Utils = Utils;
$injector.register("utils", Utils);
