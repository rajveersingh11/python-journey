import { ExtensionContext } from 'vscode';
import { LanguageClient } from 'vscode-languageclient/node';
export declare function activate(context: ExtensionContext): {
    /**
     * As a function, because restarting the server
     * will result in another instance.
     */
    getLanguageServer(): LanguageClient;
};
export declare function deactivate(): Promise<void> | undefined;
export declare function activateSvelteLanguageServer(context: ExtensionContext): {
    getLS: () => LanguageClient;
    restartLS: (showNotification: boolean) => Promise<void>;
};
