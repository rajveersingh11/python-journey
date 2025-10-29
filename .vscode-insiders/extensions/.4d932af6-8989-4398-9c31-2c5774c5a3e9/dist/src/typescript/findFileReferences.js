"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addFindFileReferencesListener = addFindFileReferencesListener;
const vscode_1 = require("vscode");
/**
 * adopted from https://github.com/microsoft/vscode/blob/5f3e9c120a4407de3e55465588ce788618526eb0/extensions/typescript-language-features/src/languageFeatures/fileReferences.ts
 */
async function addFindFileReferencesListener(getLS, context) {
    const disposable = vscode_1.commands.registerCommand('svelte.typescript.findAllFileReferences', handler);
    context.subscriptions.push(disposable);
    async function handler(resource) {
        if (!resource) {
            resource = vscode_1.window.activeTextEditor?.document.uri;
        }
        if (!resource || resource.scheme !== 'file') {
            return;
        }
        const document = await vscode_1.workspace.openTextDocument(resource);
        await vscode_1.window.withProgress({
            location: vscode_1.ProgressLocation.Window,
            title: 'Finding file references'
        }, async (_, token) => {
            const lsLocations = await getLS().sendRequest('$/getFileReferences', document.uri.toString(), token);
            if (!lsLocations) {
                return;
            }
            const config = vscode_1.workspace.getConfiguration('references');
            const existingSetting = config.inspect('preferredLocation');
            await config.update('preferredLocation', 'view');
            try {
                await vscode_1.commands.executeCommand('editor.action.showReferences', resource, new vscode_1.Position(0, 0), lsLocations.map((ref) => new vscode_1.Location(vscode_1.Uri.parse(ref.uri), new vscode_1.Range(ref.range.start.line, ref.range.start.character, ref.range.end.line, ref.range.end.character))));
            }
            finally {
                await config.update('preferredLocation', existingSetting?.workspaceFolderValue ?? existingSetting?.workspaceValue);
            }
        });
    }
}
//# sourceMappingURL=findFileReferences.js.map