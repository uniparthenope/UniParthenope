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
const helpers_1 = require("../common/helpers");
class ProjectNameService {
    constructor($projectNameValidator, $errors, $logger, $prompter) {
        this.$projectNameValidator = $projectNameValidator;
        this.$errors = $errors;
        this.$logger = $logger;
        this.$prompter = $prompter;
    }
    ensureValidName(projectName, validateOptions) {
        return __awaiter(this, void 0, void 0, function* () {
            if (validateOptions && validateOptions.force) {
                return projectName;
            }
            if (!this.$projectNameValidator.validate(projectName)) {
                return yield this.promptForNewName("The project name is invalid.", projectName, validateOptions);
            }
            const userCanInteract = helpers_1.isInteractive();
            if (!this.checkIfNameStartsWithLetter(projectName)) {
                if (!userCanInteract) {
                    this.$errors.fail("The project name does not start with letter and will fail to build for Android. If You want to create project with this name add --force to the create command.");
                }
                return yield this.promptForNewName("The project name does not start with letter and will fail to build for Android.", projectName, validateOptions);
            }
            if (projectName.toUpperCase() === "APP") {
                if (!userCanInteract) {
                    this.$errors.fail("You cannot build applications named 'app' in Xcode. Consider creating a project with different name. If You want to create project with this name add --force to the create command.");
                }
                return yield this.promptForNewName("You cannot build applications named 'app' in Xcode. Consider creating a project with different name.", projectName, validateOptions);
            }
            return projectName;
        });
    }
    checkIfNameStartsWithLetter(projectName) {
        const startsWithLetterExpression = /^[a-zA-Z]/;
        return startsWithLetterExpression.test(projectName);
    }
    promptForNewName(warningMessage, projectName, validateOptions) {
        return __awaiter(this, void 0, void 0, function* () {
            if (yield this.promptForForceNameConfirm(warningMessage)) {
                return projectName;
            }
            const newProjectName = yield this.$prompter.getString("Enter the new project name:");
            return yield this.ensureValidName(newProjectName, validateOptions);
        });
    }
    promptForForceNameConfirm(warningMessage) {
        return __awaiter(this, void 0, void 0, function* () {
            this.$logger.warn(warningMessage);
            return yield this.$prompter.confirm("Do you want to create the project with this name?");
        });
    }
}
exports.ProjectNameService = ProjectNameService;
$injector.register("projectNameService", ProjectNameService);
