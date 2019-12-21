"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
class ITunesValidator {
    constructor($fs, $hostInfo) {
        this.$fs = $fs;
        this.$hostInfo = $hostInfo;
    }
    getError() {
        if (this.$hostInfo.isWindows) {
            let commonProgramFiles = "";
            const isNode64 = process.arch === "x64";
            if (isNode64) {
                commonProgramFiles = process.env.CommonProgramFiles;
                if (this.isiTunesInstalledOnWindows(process.env["CommonProgramFiles(x86)"]) && !this.isiTunesInstalledOnWindows(commonProgramFiles)) {
                    return ITunesValidator.BITNESS_MISMATCH_ERROR_MESSAGE;
                }
            }
            else {
                if (this.$hostInfo.isWindows32) {
                    commonProgramFiles = process.env.CommonProgramFiles;
                }
                else {
                    commonProgramFiles = process.env["CommonProgramFiles(x86)"];
                    if (this.isiTunesInstalledOnWindows(process.env.CommonProgramFiles) && !this.isiTunesInstalledOnWindows(commonProgramFiles)) {
                        return ITunesValidator.BITNESS_MISMATCH_ERROR_MESSAGE;
                    }
                }
            }
            if (!this.isiTunesInstalledOnWindows(commonProgramFiles)) {
                return ITunesValidator.NOT_INSTALLED_iTUNES_ERROR_MESSAGE;
            }
            return null;
        }
        else if (this.$hostInfo.isDarwin) {
            const coreFoundationDir = "/System/Library/Frameworks/CoreFoundation.framework/CoreFoundation";
            const mobileDeviceDir = "/System/Library/PrivateFrameworks/MobileDevice.framework/MobileDevice";
            if (!this.isiTunesInstalledCore(coreFoundationDir, mobileDeviceDir)) {
                return ITunesValidator.NOT_INSTALLED_iTUNES_ERROR_MESSAGE;
            }
            return null;
        }
        return ITunesValidator.UNSUPPORTED_OS_ERROR_MESSAGE;
    }
    isiTunesInstalledOnWindows(commonProgramFiles) {
        const coreFoundationDir = path.join(commonProgramFiles, "Apple", "Apple Application Support");
        const mobileDeviceDir = path.join(commonProgramFiles, "Apple", "Mobile Device Support");
        return this.isiTunesInstalledCore(coreFoundationDir, mobileDeviceDir);
    }
    isiTunesInstalledCore(coreFoundationDir, mobileDeviceDir) {
        return this.$fs.exists(coreFoundationDir) && this.$fs.exists(mobileDeviceDir);
    }
}
ITunesValidator.NOT_INSTALLED_iTUNES_ERROR_MESSAGE = "iTunes is not installed. Install it on your system and run this command again.";
ITunesValidator.BITNESS_MISMATCH_ERROR_MESSAGE = "The bitness of Node.js and iTunes must match. Verify that both Node.js and iTunes are 32-bit or 64-bit and try again.";
ITunesValidator.UNSUPPORTED_OS_ERROR_MESSAGE = "iTunes is not available for this operating system. You will not be able to work with connected iOS devices.";
exports.ITunesValidator = ITunesValidator;
$injector.register("iTunesValidator", ITunesValidator);
