"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class LoggingLevels {
    constructor() {
        this.info = "INFO";
        this.full = "FULL";
    }
}
exports.LoggingLevels = LoggingLevels;
$injector.register("loggingLevels", LoggingLevels);
