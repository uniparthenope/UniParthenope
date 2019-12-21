"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
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
const decorators_1 = require("../common/decorators");
class AnalyticsSettingsService {
    constructor($userSettingsService, $staticConfig, $hostInfo, $osInfo, $logger, $playgroundService) {
        this.$userSettingsService = $userSettingsService;
        this.$staticConfig = $staticConfig;
        this.$hostInfo = $hostInfo;
        this.$osInfo = $osInfo;
        this.$logger = $logger;
        this.$playgroundService = $playgroundService;
    }
    canDoRequest() {
        return __awaiter(this, void 0, void 0, function* () {
            return true;
        });
    }
    getUserId() {
        return this.getSettingValueOrDefault("USER_ID");
    }
    getClientId() {
        return this.getSettingValueOrDefault(this.$staticConfig.ANALYTICS_INSTALLATION_ID_SETTING_NAME);
    }
    getPlaygroundInfo(projectDir) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.$playgroundService.getPlaygroundInfo(projectDir);
        });
    }
    getClientName() {
        return "" + this.$staticConfig.CLIENT_NAME_ALIAS.cyan.bold;
    }
    getPrivacyPolicyLink() {
        return "http://www.telerik.com/company/privacy-policy";
    }
    getUserSessionsCount(projectName) {
        return __awaiter(this, void 0, void 0, function* () {
            const sessionsCountForProject = yield this.$userSettingsService.getSettingValue(this.getSessionsProjectKey(projectName));
            return sessionsCountForProject || 0;
        });
    }
    setUserSessionsCount(count, projectName) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.$userSettingsService.saveSetting(this.getSessionsProjectKey(projectName), count);
        });
    }
    getUserAgentString(identifier) {
        let osString = "";
        const osRelease = this.$osInfo.release();
        if (this.$hostInfo.isWindows) {
            osString = `Windows NT ${osRelease}`;
        }
        else if (this.$hostInfo.isDarwin) {
            osString = `Macintosh`;
            const macRelease = this.getMacOSReleaseVersion(osRelease);
            if (macRelease) {
                osString += `; Intel Mac OS X ${macRelease}`;
            }
        }
        else {
            osString = `Linux x86`;
            if (this.$osInfo.arch() === "x64") {
                osString += "_64";
            }
        }
        const userAgent = `${identifier} (${osString}; ${this.$osInfo.arch()})`;
        return userAgent;
    }
    getMacOSReleaseVersion(osRelease) {
        const majorVersion = osRelease && _.first(osRelease.split("."));
        return majorVersion && `10.${+majorVersion - 4}`;
    }
    getSessionsProjectKey(projectName) {
        return `${AnalyticsSettingsService.SESSIONS_STARTED_KEY_PREFIX}${projectName}`;
    }
    getSettingValueOrDefault(settingName) {
        return __awaiter(this, void 0, void 0, function* () {
            let guid = yield this.$userSettingsService.getSettingValue(settingName);
            if (!guid) {
                guid = helpers_1.createGUID(false);
                this.$logger.trace(`Setting new ${settingName}: ${guid}.`);
                yield this.$userSettingsService.saveSetting(settingName, guid);
            }
            return guid;
        });
    }
}
AnalyticsSettingsService.SESSIONS_STARTED_KEY_PREFIX = "SESSIONS_STARTED_";
__decorate([
    decorators_1.exported("analyticsSettingsService")
], AnalyticsSettingsService.prototype, "getClientId", null);
__decorate([
    decorators_1.exported("analyticsSettingsService")
], AnalyticsSettingsService.prototype, "getPlaygroundInfo", null);
__decorate([
    decorators_1.exported("analyticsSettingsService")
], AnalyticsSettingsService.prototype, "getUserAgentString", null);
$injector.register("analyticsSettingsService", AnalyticsSettingsService);
