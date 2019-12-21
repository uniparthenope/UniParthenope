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
const os_1 = require("os");
const constants_1 = require("../constants");
const proxyLib = require("proxy-lib");
class ProxyService {
    constructor($settingsService, $staticConfig) {
        this.$settingsService = $settingsService;
        this.$staticConfig = $staticConfig;
        this.proxyCacheFilePath = path.join(this.$settingsService.getProfileDir(), constants_1.Proxy.CACHE_FILE_NAME);
        this.credentialsKey = `${this.$staticConfig.CLIENT_NAME}_PROXY`;
    }
    setCache(settings) {
        settings.userSpecifiedSettingsFilePath = settings.userSpecifiedSettingsFilePath || this.proxyCacheFilePath;
        settings.credentialsKey = settings.credentialsKey || this.credentialsKey;
        return proxyLib.setProxySettings(settings);
    }
    getCache() {
        const settings = {
            credentialsKey: this.credentialsKey,
            userSpecifiedSettingsFilePath: this.proxyCacheFilePath
        };
        return proxyLib.getProxySettings(settings);
    }
    clearCache() {
        const settings = {
            credentialsKey: this.credentialsKey,
            userSpecifiedSettingsFilePath: this.proxyCacheFilePath
        };
        return proxyLib.clearProxySettings(settings);
    }
    getInfo() {
        return __awaiter(this, void 0, void 0, function* () {
            let message = "";
            const proxyCache = yield this.getCache();
            if (proxyCache) {
                message = `Proxy Url: ${proxyCache.protocol}//${proxyCache.hostname}:${proxyCache.port}`;
                if (proxyCache.username) {
                    message += `${os_1.EOL}Username: ${proxyCache.username}`;
                }
                message += `${os_1.EOL}Proxy is Enabled`;
            }
            else {
                message = "No proxy set";
            }
            return message;
        });
    }
}
exports.ProxyService = ProxyService;
$injector.register("proxyService", ProxyService);
