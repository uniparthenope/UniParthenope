"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const constants_1 = require("../../constants");
class NodeModulesDependenciesBuilder {
    constructor($fs) {
        this.$fs = $fs;
    }
    getProductionDependencies(projectPath) {
        const rootNodeModulesPath = path.join(projectPath, constants_1.NODE_MODULES_FOLDER_NAME);
        const projectPackageJsonPath = path.join(projectPath, constants_1.PACKAGE_JSON_FILE_NAME);
        const packageJsonContent = this.$fs.readJson(projectPackageJsonPath);
        const dependencies = packageJsonContent && packageJsonContent.dependencies;
        const resolvedDependencies = [];
        const queue = _.keys(dependencies)
            .map(dependencyName => ({
            parent: null,
            parentDir: projectPath,
            name: dependencyName,
            depth: 0
        }));
        while (queue.length) {
            const currentModule = queue.shift();
            const resolvedDependency = this.findModule(rootNodeModulesPath, currentModule, resolvedDependencies);
            if (resolvedDependency && !_.some(resolvedDependencies, r => r.directory === resolvedDependency.directory)) {
                _.each(resolvedDependency.dependencies, d => {
                    const dependency = { parent: currentModule, name: d, parentDir: resolvedDependency.directory, depth: resolvedDependency.depth + 1 };
                    const shouldAdd = !_.some(queue, element => element.parent === dependency.parent &&
                        element.name === dependency.name &&
                        element.parentDir === dependency.parentDir &&
                        element.depth === dependency.depth);
                    if (shouldAdd) {
                        queue.push(dependency);
                    }
                });
                resolvedDependencies.push(resolvedDependency);
            }
        }
        return resolvedDependencies;
    }
    findModule(rootNodeModulesPath, depDescription, resolvedDependencies) {
        let modulePath = path.join(depDescription.parentDir, constants_1.NODE_MODULES_FOLDER_NAME, depDescription.name);
        const rootModulesPath = path.join(rootNodeModulesPath, depDescription.name);
        let depthInNodeModules = depDescription.depth;
        if (!this.moduleExists(modulePath)) {
            let moduleExists = false;
            let parent = depDescription.parent;
            while (parent && !moduleExists) {
                modulePath = path.join(depDescription.parent.parentDir, constants_1.NODE_MODULES_FOLDER_NAME, depDescription.name);
                moduleExists = this.moduleExists(modulePath);
                if (!moduleExists) {
                    parent = parent.parent;
                }
            }
            if (!moduleExists) {
                modulePath = rootModulesPath;
                if (!this.moduleExists(modulePath)) {
                    return null;
                }
            }
            depthInNodeModules = 0;
        }
        if (_.some(resolvedDependencies, r => r.name === depDescription.name && r.directory === modulePath)) {
            return null;
        }
        return this.getDependencyData(depDescription.name, modulePath, depthInNodeModules);
    }
    getDependencyData(name, directory, depth) {
        const dependency = {
            name,
            directory,
            depth
        };
        const packageJsonPath = path.join(directory, constants_1.PACKAGE_JSON_FILE_NAME);
        const packageJsonExists = this.$fs.getLsStats(packageJsonPath).isFile();
        if (packageJsonExists) {
            const packageJsonContents = this.$fs.readJson(packageJsonPath);
            if (!!packageJsonContents.nativescript) {
                dependency.nativescript = packageJsonContents.nativescript;
            }
            dependency.dependencies = _.keys(packageJsonContents.dependencies);
            return dependency;
        }
        return null;
    }
    moduleExists(modulePath) {
        try {
            let modulePathLsStat = this.$fs.getLsStats(modulePath);
            if (modulePathLsStat.isSymbolicLink()) {
                modulePathLsStat = this.$fs.getLsStats(this.$fs.realpath(modulePath));
            }
            return modulePathLsStat.isDirectory();
        }
        catch (e) {
            return false;
        }
    }
}
exports.NodeModulesDependenciesBuilder = NodeModulesDependenciesBuilder;
$injector.register("nodeModulesDependenciesBuilder", NodeModulesDependenciesBuilder);
