"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const constants = require("./constants");
class Constants {
    constructor() {
        Object.assign(this, constants);
    }
}
exports.Constants = Constants;
$injector.register("constants", Constants);
