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
class StringCommandParameter {
    constructor($injector) {
        this.$injector = $injector;
        this.mandatory = false;
    }
    validate(validationValue) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!validationValue) {
                if (this.errorMessage) {
                    this.$injector.resolve("errors").fail(this.errorMessage);
                }
                return false;
            }
            return true;
        });
    }
}
exports.StringCommandParameter = StringCommandParameter;
$injector.register("stringParameter", StringCommandParameter);
class StringParameterBuilder {
    constructor($injector) {
        this.$injector = $injector;
    }
    createMandatoryParameter(errorMsg) {
        const commandParameter = new StringCommandParameter(this.$injector);
        commandParameter.mandatory = true;
        commandParameter.errorMessage = errorMsg;
        return commandParameter;
    }
}
exports.StringParameterBuilder = StringParameterBuilder;
$injector.register("stringParameterBuilder", StringParameterBuilder);
