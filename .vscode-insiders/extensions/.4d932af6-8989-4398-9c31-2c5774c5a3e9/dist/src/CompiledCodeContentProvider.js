"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const lodash_1 = require("lodash");
const vscode_1 = require("vscode");
// ContentProvider for "svelte-compiled://" files
class CompiledCodeContentProvider {
    get onDidChange() {
        return this.didChangeEmitter.event;
    }
    // This function triggers a refresh of the preview window's content
    // by emitting an event to the didChangeEmitter. VSCode listens to
    // this.onDidChange and will call provideTextDocumentContent
    refresh() {
        this.didChangeEmitter.fire(CompiledCodeContentProvider.previewWindowUri);
    }
    constructor(getLanguageClient) {
        this.getLanguageClient = getLanguageClient;
        this.didChangeEmitter = new vscode_1.EventEmitter();
        this.subscriptions = [];
        this.disposed = false;
        this.subscriptions.push(
        // This event triggers a refresh of the preview window's content
        // whenever the selected svelte file's content changes
        // (debounced to prevent too many recompilations)
        vscode_1.workspace.onDidChangeTextDocument((0, lodash_1.debounce)(async (event) => {
            if (event.document.languageId == 'svelte' && this.selectedSvelteFile) {
                this.refresh();
            }
        }, 500)));
        this.subscriptions.push(
        // This event sets the selectedSvelteFile when there is a different svelte file selected
        // and triggers a refresh of the preview window's content
        vscode_1.window.onDidChangeActiveTextEditor((editor) => {
            if (editor?.document?.languageId !== 'svelte') {
                return;
            }
            const newFile = editor.document.uri.toString();
            if (newFile !== this.selectedSvelteFile) {
                this.selectedSvelteFile = newFile;
                this.refresh();
            }
        }));
    }
    // This is called when VSCode needs to get the content of the preview window
    // we can trigger this using the didChangeEmitter
    async provideTextDocumentContent() {
        // If there is no selected svelte file, try to get it from the activeTextEditor
        // This should only happen when the svelte.showCompiledCodeToSide command is called the first time
        if (!this.selectedSvelteFile && vscode_1.window.activeTextEditor) {
            this.selectedSvelteFile = vscode_1.window.activeTextEditor.document.uri.toString();
        }
        // Should not be possible but handle it anyway
        if (!this.selectedSvelteFile) {
            vscode_1.window.setStatusBarMessage('Svelte: no svelte file selected');
            return;
        }
        const response = await this.getLanguageClient().sendRequest('$/getCompiledCode', this.selectedSvelteFile);
        const path = this.selectedSvelteFile.replace('file://', '');
        if (response?.js?.code) {
            return `/* Compiled: ${path} */\n${response.js.code}`;
        }
        else {
            vscode_1.window.setStatusBarMessage(`Svelte: fail to compile ${path}`, 3000);
        }
    }
    dispose() {
        if (this.disposed) {
            return;
        }
        this.subscriptions.forEach((d) => d.dispose());
        this.subscriptions.length = 0;
        this.disposed = true;
    }
}
CompiledCodeContentProvider.previewWindowUri = vscode_1.Uri.parse('svelte-compiled:///preview.js');
CompiledCodeContentProvider.scheme = 'svelte-compiled';
exports.default = CompiledCodeContentProvider;
//# sourceMappingURL=CompiledCodeContentProvider.js.map