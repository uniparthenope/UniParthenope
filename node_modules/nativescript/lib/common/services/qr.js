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
const qr_image_1 = require("qr-image");
const querystring_1 = require("querystring");
class QrCodeGenerator {
    constructor($staticConfig, $logger) {
        this.$staticConfig = $staticConfig;
        this.$logger = $logger;
    }
    generateDataUri(data) {
        return __awaiter(this, void 0, void 0, function* () {
            let result = null;
            try {
                const qrSvg = qr_image_1.imageSync(data, { size: this.$staticConfig.QR_SIZE, type: "svg" }).toString();
                result = `data:image/svg+xml;utf-8,${querystring_1.escape(qrSvg)}`;
            }
            catch (err) {
                this.$logger.trace(`Failed to generate QR code for ${data}`, err);
            }
            return result;
        });
    }
}
exports.QrCodeGenerator = QrCodeGenerator;
$injector.register("qr", QrCodeGenerator);
