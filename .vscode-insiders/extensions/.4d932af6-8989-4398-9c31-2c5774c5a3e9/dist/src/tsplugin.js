"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TsPlugin = void 0;
const vscode_1 = require("vscode");
class TsPlugin {
    constructor(context) {
        this.enabled = TsPlugin.isEnabled();
        this.toggleTsPlugin(this.enabled);
        context.subscriptions.push(vscode_1.workspace.onDidChangeConfiguration(() => {
            const enabled = TsPlugin.isEnabled();
            if (enabled !== this.enabled) {
                this.enabled = enabled;
                this.toggleTsPlugin(this.enabled);
            }
        }));
    }
    static isEnabled() {
        return vscode_1.workspace.getConfiguration('svelte').get('enable-ts-plugin') ?? false;
    }
    async toggleTsPlugin(enable) {
        const extension = vscode_1.extensions.getExtension('vscode.typescript-language-features');
        if (!extension) {
            return;
        }
        // This somewhat semi-public command configures our TypeScript plugin.
        // The plugin itself is always present, but enabled/disabled depending on this config.
        // It is done this way because it allows us to toggle the plugin without restarting VS Code
        // and without having to do hacks like updating the extension's package.json.
        vscode_1.commands.executeCommand('_typescript.configurePlugin', 'typescript-svelte-plugin', {
            enable
        });
    }
    async askToEnable() {
        const shouldAsk = vscode_1.workspace
            .getConfiguration('svelte')
            .get('ask-to-enable-ts-plugin');
        if (this.enabled || !shouldAsk) {
            return;
        }
        const answers = ['Enable', 'Later', 'Do not show again'];
        const response = await vscode_1.window.showInformationMessage('The Svelte for VS Code extension now contains a TypeScript plugin. ' +
            'Enabling it will provide intellisense for Svelte files from TS/JS files. ' +
            'Would you like to enable it? ' +
            'You can always enable/disable it later on through the extension settings.', ...answers);
        if (response === answers[0]) {
            vscode_1.workspace.getConfiguration('svelte').update('enable-ts-plugin', true, true);
        }
        else if (response === answers[2]) {
            vscode_1.workspace.getConfiguration('svelte').update('ask-to-enable-ts-plugin', false, true);
        }
    }
}
exports.TsPlugin = TsPlugin;
//# sourceMappingURL=tsplugin.js.map