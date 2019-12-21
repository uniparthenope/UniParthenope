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
const minimatch = require("minimatch");
const path = require("path");
const util = require("util");
class ProjectFilesManager {
    constructor($fs, $localToDevicePathDataFactory, $logger, $projectFilesProvider) {
        this.$fs = $fs;
        this.$localToDevicePathDataFactory = $localToDevicePathDataFactory;
        this.$logger = $logger;
        this.$projectFilesProvider = $projectFilesProvider;
    }
    getProjectFiles(projectFilesPath, excludedProjectDirsAndFiles, filter, opts) {
        const projectFiles = this.$fs.enumerateFilesInDirectorySync(projectFilesPath, (filePath, stat) => {
            const isFileExcluded = this.isFileExcluded(path.relative(projectFilesPath, filePath), excludedProjectDirsAndFiles);
            const isFileFiltered = filter ? filter(filePath, stat) : false;
            return !isFileExcluded && !isFileFiltered;
        }, opts);
        this.$logger.trace("enumerateProjectFiles: %s", util.inspect(projectFiles));
        return projectFiles;
    }
    isFileExcluded(filePath, excludedProjectDirsAndFiles) {
        const isInExcludedList = !!_.find(excludedProjectDirsAndFiles, (pattern) => minimatch(filePath, pattern, { nocase: true }));
        return isInExcludedList || this.$projectFilesProvider.isFileExcluded(filePath);
    }
    createLocalToDevicePaths(deviceAppData, projectFilesPath, files, excludedProjectDirsAndFiles, projectFilesConfig) {
        return __awaiter(this, void 0, void 0, function* () {
            const deviceProjectRootPath = yield deviceAppData.getDeviceProjectRootPath();
            files = files || this.getProjectFiles(projectFilesPath, excludedProjectDirsAndFiles, null, { enumerateDirectories: true });
            const localToDevicePaths = Promise.all(files
                .map(projectFile => this.$projectFilesProvider.getProjectFileInfo(projectFile, deviceAppData.platform, projectFilesConfig))
                .filter(projectFileInfo => projectFileInfo.shouldIncludeFile)
                .map((projectFileInfo) => __awaiter(this, void 0, void 0, function* () { return this.$localToDevicePathDataFactory.create(projectFileInfo.filePath, projectFilesPath, projectFileInfo.onDeviceFileName, deviceProjectRootPath); })));
            return localToDevicePaths;
        });
    }
    processPlatformSpecificFiles(directoryPath, platform, projectFilesConfig, excludedDirs) {
        const contents = this.$fs.readDirectory(directoryPath);
        const files = [];
        _.each(contents, fileName => {
            const filePath = path.join(directoryPath, fileName);
            const fsStat = this.$fs.getFsStats(filePath);
            if (fsStat.isDirectory() && !_.includes(excludedDirs, fileName)) {
                this.processPlatformSpecificFilesCore(platform, this.$fs.enumerateFilesInDirectorySync(filePath), projectFilesConfig);
            }
            else if (fsStat.isFile()) {
                files.push(filePath);
            }
        });
        this.processPlatformSpecificFilesCore(platform, files, projectFilesConfig);
    }
    processPlatformSpecificFilesCore(platform, files, projectFilesConfig) {
        _.each(files, filePath => {
            const projectFileInfo = this.$projectFilesProvider.getProjectFileInfo(filePath, platform, projectFilesConfig);
            if (!projectFileInfo.shouldIncludeFile) {
                this.$fs.deleteFile(filePath);
            }
            else if (projectFileInfo.onDeviceFileName) {
                const onDeviceFilePath = path.join(path.dirname(filePath), projectFileInfo.onDeviceFileName);
                const extension = path.extname(projectFileInfo.onDeviceFileName);
                if (onDeviceFilePath !== filePath) {
                    if (extension === ".js" || extension === ".map") {
                        const oldName = extension === ".map" ? this.getFileName(filePath, extension) : path.basename(filePath);
                        const newName = extension === ".map" ? this.getFileName(projectFileInfo.onDeviceFileName, extension) : path.basename(projectFileInfo.onDeviceFileName);
                        let fileContent = this.$fs.readText(filePath);
                        fileContent = fileContent.replace(new RegExp(oldName, 'g'), newName);
                        this.$fs.writeFile(filePath, fileContent);
                    }
                    this.$fs.writeFile(onDeviceFilePath, this.$fs.readText(filePath));
                    this.$fs.deleteFile(filePath);
                }
            }
        });
    }
    getFileName(filePath, extension) {
        return path.basename(filePath.replace(extension === ".map" ? ".js.map" : ".js", ""));
    }
}
exports.ProjectFilesManager = ProjectFilesManager;
$injector.register("projectFilesManager", ProjectFilesManager);
