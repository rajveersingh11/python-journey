"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateResources = generateResources;
const types_1 = require("./types");
const path_1 = require("path");
const vscode_1 = require("vscode");
async function generateResources(config) {
    vscode_1.workspace.fs.createDirectory(vscode_1.Uri.file(config.path));
    const edit = new vscode_1.WorkspaceEdit();
    for (const resource of config.resources) {
        const ext = resource.type === types_1.FileType.PAGE ? config.pageExtension : config.scriptExtension;
        const filepath = (0, path_1.join)(config.path, `${resource.filename}.${ext}`);
        const uri = vscode_1.Uri.file(filepath);
        edit.createFile(uri, {
            overwrite: false,
            ignoreIfExists: true
        });
        const data = await resource.generate(config);
        edit.insert(uri, new vscode_1.Position(0, 0), data);
    }
    await vscode_1.workspace.applyEdit(edit);
    // save documents and open the first
    await Promise.all(edit.entries().map(async ([uri], i) => {
        const doc = vscode_1.workspace.textDocuments.find((t) => t.uri.path === uri.path);
        if (doc) {
            await doc?.save();
            if (i === 0) {
                await vscode_1.workspace.openTextDocument(uri);
                await vscode_1.window.showTextDocument(doc);
            }
        }
    }));
}
//# sourceMappingURL=generate.js.map