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
class PlaygroundService {
    constructor($fs, $projectDataService, $userSettingsService) {
        this.$fs = $fs;
        this.$projectDataService = $projectDataService;
        this.$userSettingsService = $userSettingsService;
    }
    getPlaygroundInfo(projectDir) {
        return __awaiter(this, void 0, void 0, function* () {
            const projectData = this.getProjectData(projectDir);
            if (projectData) {
                const projectFileContent = this.$fs.readJson(projectData.projectFilePath);
                if (this.hasPlaygroundKey(projectFileContent)) {
                    const id = projectFileContent.nativescript.playground.id;
                    let usedTutorial = projectFileContent.nativescript.playground.usedTutorial || false;
                    const playgroundInfo = yield this.getPlaygroundInfoFromUserSettingsFile();
                    if (playgroundInfo && playgroundInfo.usedTutorial) {
                        usedTutorial = true;
                    }
                    delete projectFileContent.nativescript.playground;
                    this.$fs.writeJson(projectData.projectFilePath, projectFileContent);
                    const result = { id, usedTutorial };
                    yield this.$userSettingsService.saveSettings({ playground: result });
                    return result;
                }
            }
            return this.getPlaygroundInfoFromUserSettingsFile();
        });
    }
    getProjectData(projectDir) {
        try {
            return this.$projectDataService.getProjectData(projectDir);
        }
        catch (e) {
            return null;
        }
    }
    hasPlaygroundKey(projectFileContent) {
        return projectFileContent && projectFileContent.nativescript && projectFileContent.nativescript.playground && projectFileContent.nativescript.playground.id;
    }
    getPlaygroundInfoFromUserSettingsFile() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.$userSettingsService.getSettingValue("playground");
        });
    }
}
exports.PlaygroundService = PlaygroundService;
$injector.register('playgroundService', PlaygroundService);
