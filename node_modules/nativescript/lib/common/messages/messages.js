"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Messages {
    constructor() {
        this.Devices = {
            NotFoundDeviceByIdentifierErrorMessage: "Devices.NotFoundDeviceByIdentifierErrorMessage",
            NotFoundDeviceByIdentifierErrorMessageWithIdentifier: "Devices.NotFoundDeviceByIdentifierErrorMessageWithIdentifier",
            NotFoundDeviceByIndexErrorMessage: "Devices.NotFoundDeviceByIndexErrorMessage",
        };
    }
}
exports.Messages = Messages;
$injector.register('messages', Messages);
