import { ExtensionContext } from 'vscode';
import { LanguageClient } from 'vscode-languageclient/node';
/**
 * adopted from https://github.com/microsoft/vscode/blob/5f3e9c120a4407de3e55465588ce788618526eb0/extensions/typescript-language-features/src/languageFeatures/fileReferences.ts
 */
export declare function addFindFileReferencesListener(getLS: () => LanguageClient, context: ExtensionContext): Promise<void>;
