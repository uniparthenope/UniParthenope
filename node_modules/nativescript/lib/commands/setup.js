"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class SetupCommand {
    constructor($doctorService) {
        this.$doctorService = $doctorService;
        this.allowedParameters = [];
    }
    execute(args) {
        return this.$doctorService.runSetupScript();
    }
}
exports.SetupCommand = SetupCommand;
$injector.registerCommand("setup|*", SetupCommand);
class CloudSetupCommand {
    constructor($nativeScriptCloudExtensionService) {
        this.$nativeScriptCloudExtensionService = $nativeScriptCloudExtensionService;
        this.allowedParameters = [];
    }
    execute(args) {
        return this.$nativeScriptCloudExtensionService.install();
    }
}
exports.CloudSetupCommand = CloudSetupCommand;
$injector.registerCommand(["setup|cloud", "cloud|setup"], CloudSetupCommand);
