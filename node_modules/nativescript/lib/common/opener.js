"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const xopen = require("open");
class Opener {
    open(target, appname) {
        return xopen(target, appname);
    }
}
exports.Opener = Opener;
$injector.register("opener", Opener);
