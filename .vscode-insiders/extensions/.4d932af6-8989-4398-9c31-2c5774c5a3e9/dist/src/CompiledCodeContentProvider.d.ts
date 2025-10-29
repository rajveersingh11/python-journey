import { LanguageClient } from 'vscode-languageclient/node';
import { Uri, TextDocumentContentProvider } from 'vscode';
export default class CompiledCodeContentProvider implements TextDocumentContentProvider {
    private getLanguageClient;
    static previewWindowUri: Uri;
    static scheme: string;
    private didChangeEmitter;
    private selectedSvelteFile;
    private subscriptions;
    private disposed;
    get onDidChange(): import("vscode").Event<Uri>;
    private refresh;
    constructor(getLanguageClient: () => LanguageClient);
    provideTextDocumentContent(): Promise<string | undefined>;
    dispose(): void;
}
