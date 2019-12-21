"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const os = require("os");
class OsInfo {
    type() {
        return os.type();
    }
    release() {
        return os.release();
    }
    arch() {
        return os.arch();
    }
    platform() {
        return os.platform();
    }
}
exports.OsInfo = OsInfo;
$injector.register("osInfo", OsInfo);
