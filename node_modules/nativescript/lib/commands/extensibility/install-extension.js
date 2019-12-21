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
class InstallExtensionCommand {
    constructor($extensibilityService, $stringParameterBuilder, $logger) {
        this.$extensibilityService = $extensibilityService;
        this.$stringParameterBuilder = $stringParameterBuilder;
        this.$logger = $logger;
        this.allowedParameters = [this.$stringParameterBuilder.createMandatoryParameter("You have to provide a valid name for extension that you want to install.")];
    }
    execute(args) {
        return __awaiter(this, void 0, void 0, function* () {
            const extensionData = yield this.$extensibilityService.installExtension(args[0]);
            this.$logger.info(`Successfully installed extension ${extensionData.extensionName}.`);
            yield this.$extensibilityService.loadExtension(extensionData.extensionName);
            this.$logger.info(`Successfully loaded extension ${extensionData.extensionName}.`);
        });
    }
}
exports.InstallExtensionCommand = InstallExtensionCommand;
$injector.registerCommand("extension|install", InstallExtensionCommand);
