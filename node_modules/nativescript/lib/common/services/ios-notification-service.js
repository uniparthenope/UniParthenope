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
const constants = require("../constants");
class IOSNotificationService {
    constructor($iosDeviceOperations) {
        this.$iosDeviceOperations = $iosDeviceOperations;
    }
    awaitNotification(deviceIdentifier, socket, timeout) {
        return __awaiter(this, void 0, void 0, function* () {
            const notificationResponse = yield this.$iosDeviceOperations.awaitNotificationResponse([{
                    deviceId: deviceIdentifier,
                    socket: socket,
                    timeout: timeout,
                    responseCommandType: constants.IOS_RELAY_NOTIFICATION_COMMAND_TYPE,
                    responsePropertyName: "Name"
                }]);
            return _.first(notificationResponse[deviceIdentifier]).response;
        });
    }
    postNotification(deviceIdentifier, notification, commandType) {
        return __awaiter(this, void 0, void 0, function* () {
            commandType = commandType || constants.IOS_POST_NOTIFICATION_COMMAND_TYPE;
            const response = yield this.$iosDeviceOperations.postNotification([{ deviceId: deviceIdentifier, commandType: commandType, notificationName: notification }]);
            return +_.first(response[deviceIdentifier]).response;
        });
    }
}
exports.IOSNotificationService = IOSNotificationService;
$injector.register("iOSNotificationService", IOSNotificationService);
