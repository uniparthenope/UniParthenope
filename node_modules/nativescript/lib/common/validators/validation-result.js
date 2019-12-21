"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class ValidationResult {
    constructor(errorMsg) {
        this.errorMsg = errorMsg;
    }
    get error() {
        return this.errorMsg;
    }
    get isSuccessful() {
        return !this.errorMsg;
    }
}
ValidationResult.Successful = new ValidationResult(null);
exports.ValidationResult = ValidationResult;
