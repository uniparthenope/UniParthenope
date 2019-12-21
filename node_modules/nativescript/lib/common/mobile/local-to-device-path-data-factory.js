"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const helpers = require("../helpers");
const path = require("path");
class LocalToDevicePathData {
    constructor(filePath, localProjectRootPath, onDeviceFileName, deviceProjectRootPath) {
        this.filePath = filePath;
        this.localProjectRootPath = localProjectRootPath;
        this.onDeviceFileName = onDeviceFileName;
        this.deviceProjectRootPath = deviceProjectRootPath;
    }
    getLocalPath() {
        return this.filePath;
    }
    getDevicePath() {
        if (!this.devicePath) {
            const devicePath = path.join(this.deviceProjectRootPath, path.dirname(this.getRelativeToProjectBasePath()), this.onDeviceFileName);
            this.devicePath = helpers.fromWindowsRelativePathToUnix(devicePath);
        }
        return this.devicePath;
    }
    getRelativeToProjectBasePath() {
        if (!this.relativeToProjectBasePath) {
            this.relativeToProjectBasePath = path.relative(this.localProjectRootPath, this.filePath);
        }
        return this.relativeToProjectBasePath;
    }
}
class LocalToDevicePathDataFactory {
    create(filePath, localProjectRootPath, onDeviceFileName, deviceProjectRootPath) {
        return new LocalToDevicePathData(filePath, localProjectRootPath, onDeviceFileName, deviceProjectRootPath);
    }
}
exports.LocalToDevicePathDataFactory = LocalToDevicePathDataFactory;
$injector.register("localToDevicePathDataFactory", LocalToDevicePathDataFactory);
