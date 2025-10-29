"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolveCodeLensMiddleware = void 0;
const vscode_1 = require("vscode");
/**
 * Reference-like code lens require a client command to be executed.
 * There isn't a way to request client to show references from the server.
 * If other clients want to show references, they need to have a similar middleware to resolve the code lens.
 */
const resolveCodeLensMiddleware = async function (resolving, token, next) {
    const codeLen = await next(resolving, token);
    if (!codeLen) {
        return resolving;
    }
    if (codeLen.command?.arguments?.length !== 3) {
        return codeLen;
    }
    const locations = codeLen.command.arguments[2];
    codeLen.command.command = locations.length > 0 ? 'editor.action.showReferences' : '';
    codeLen.command.arguments = [
        vscode_1.Uri.parse(codeLen?.command?.arguments[0]),
        codeLen.range.start,
        locations.map((l) => new vscode_1.Location(vscode_1.Uri.parse(l.uri), new vscode_1.Range(l.range.start.line, l.range.start.character, l.range.end.line, l.range.end.character)))
    ];
    return codeLen;
};
exports.resolveCodeLensMiddleware = resolveCodeLensMiddleware;
//# sourceMappingURL=middlewares.js.map