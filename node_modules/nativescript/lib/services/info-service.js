"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class InfoService {
    constructor($versionsService) {
        this.$versionsService = $versionsService;
    }
    printComponentsInfo() {
        return this.$versionsService.printVersionsInformation();
    }
}
exports.InfoService = InfoService;
$injector.register("infoService", InfoService);
