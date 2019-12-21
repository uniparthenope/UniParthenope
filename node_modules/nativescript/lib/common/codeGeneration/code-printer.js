"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const os_1 = require("os");
const code_entity_1 = require("./code-entity");
class CodePrinter {
    composeBlock(block, indentSize) {
        indentSize = indentSize === undefined ? 0 : indentSize;
        let content = this.getIndentation(indentSize);
        if (block.opener) {
            content += block.opener;
            content += CodePrinter.START_BLOCK_CHAR;
            content += CodePrinter.NEW_LINE_CHAR;
        }
        _.each(block.codeEntities, (codeEntity) => {
            if (codeEntity.codeEntityType === code_entity_1.CodeEntityType.Line) {
                content += this.composeLine(codeEntity, indentSize + 1);
            }
            else if (codeEntity.codeEntityType === code_entity_1.CodeEntityType.Block) {
                content += this.composeBlock(codeEntity, indentSize + 1);
            }
        });
        if (block.opener) {
            content += this.getIndentation(indentSize);
            content += CodePrinter.END_BLOCK_CHAR;
            content += block.endingCharacter || '';
            content += CodePrinter.NEW_LINE_CHAR;
        }
        return content;
    }
    getIndentation(indentSize) {
        return Array(indentSize).join(CodePrinter.INDENT_CHAR);
    }
    composeLine(line, indentSize) {
        let content = this.getIndentation(indentSize);
        content += line.content;
        content += CodePrinter.NEW_LINE_CHAR;
        return content;
    }
}
CodePrinter.INDENT_CHAR = "\t";
CodePrinter.NEW_LINE_CHAR = os_1.EOL;
CodePrinter.START_BLOCK_CHAR = " {";
CodePrinter.END_BLOCK_CHAR = "}";
exports.CodePrinter = CodePrinter;
$injector.register("swaggerCodePrinter", CodePrinter);
