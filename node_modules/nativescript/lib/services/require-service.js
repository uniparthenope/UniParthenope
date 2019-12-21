"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class RequireService {
    require(module) {
        return require(module);
    }
}
exports.RequireService = RequireService;
$injector.register("requireService", RequireService);
