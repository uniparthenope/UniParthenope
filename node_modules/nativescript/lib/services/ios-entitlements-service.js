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
const plist_merge_patch_1 = require("plist-merge-patch");
class IOSEntitlementsService {
    constructor($fs, $logger, $devicePlatformsConstants, $mobileHelper, $pluginsService) {
        this.$fs = $fs;
        this.$logger = $logger;
        this.$devicePlatformsConstants = $devicePlatformsConstants;
        this.$mobileHelper = $mobileHelper;
        this.$pluginsService = $pluginsService;
    }
    getDefaultAppEntitlementsPath(projectData) {
        const entitlementsName = IOSEntitlementsService.DefaultEntitlementsName;
        const entitlementsPath = path.join(projectData.appResourcesDirectoryPath, this.$mobileHelper.normalizePlatformName(this.$devicePlatformsConstants.iOS), entitlementsName);
        return entitlementsPath;
    }
    getPlatformsEntitlementsPath(projectData) {
        return path.join(projectData.platformsDir, this.$devicePlatformsConstants.iOS.toLowerCase(), projectData.projectName, projectData.projectName + ".entitlements");
    }
    getPlatformsEntitlementsRelativePath(projectData) {
        return path.join(projectData.projectName, projectData.projectName + ".entitlements");
    }
    merge(projectData) {
        return __awaiter(this, void 0, void 0, function* () {
            const session = new plist_merge_patch_1.PlistSession({ log: (txt) => this.$logger.trace("App.entitlements: " + txt) });
            const projectDir = projectData.projectDir;
            const makePatch = (plistPath) => {
                if (!this.$fs.exists(plistPath)) {
                    this.$logger.trace("No plist found at: " + plistPath);
                    return;
                }
                this.$logger.trace("Schedule merge plist at: " + plistPath);
                session.patch({
                    name: path.relative(projectDir, plistPath),
                    read: () => this.$fs.readText(plistPath)
                });
            };
            const allPlugins = yield this.getAllInstalledPlugins(projectData);
            for (const plugin of allPlugins) {
                const pluginInfoPlistPath = path.join(plugin.pluginPlatformsFolderPath(this.$devicePlatformsConstants.iOS), IOSEntitlementsService.DefaultEntitlementsName);
                makePatch(pluginInfoPlistPath);
            }
            const appEntitlementsPath = this.getDefaultAppEntitlementsPath(projectData);
            if (this.$fs.exists(appEntitlementsPath)) {
                makePatch(appEntitlementsPath);
            }
            if (session.patches && session.patches.length > 0) {
                const plistContent = session.build();
                this.$logger.trace("App.entitlements: Write to: " + this.getPlatformsEntitlementsPath(projectData));
                this.$fs.writeFile(this.getPlatformsEntitlementsPath(projectData), plistContent);
            }
        });
    }
    getAllInstalledPlugins(projectData) {
        return this.$pluginsService.getAllInstalledPlugins(projectData);
    }
}
IOSEntitlementsService.DefaultEntitlementsName = "app.entitlements";
exports.IOSEntitlementsService = IOSEntitlementsService;
$injector.register("iOSEntitlementsService", IOSEntitlementsService);
