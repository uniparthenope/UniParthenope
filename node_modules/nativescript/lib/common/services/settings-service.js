"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const decorators_1 = require("../decorators");
const path = require("path");
const osenv = require("osenv");
class SettingsService {
    constructor($staticConfig, $hostInfo) {
        this.$staticConfig = $staticConfig;
        this.$hostInfo = $hostInfo;
        this._profileDir = this.getDefaultProfileDir();
    }
    setSettings(settings) {
        if (settings && settings.userAgentName) {
            this.$staticConfig.USER_AGENT_NAME = settings.userAgentName;
        }
        if (settings && settings.profileDir) {
            this._profileDir = path.resolve(settings.profileDir);
        }
    }
    getProfileDir() {
        return this._profileDir;
    }
    getDefaultProfileDir() {
        const defaultProfileDirLocation = this.$hostInfo.isWindows ? process.env.AppData : path.join(osenv.home(), ".local", "share");
        return path.join(defaultProfileDirLocation, this.$staticConfig.PROFILE_DIR_NAME);
    }
}
__decorate([
    decorators_1.exported("settingsService")
], SettingsService.prototype, "setSettings", null);
exports.SettingsService = SettingsService;
$injector.register("settingsService", SettingsService);
