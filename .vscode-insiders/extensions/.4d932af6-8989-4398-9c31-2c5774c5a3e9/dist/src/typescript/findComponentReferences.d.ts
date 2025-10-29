import { ExtensionContext } from 'vscode';
import { LanguageClient } from 'vscode-languageclient/node';
export declare function addFindComponentReferencesListener(getLS: () => LanguageClient, context: ExtensionContext): Promise<void>;
