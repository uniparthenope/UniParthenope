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
class GenerateCommandBase {
    constructor($options, $injector, $projectData, $stringParameterBuilder, $assetsGenerationService) {
        this.$options = $options;
        this.$injector = $injector;
        this.$projectData = $projectData;
        this.$stringParameterBuilder = $stringParameterBuilder;
        this.$assetsGenerationService = $assetsGenerationService;
        this.allowedParameters = [this.$stringParameterBuilder.createMandatoryParameter("You have to provide path to image to generate other images based on it.")];
        this.$projectData.initializeProjectData();
    }
    execute(args) {
        return __awaiter(this, void 0, void 0, function* () {
            const [imagePath] = args;
            yield this.generate(imagePath, this.$options.background);
        });
    }
}
exports.GenerateCommandBase = GenerateCommandBase;
class GenerateIconsCommand extends GenerateCommandBase {
    constructor($options, $injector, $projectData, $stringParameterBuilder, $assetsGenerationService) {
        super($options, $injector, $projectData, $stringParameterBuilder, $assetsGenerationService);
        this.$options = $options;
        this.$projectData = $projectData;
        this.$stringParameterBuilder = $stringParameterBuilder;
    }
    generate(imagePath, background) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.$assetsGenerationService.generateIcons({ imagePath, projectDir: this.$projectData.projectDir });
        });
    }
}
exports.GenerateIconsCommand = GenerateIconsCommand;
$injector.registerCommand("resources|generate|icons", GenerateIconsCommand);
class GenerateSplashScreensCommand extends GenerateCommandBase {
    constructor($options, $injector, $projectData, $stringParameterBuilder, $assetsGenerationService) {
        super($options, $injector, $projectData, $stringParameterBuilder, $assetsGenerationService);
        this.$options = $options;
        this.$projectData = $projectData;
        this.$stringParameterBuilder = $stringParameterBuilder;
    }
    generate(imagePath, background) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.$assetsGenerationService.generateSplashScreens({ imagePath, background, projectDir: this.$projectData.projectDir });
        });
    }
}
exports.GenerateSplashScreensCommand = GenerateSplashScreensCommand;
$injector.registerCommand("resources|generate|splashes", GenerateSplashScreensCommand);
