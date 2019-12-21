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
class HelpCommand {
    constructor($injector, $helpService, $options) {
        this.$injector = $injector;
        this.$helpService = $helpService;
        this.$options = $options;
        this.enableHooks = false;
        this.allowedParameters = [];
    }
    canExecute(args) {
        return __awaiter(this, void 0, void 0, function* () {
            return true;
        });
    }
    execute(args) {
        return __awaiter(this, void 0, void 0, function* () {
            let commandName = (args[0] || "").toLowerCase();
            let commandArguments = _.tail(args);
            const hierarchicalCommand = this.$injector.buildHierarchicalCommand(args[0], commandArguments);
            if (hierarchicalCommand) {
                commandName = hierarchicalCommand.commandName;
                commandArguments = hierarchicalCommand.remainingArguments;
            }
            const commandData = {
                commandName,
                commandArguments
            };
            if (this.$options.help) {
                yield this.$helpService.showCommandLineHelp(commandData);
            }
            else {
                yield this.$helpService.openHelpForCommandInBrowser(commandData);
            }
        });
    }
}
exports.HelpCommand = HelpCommand;
$injector.registerCommand(["help", "/?"], HelpCommand);
