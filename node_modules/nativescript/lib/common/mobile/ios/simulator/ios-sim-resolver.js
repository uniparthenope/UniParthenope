"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
class IOSSimResolver {
    constructor() {
        this._iOSSim = null;
    }
    get iOSSim() {
        if (!this._iOSSim) {
            this._iOSSim = require(IOSSimResolver.iOSSimName);
        }
        return this._iOSSim;
    }
    get iOSSimPath() {
        return path.join(require.resolve(IOSSimResolver.iOSSimName), "..", IOSSimResolver.iOSStandaloneExecutableName);
    }
}
IOSSimResolver.iOSSimName = "ios-sim-portable";
IOSSimResolver.iOSStandaloneExecutableName = "ios-sim-standalone.js";
exports.IOSSimResolver = IOSSimResolver;
$injector.register("iOSSimResolver", IOSSimResolver);
