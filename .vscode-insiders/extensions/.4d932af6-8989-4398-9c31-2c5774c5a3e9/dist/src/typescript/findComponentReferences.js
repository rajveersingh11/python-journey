"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addFindComponentReferencesListener = addFindComponentReferencesListener;
const vscode_1 = require("vscode");
async function addFindComponentReferencesListener(getLS, context) {
    const disposable = vscode_1.commands.registerCommand('svelte.typescript.findComponentReferences', handler);
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
            title: 'Finding component references'
        }, async (_, token) => {
            const lsLocations = await getLS().sendRequest('$/getComponentReferences', document.uri.toString(), token);
            if (!lsLocations) {
                return;
            }
            await vscode_1.commands.executeCommand('editor.action.showReferences', resource, new vscode_1.Position(0, 0), lsLocations.map((ref) => new vscode_1.Location(vscode_1.Uri.parse(ref.uri), new vscode_1.Range(ref.range.start.line, ref.range.start.character, ref.range.end.line, ref.range.end.character))));
        });
    }
}
//# sourceMappingURL=findComponentReferences.js.map