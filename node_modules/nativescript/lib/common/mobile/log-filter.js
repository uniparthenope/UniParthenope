"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class LogFilter {
    constructor($devicePlatformsConstants, $injector, $loggingLevels) {
        this.$devicePlatformsConstants = $devicePlatformsConstants;
        this.$injector = $injector;
        this.$loggingLevels = $loggingLevels;
        this._loggingLevel = this.$loggingLevels.info;
    }
    get loggingLevel() {
        return this._loggingLevel;
    }
    set loggingLevel(logLevel) {
        if (this.verifyLogLevel(logLevel)) {
            this._loggingLevel = logLevel;
        }
    }
    filterData(platform, data, loggingOptions = {}) {
        loggingOptions = loggingOptions || {};
        const deviceLogFilter = this.getDeviceLogFilterInstance(platform);
        loggingOptions.logLevel = loggingOptions.logLevel || this.loggingLevel;
        if (deviceLogFilter) {
            return deviceLogFilter.filterData(data, loggingOptions);
        }
        return data;
    }
    getDeviceLogFilterInstance(platform) {
        if (platform) {
            if (platform.toLowerCase() === this.$devicePlatformsConstants.iOS.toLowerCase()) {
                return this.$injector.resolve("iOSLogFilter");
            }
            else if (platform.toLowerCase() === this.$devicePlatformsConstants.Android.toLowerCase()) {
                return this.$injector.resolve("androidLogFilter");
            }
        }
        return null;
    }
    verifyLogLevel(logLevel) {
        const upperCaseLogLevel = (logLevel || '').toUpperCase();
        return upperCaseLogLevel === this.$loggingLevels.info.toUpperCase() || upperCaseLogLevel === this.$loggingLevels.full.toUpperCase();
    }
}
exports.LogFilter = LogFilter;
$injector.register("logFilter", LogFilter);
