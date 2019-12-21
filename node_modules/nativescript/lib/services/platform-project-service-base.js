"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const events_1 = require("events");
class PlatformProjectServiceBase extends events_1.EventEmitter {
    constructor($fs, $projectDataService) {
        super();
        this.$fs = $fs;
        this.$projectDataService = $projectDataService;
    }
    getPluginPlatformsFolderPath(pluginData, platform) {
        return pluginData.pluginPlatformsFolderPath(platform);
    }
    getFrameworkVersion(projectData) {
        const frameworkData = this.$projectDataService.getNSValue(projectData.projectDir, this.getPlatformData(projectData).frameworkPackageName);
        return frameworkData && frameworkData.version;
    }
    getAllNativeLibrariesForPlugin(pluginData, platform, filter) {
        const pluginPlatformsFolderPath = this.getPluginPlatformsFolderPath(pluginData, platform);
        let nativeLibraries = [];
        if (pluginPlatformsFolderPath && this.$fs.exists(pluginPlatformsFolderPath)) {
            const platformsContents = this.$fs.readDirectory(pluginPlatformsFolderPath);
            nativeLibraries = _(platformsContents)
                .filter(platformItemName => filter(platformItemName, pluginPlatformsFolderPath))
                .value();
        }
        return nativeLibraries;
    }
}
exports.PlatformProjectServiceBase = PlatformProjectServiceBase;
