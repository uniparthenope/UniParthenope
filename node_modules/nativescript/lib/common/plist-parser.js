"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const simplePlist = require("simple-plist");
class PlistParser {
    parseFile(plistFilePath) {
        return new Promise((resolve, reject) => {
            simplePlist.readFile(plistFilePath, (err, obj) => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(obj);
                }
            });
        });
    }
    parseFileSync(plistFilePath) {
        return simplePlist.readFileSync(plistFilePath);
    }
}
exports.PlistParser = PlistParser;
$injector.register("plistParser", PlistParser);
