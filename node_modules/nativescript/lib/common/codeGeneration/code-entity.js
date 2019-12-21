"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var CodeEntityType;
(function (CodeEntityType) {
    CodeEntityType[CodeEntityType["Line"] = 0] = "Line";
    CodeEntityType[CodeEntityType["Block"] = 1] = "Block";
})(CodeEntityType = exports.CodeEntityType || (exports.CodeEntityType = {}));
class Line {
    constructor(content) {
        this.content = content;
    }
    get codeEntityType() {
        return CodeEntityType.Line;
    }
    static create(content) {
        return new Line(content);
    }
}
exports.Line = Line;
$injector.register("swaggerLine", Line);
class Block {
    constructor(opener) {
        this.opener = opener;
        this.codeEntities = [];
    }
    get codeEntityType() {
        return CodeEntityType.Block;
    }
    addBlock(block) {
        this.codeEntities.push(block);
    }
    addLine(line) {
        this.codeEntities.push(line);
    }
    addBlocks(blocks) {
        _.each(blocks, (block) => this.addBlock(block));
    }
    writeLine(content) {
        const line = Line.create(content);
        this.codeEntities.push(line);
    }
}
exports.Block = Block;
$injector.register("swaggerBlock", Block);
