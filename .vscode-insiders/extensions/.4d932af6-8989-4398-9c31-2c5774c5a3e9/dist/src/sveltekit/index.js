"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupSvelteKit = setupSvelteKit;
const util_1 = require("util");
const vscode_1 = require("vscode");
const generateFiles_1 = require("./generateFiles");
function setupSvelteKit(context) {
    let contextMenuEnabled = false;
    context.subscriptions.push(vscode_1.workspace.onDidChangeConfiguration(() => {
        enableContextMenu();
    }));
    (0, generateFiles_1.addGenerateKitRouteFilesCommand)(context);
    enableContextMenu();
    async function enableContextMenu() {
        const config = getConfig();
        if (config === 'never') {
            if (contextMenuEnabled) {
                setEnableContext(false);
            }
            return;
        }
        if (config === 'always') {
            // Force on. The condition is defined in the extension manifest
            return;
        }
        const enabled = await detect(20);
        if (enabled !== contextMenuEnabled) {
            setEnableContext(enabled);
            contextMenuEnabled = enabled;
        }
    }
}
function getConfig() {
    return (vscode_1.workspace
        .getConfiguration('svelte.ui.svelteKitFilesContextMenu')
        .get('enable') ?? 'auto');
}
async function detect(nrRetries) {
    const packageJsonList = await vscode_1.workspace.findFiles('**/package.json', '**/node_modules/**');
    if (packageJsonList.length === 0 && nrRetries > 0) {
        // We assume that the user has not setup their project yet, so try again after a while
        await new Promise((resolve) => setTimeout(resolve, 10000));
        return detect(nrRetries - 1);
    }
    for (const fileUri of packageJsonList) {
        try {
            const text = new util_1.TextDecoder().decode(await vscode_1.workspace.fs.readFile(fileUri));
            const pkg = JSON.parse(text);
            const hasKit = Object.keys(pkg.devDependencies ?? {})
                .concat(Object.keys(pkg.dependencies ?? {}))
                .includes('@sveltejs/kit');
            if (hasKit) {
                return true;
            }
        }
        catch (error) {
            console.error(error);
        }
    }
    return false;
}
function setEnableContext(enable) {
    // https://code.visualstudio.com/api/references/when-clause-contexts#add-a-custom-when-clause-context
    vscode_1.commands.executeCommand('setContext', 'svelte.uiContext.svelteKitFilesContextMenu.enable', enable);
}
//# sourceMappingURL=index.js.map