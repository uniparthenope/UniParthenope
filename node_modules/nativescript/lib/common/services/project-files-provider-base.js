"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const util = require("util");
const constants_1 = require("../constants");
class ProjectFilesProviderBase {
    constructor($mobileHelper, $options) {
        this.$mobileHelper = $mobileHelper;
        this.$options = $options;
    }
    getPreparedFilePath(filePath, projectFilesConfig) {
        const projectFileInfo = this.getProjectFileInfo(filePath, "", projectFilesConfig);
        return path.join(path.dirname(filePath), projectFileInfo.onDeviceFileName);
    }
    getProjectFileInfo(filePath, platform, projectFilesConfig) {
        if (!filePath) {
            return {
                filePath: filePath,
                onDeviceFileName: filePath,
                shouldIncludeFile: false
            };
        }
        let parsed = this.parseFile(filePath, this.$mobileHelper.platformNames, platform || "");
        const basicConfigurations = [constants_1.Configurations.Debug.toLowerCase(), constants_1.Configurations.Release.toLowerCase()];
        if (!parsed) {
            const validValues = basicConfigurations.concat(projectFilesConfig && projectFilesConfig.additionalConfigurations || []), value = projectFilesConfig && projectFilesConfig.configuration || basicConfigurations[0];
            parsed = this.parseFile(filePath, validValues, value);
        }
        return parsed || {
            filePath: filePath,
            onDeviceFileName: path.basename(filePath),
            shouldIncludeFile: true
        };
    }
    parseFile(filePath, validValues, value) {
        const regex = util.format("^(.+?)[.](%s)([.].+?)$", validValues.join("|"));
        const parsed = filePath.match(new RegExp(regex, "i"));
        if (parsed) {
            return {
                filePath: filePath,
                onDeviceFileName: path.basename(parsed[1] + parsed[3]),
                shouldIncludeFile: parsed[2].toLowerCase() === value.toLowerCase()
            };
        }
        return null;
    }
}
exports.ProjectFilesProviderBase = ProjectFilesProviderBase;
