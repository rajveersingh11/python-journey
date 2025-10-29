"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = activate;
exports.deactivate = deactivate;
exports.activateSvelteLanguageServer = activateSvelteLanguageServer;
const path = __importStar(require("path"));
const vscode_1 = require("vscode");
const vscode_languageclient_1 = require("vscode-languageclient");
const node_1 = require("vscode-languageclient/node");
const CompiledCodeContentProvider_1 = __importDefault(require("./CompiledCodeContentProvider"));
const autoClose_1 = require("./html/autoClose");
const htmlEmptyTagsShared_1 = require("./html/htmlEmptyTagsShared");
const tsplugin_1 = require("./tsplugin");
const findComponentReferences_1 = require("./typescript/findComponentReferences");
const findFileReferences_1 = require("./typescript/findFileReferences");
const sveltekit_1 = require("./sveltekit");
const middlewares_1 = require("./middlewares");
var TagCloseRequest;
(function (TagCloseRequest) {
    TagCloseRequest.type = new vscode_languageclient_1.RequestType('html/tag');
})(TagCloseRequest || (TagCloseRequest = {}));
let lsApi;
function activate(context) {
    // The extension is activated on TS/JS/Svelte files because else it might be too late to configure the TS plugin:
    // If we only activate on Svelte file and the user opens a TS file first, the configuration command is issued too late.
    // We wait until there's a Svelte file open and only then start the actual language client.
    const tsPlugin = new tsplugin_1.TsPlugin(context);
    context.subscriptions.push(vscode_1.commands.registerCommand('svelte.restartLanguageServer', async () => {
        await lsApi?.restartLS(true);
    }));
    if (vscode_1.workspace.textDocuments.some((doc) => doc.languageId === 'svelte')) {
        lsApi = activateSvelteLanguageServer(context);
        tsPlugin.askToEnable();
    }
    else {
        const onTextDocumentListener = vscode_1.workspace.onDidOpenTextDocument((doc) => {
            if (doc.languageId === 'svelte') {
                lsApi = activateSvelteLanguageServer(context);
                tsPlugin.askToEnable();
                onTextDocumentListener.dispose();
            }
        });
        context.subscriptions.push(onTextDocumentListener);
    }
    (0, sveltekit_1.setupSvelteKit)(context);
    // This API is considered private and only exposed for experimenting.
    // Interface may change at any time. Use at your own risk!
    return {
        /**
         * As a function, because restarting the server
         * will result in another instance.
         */
        getLanguageServer() {
            if (!lsApi) {
                lsApi = activateSvelteLanguageServer(context);
            }
            return lsApi.getLS();
        }
    };
}
function deactivate() {
    const stop = lsApi?.getLS().stop();
    lsApi = undefined;
    return stop;
}
function activateSvelteLanguageServer(context) {
    warnIfOldExtensionInstalled();
    const runtimeConfig = vscode_1.workspace.getConfiguration('svelte.language-server');
    const { workspaceFolders } = vscode_1.workspace;
    const rootPath = Array.isArray(workspaceFolders) ? workspaceFolders[0].uri.fsPath : undefined;
    const tempLsPath = runtimeConfig.get('ls-path');
    // Returns undefined if path is empty string
    // Return absolute path if not already
    const lsPath = tempLsPath && tempLsPath.trim() !== ''
        ? path.isAbsolute(tempLsPath)
            ? tempLsPath
            : path.join(rootPath, tempLsPath)
        : undefined;
    const serverModule = require.resolve(lsPath || 'svelte-language-server/bin/server.js');
    console.log('Loading server from ', serverModule);
    // Add --experimental-modules flag for people using node 12 < version < 12.17
    // Remove this in mid 2022 and bump vs code minimum required version to 1.55
    const runExecArgv = ['--experimental-modules'];
    const runtimeArgs = runtimeConfig.get('runtime-args');
    if (runtimeArgs !== undefined) {
        runExecArgv.push(...runtimeArgs);
    }
    const debugArgs = ['--nolazy'];
    const port = runtimeConfig.get('port') ?? -1;
    if (port < 0) {
        debugArgs.push('--inspect=6009');
    }
    else {
        console.log('setting port to', port);
        runExecArgv.push(`--inspect=${port}`);
    }
    debugArgs.push(...runExecArgv);
    const serverOptions = {
        run: {
            module: serverModule,
            transport: node_1.TransportKind.ipc,
            options: { execArgv: runExecArgv }
        },
        debug: {
            module: serverModule,
            transport: node_1.TransportKind.ipc,
            options: { execArgv: debugArgs }
        }
    };
    const serverRuntime = runtimeConfig.get('runtime');
    if (serverRuntime) {
        serverOptions.run.runtime = serverRuntime;
        serverOptions.debug.runtime = serverRuntime;
        console.log('setting server runtime to', serverRuntime);
    }
    // Manually create the output channel so that it'll be reused and won't lose focus during restarts
    const outputChannel = vscode_1.window.createOutputChannel('Svelte', 'svelte');
    const clientOptions = {
        outputChannel,
        documentSelector: [{ scheme: 'file', language: 'svelte' }],
        revealOutputChannelOn: vscode_languageclient_1.RevealOutputChannelOn.Never,
        synchronize: {
            // TODO deprecated, rework upon next VS Code minimum version bump
            configurationSection: [
                'svelte',
                'prettier',
                'emmet',
                'javascript',
                'typescript',
                'css',
                'less',
                'scss',
                'html'
            ]
        },
        initializationOptions: {
            configuration: {
                svelte: vscode_1.workspace.getConfiguration('svelte'),
                prettier: vscode_1.workspace.getConfiguration('prettier'),
                emmet: vscode_1.workspace.getConfiguration('emmet'),
                typescript: vscode_1.workspace.getConfiguration('typescript'),
                javascript: vscode_1.workspace.getConfiguration('javascript'),
                css: vscode_1.workspace.getConfiguration('css'),
                less: vscode_1.workspace.getConfiguration('less'),
                scss: vscode_1.workspace.getConfiguration('scss'),
                html: vscode_1.workspace.getConfiguration('html')
            },
            dontFilterIncompleteCompletions: true, // VSCode filters client side and is smarter at it than us
            isTrusted: vscode_1.workspace.isTrusted
        },
        middleware: {
            resolveCodeLens: middlewares_1.resolveCodeLensMiddleware
        }
    };
    const ls = createLanguageServer(serverOptions, clientOptions);
    ls.start().then(() => {
        const tagRequestor = (document, position) => {
            const param = ls.code2ProtocolConverter.asTextDocumentPositionParams(document, position);
            return ls.sendRequest(TagCloseRequest.type, param);
        };
        const disposable = (0, autoClose_1.activateTagClosing)(tagRequestor, { svelte: true }, 'html.autoClosingTags');
        context.subscriptions.push(disposable);
    });
    vscode_1.workspace.onDidSaveTextDocument(async (doc) => {
        const parts = doc.uri.toString(true).split(/\/|\\/);
        if ([
            // /^tsconfig\.json$/,
            // /^jsconfig\.json$/,
            /^svelte\.config\.(js|cjs|mjs)$/,
            // https://prettier.io/docs/en/configuration.html
            /^\.prettierrc$/,
            /^\.prettierrc\.(json|yml|yaml|json5|toml)$/,
            /^\.prettierrc\.(js|cjs)$/,
            /^prettier\.config\.(js|cjs)$/
        ].some((regex) => regex.test(parts[parts.length - 1]))) {
            await restartLS(false);
        }
    });
    let restartingLs = false;
    async function restartLS(showNotification) {
        if (restartingLs) {
            return;
        }
        restartingLs = true;
        outputChannel.clear();
        await ls.restart();
        if (showNotification) {
            vscode_1.window.showInformationMessage('Svelte language server restarted.');
        }
        restartingLs = false;
    }
    function getLS() {
        return ls;
    }
    addDidChangeTextDocumentListener(getLS);
    (0, findFileReferences_1.addFindFileReferencesListener)(getLS, context);
    (0, findComponentReferences_1.addFindComponentReferencesListener)(getLS, context);
    addRenameFileListener(getLS);
    addCompilePreviewCommand(getLS, context);
    addExtracComponentCommand(getLS, context);
    addMigrateToSvelte5Command(getLS, context);
    addOpenLinkCommand(context);
    vscode_1.languages.setLanguageConfiguration('svelte', {
        indentationRules: {
            // Matches a valid opening tag that is:
            //  - Not a doctype
            //  - Not a void element
            //  - Not a closing tag
            //  - Not followed by a closing tag of the same element
            // Or matches `<!--`
            // Or matches open curly brace
            //
            increaseIndentPattern: /<(?!\?|(?:area|base|br|col|frame|hr|html|img|input|link|meta|param)\b|[^>]*\/>)([-_\.A-Za-z0-9]+)(?=\s|>)\b[^>]*>(?!.*<\/\1>)|<!--(?!.*-->)|\{[^}"']*$/,
            // Matches a closing tag that:
            //  - Follows optional whitespace
            //  - Is not `</html>`
            // Or matches `-->`
            // Or closing curly brace
            decreaseIndentPattern: /^\s*(<\/(?!html)[-_\.A-Za-z0-9]+\b[^>]*>|-->|\})/
        },
        // Matches a number or word that either:
        //  - Is a number with an optional negative sign and optional full number
        //    with numbers following the decimal point. e.g `-1.1px`, `.5`, `-.42rem`, etc
        //  - Is a sequence of characters without spaces and not containing
        //    any of the following: `~!@$^&*()=+[{]}\|;:'",.<>/
        //
        wordPattern: /(-?\d*\.\d\w*)|([^\`\~\!\@\#\^\&\*\(\)\=\+\[\{\]\}\\\|\;\:\'\"\,\.\<\>\/\s]+)/g,
        onEnterRules: [
            {
                // Matches an opening tag that:
                //  - Isn't an empty element
                //  - Is possibly namespaced
                //  - Isn't a void element
                //  - Isn't followed by another tag on the same line
                beforeText: new RegExp(`<(?!(?:${htmlEmptyTagsShared_1.EMPTY_ELEMENTS.join('|')}))([_:\\w][_:\\w-.\\d]*)([^/>]*(?!/)>)[^<]*$`, 'i'),
                // Matches a closing tag that:
                //  - Is possibly namespaced
                //  - Possibly has excess whitespace following tagname
                afterText: /^<\/([_:\w][_:\w-.\d]*)\s*>/i,
                action: { indentAction: vscode_1.IndentAction.IndentOutdent }
            },
            {
                // Matches an opening tag that:
                //  - Isn't an empty element
                //  - Isn't namespaced
                //  - Isn't a void element
                //  - Isn't followed by another tag on the same line
                beforeText: new RegExp(`<(?!(?:${htmlEmptyTagsShared_1.EMPTY_ELEMENTS.join('|')}))(\\w[\\w\\d]*)([^/>]*(?!/)>)[^<]*$`, 'i'),
                action: { indentAction: vscode_1.IndentAction.Indent }
            }
        ]
    });
    return {
        getLS,
        restartLS
    };
}
function addDidChangeTextDocumentListener(getLS) {
    // Only Svelte file changes are automatically notified through the inbuilt LSP
    // because the extension says it's only responsible for Svelte files.
    // Therefore we need to set this up for TS/JS files manually.
    vscode_1.workspace.onDidChangeTextDocument((evt) => {
        if (evt.document.languageId === 'typescript' || evt.document.languageId === 'javascript') {
            getLS().sendNotification('$/onDidChangeTsOrJsFile', {
                uri: evt.document.uri.toString(true),
                changes: evt.contentChanges.map((c) => ({
                    range: {
                        start: { line: c.range.start.line, character: c.range.start.character },
                        end: { line: c.range.end.line, character: c.range.end.character }
                    },
                    text: c.text
                }))
            });
        }
    });
}
function addRenameFileListener(getLS) {
    vscode_1.workspace.onDidRenameFiles(async (evt) => {
        const oldUri = evt.files[0].oldUri.toString(true);
        const parts = oldUri.split(/\/|\\/);
        const lastPart = parts[parts.length - 1];
        // If user moves/renames a folder, the URI only contains the parts up to that folder,
        // and not files. So in case the URI does not contain a '.', check for imports to update.
        if (lastPart.includes('.') &&
            !['.ts', '.js', '.json', '.svelte'].some((ending) => lastPart.endsWith(ending))) {
            return;
        }
        vscode_1.window.withProgress({ location: vscode_1.ProgressLocation.Window, title: 'Updating Imports..' }, async () => {
            const editsForFileRename = await getLS().sendRequest('$/getEditsForFileRename', 
            // Right now files is always an array with a single entry.
            // The signature was only designed that way to - maybe, in the future -
            // have the possibility to change that. If that ever does, update this.
            // In the meantime, just assume it's a single entry and simplify the
            // rest of the logic that way.
            {
                oldUri,
                newUri: evt.files[0].newUri.toString(true)
            });
            const edits = editsForFileRename?.documentChanges?.filter(vscode_languageclient_1.TextDocumentEdit.is);
            if (!edits) {
                return;
            }
            const workspaceEdit = new vscode_1.WorkspaceEdit();
            // We need to take into account multiple cases:
            // - A Svelte file is moved/renamed
            //      -> all updates will be related to that Svelte file, do that here. The TS LS won't even notice the update
            // - A TS/JS file is moved/renamed
            //      -> all updates will be related to that TS/JS file
            //      -> let the TS LS take care of these updates in TS/JS files, do Svelte file updates here
            // - A folder with TS/JS AND Svelte files is moved/renamed
            //      -> all Svelte file updates are handled here
            //      -> all TS/JS file updates that consist of only TS/JS import updates are handled by the TS LS
            //      -> all TS/JS file updates that consist of only Svelte import updates are handled here
            //      -> all TS/JS file updates that are mixed are handled here, but also possibly by the TS LS
            //         if the TS plugin doesn't prevent it. This trades risk of broken updates with certainty of missed updates
            edits.forEach((change) => {
                const isTsOrJsFile = change.textDocument.uri.endsWith('.ts') ||
                    change.textDocument.uri.endsWith('.js');
                const containsSvelteImportUpdate = change.edits.some((edit) => edit.newText.endsWith('.svelte'));
                if (isTsOrJsFile && !containsSvelteImportUpdate) {
                    return;
                }
                change.edits.forEach((edit) => {
                    if (isTsOrJsFile &&
                        !tsplugin_1.TsPlugin.isEnabled() &&
                        !edit.newText.endsWith('.svelte')) {
                        // TS plugin enabled -> all mixed imports are handled here
                        // TS plugin disabled -> let TS/JS path updates be handled by the TS LS, Svelte here
                        return;
                    }
                    // Renaming a file should only result in edits of existing files
                    workspaceEdit.replace(vscode_1.Uri.parse(change.textDocument.uri), new vscode_1.Range(new vscode_1.Position(edit.range.start.line, edit.range.start.character), new vscode_1.Position(edit.range.end.line, edit.range.end.character)), edit.newText);
                });
            });
            vscode_1.workspace.applyEdit(workspaceEdit);
        });
    });
}
function addCompilePreviewCommand(getLS, context) {
    const compiledCodeContentProvider = new CompiledCodeContentProvider_1.default(getLS);
    context.subscriptions.push(
    // Register the content provider for "svelte-compiled://" files
    vscode_1.workspace.registerTextDocumentContentProvider(CompiledCodeContentProvider_1.default.scheme, compiledCodeContentProvider), compiledCodeContentProvider);
    context.subscriptions.push(vscode_1.commands.registerTextEditorCommand('svelte.showCompiledCodeToSide', async (editor) => {
        if (editor?.document?.languageId !== 'svelte') {
            return;
        }
        vscode_1.window.withProgress({ location: vscode_1.ProgressLocation.Window, title: 'Compiling...' }, async () => {
            // Open a new preview window for the compiled code
            return await vscode_1.window.showTextDocument(CompiledCodeContentProvider_1.default.previewWindowUri, {
                preview: true,
                viewColumn: vscode_1.ViewColumn.Beside
            });
        });
    }));
}
function addExtracComponentCommand(getLS, context) {
    context.subscriptions.push(vscode_1.commands.registerTextEditorCommand('svelte.extractComponent', async (editor) => {
        if (editor?.document?.languageId !== 'svelte') {
            return;
        }
        // Prompt for new component name
        const options = {
            prompt: 'Component Name: ',
            placeHolder: 'NewComponent'
        };
        vscode_1.window.showInputBox(options).then(async (filePath) => {
            if (!filePath) {
                return vscode_1.window.showErrorMessage('No component name');
            }
            const uri = editor.document.uri.toString();
            const range = editor.selection;
            getLS().sendRequest(vscode_languageclient_1.ExecuteCommandRequest.type, {
                command: 'extract_to_svelte_component',
                arguments: [uri, { uri, range, filePath }]
            });
        });
    }));
}
function addMigrateToSvelte5Command(getLS, context) {
    context.subscriptions.push(vscode_1.commands.registerTextEditorCommand('svelte.migrate_to_svelte_5', async (editor) => {
        if (editor?.document?.languageId !== 'svelte') {
            return;
        }
        const uri = editor.document.uri.toString();
        getLS().sendRequest(vscode_languageclient_1.ExecuteCommandRequest.type, {
            command: 'migrate_to_svelte_5',
            arguments: [uri]
        });
    }));
}
function addOpenLinkCommand(context) {
    context.subscriptions.push(vscode_1.commands.registerCommand('svelte.openLink', (url) => {
        vscode_1.commands.executeCommand('vscode.open', vscode_1.Uri.parse(url));
    }));
}
function createLanguageServer(serverOptions, clientOptions) {
    return new node_1.LanguageClient('svelte', 'Svelte', serverOptions, clientOptions);
}
function warnIfOldExtensionInstalled() {
    if (vscode_1.extensions.getExtension('JamesBirtles.svelte-vscode')) {
        vscode_1.window.showWarningMessage('It seems you have the old and deprecated extension named "Svelte" installed. Please remove it. ' +
            'Through the UI: You can find it when searching for "@installed" in the extensions window (searching "Svelte" won\'t work). ' +
            'Command line: "code --uninstall-extension JamesBirtles.svelte-vscode"');
    }
}
//# sourceMappingURL=extension.js.map