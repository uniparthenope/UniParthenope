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
const path = require("path");
class GenerateMessages {
    constructor($fs, $messageContractGenerator, $options) {
        this.$fs = $fs;
        this.$messageContractGenerator = $messageContractGenerator;
        this.$options = $options;
        this.allowedParameters = [];
    }
    execute(args) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield this.$messageContractGenerator.generate();
            const innerMessagesDirectory = path.join(__dirname, "../messages");
            const outerMessagesDirectory = path.join(__dirname, "../..");
            let interfaceFilePath;
            let implementationFilePath;
            if (this.$options.default) {
                interfaceFilePath = path.join(innerMessagesDirectory, GenerateMessages.MESSAGES_DEFINITIONS_FILE_NAME);
                implementationFilePath = path.join(innerMessagesDirectory, GenerateMessages.MESSAGES_IMPLEMENTATION_FILE_NAME);
            }
            else {
                interfaceFilePath = path.join(outerMessagesDirectory, GenerateMessages.MESSAGES_DEFINITIONS_FILE_NAME);
                implementationFilePath = path.join(outerMessagesDirectory, GenerateMessages.MESSAGES_IMPLEMENTATION_FILE_NAME);
            }
            this.$fs.writeFile(interfaceFilePath, result.interfaceFile);
            this.$fs.writeFile(implementationFilePath, result.implementationFile);
        });
    }
}
GenerateMessages.MESSAGES_DEFINITIONS_FILE_NAME = "messages.interface.d.ts";
GenerateMessages.MESSAGES_IMPLEMENTATION_FILE_NAME = "messages.ts";
exports.GenerateMessages = GenerateMessages;
$injector.registerCommand("dev-generate-messages", GenerateMessages);
