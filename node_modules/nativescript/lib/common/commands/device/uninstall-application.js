"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
class UninstallApplicationCommand {
    constructor($devicesService, $stringParameter, $options) {
        this.$devicesService = $devicesService;
        this.$stringParameter = $stringParameter;
        this.$options = $options;
        this.allowedParameters = [this.$stringParameter];
    }
    execute(args) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.$devicesService.initialize({ deviceId: this.$options.device, skipInferPlatform: true });
            const action = (device) => device.applicationManager.uninstallApplication(args[0]);
            yield this.$devicesService.execute(action);
        });
    }
}
exports.UninstallApplicationCommand = UninstallApplicationCommand;
$injector.registerCommand(["device|uninstall", "devices|uninstall"], UninstallApplicationCommand);
