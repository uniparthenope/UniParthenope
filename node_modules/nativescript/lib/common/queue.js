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
class Queue {
    constructor(items) {
        this.items = items;
        this.items = this.items === undefined ? [] : this.items;
    }
    enqueue(item) {
        this.items.unshift(item);
        if (this.promiseResolve) {
            this.promiseResolve();
        }
    }
    dequeue() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.items.length) {
                const promise = new Promise((resolve, reject) => {
                    this.promiseResolve = resolve;
                });
                yield promise;
                this.promiseResolve = null;
            }
            return this.items.pop();
        });
    }
}
exports.Queue = Queue;
