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
Object.defineProperty(exports, "__esModule", { value: true });
exports.addGenerateKitRouteFilesCommand = addGenerateKitRouteFilesCommand;
const path = __importStar(require("path"));
const vscode_1 = require("vscode");
const commands_1 = require("./commands");
const generate_1 = require("./generate");
const resources_1 = require("./resources");
const types_1 = require("./types");
const utils_1 = require("../utils");
class GenerateError extends Error {
}
function addGenerateKitRouteFilesCommand(context) {
    commands_1.addResourceCommandMap.forEach((value, key) => {
        context.subscriptions.push(vscode_1.commands.registerCommand(key, (args) => {
            handleSingle(args, value).catch(handleError);
        }));
    });
    context.subscriptions.push(vscode_1.commands.registerCommand(types_1.CommandType.MULTIPLE, async (args) => {
        handleMultiple(args).catch(handleError);
    }));
}
async function handleError(err) {
    if (err instanceof GenerateError) {
        await vscode_1.window.showErrorMessage(err.message);
    }
    else {
        throw err;
    }
}
async function handleSingle(uri, resourceType) {
    const resource = resources_1.resourcesMap.get(resourceType);
    if (!resource) {
        throw new GenerateError(`Resource '${resourceType}' does not exist`);
    }
    const resources = [resource];
    const { kind, rootPath, scriptExtension } = await getCommonConfig(uri);
    const itemPath = await promptResourcePath();
    if (!itemPath) {
        return;
    }
    await generate({
        path: path.join(rootPath, itemPath),
        kind,
        pageExtension: 'svelte',
        scriptExtension,
        resources
    });
}
async function handleMultiple(uri) {
    const { kind, rootPath, scriptExtension } = await getCommonConfig(uri);
    const itemPath = await promptResourcePath();
    if (!itemPath) {
        return;
    }
    // Add multiple files
    const opts = [
        types_1.ResourceType.PAGE,
        types_1.ResourceType.PAGE_LOAD,
        types_1.ResourceType.PAGE_SERVER,
        types_1.ResourceType.LAYOUT,
        types_1.ResourceType.LAYOUT_LOAD,
        types_1.ResourceType.LAYOUT_SERVER,
        types_1.ResourceType.ERROR,
        types_1.ResourceType.SERVER
    ].map((type) => {
        const resource = resources_1.resourcesMap.get(type);
        // const iconName = resource.type === FileType.PAGE ? 'svelte' : isTs ? 'typescript' : 'javascript';
        const extension = resource.type === types_1.FileType.PAGE ? 'svelte' : scriptExtension;
        return {
            // TODO: maybe add icons (ts,js,svelte - but it doesn´t work like this)
            // description: `$(${iconName}) ${resource.filename}.${extension}`,
            label: `${resource.filename}.${extension}`,
            value: resource
        };
    });
    const result = await vscode_1.window.showQuickPick(opts, { canPickMany: true });
    if (!result) {
        return;
    }
    await generate({
        path: path.join(rootPath, itemPath),
        kind,
        pageExtension: 'svelte',
        scriptExtension,
        resources: result.map((res) => res.value)
    });
}
async function promptResourcePath() {
    const itemPath = await vscode_1.window.showInputBox({
        prompt: 'Enter the path of the resources, relative to current folder',
        value: '/'
    });
    return itemPath;
}
async function generate(config) {
    await vscode_1.window.withProgress({ location: vscode_1.ProgressLocation.Window, title: 'Creating SvelteKit files...' }, async () => {
        await (0, generate_1.generateResources)(config);
    });
}
async function getCommonConfig(uri) {
    const rootPath = getRootPath(uri);
    if (!rootPath) {
        throw new GenerateError('Could not resolve root path. Please open a file first or use the context menu!');
    }
    const kind = await (0, utils_1.checkProjectKind)(rootPath);
    const scriptExtension = getScriptExtension(kind);
    return {
        kind,
        scriptExtension,
        rootPath
    };
}
function getScriptExtension(kind) {
    return kind.withTs ? 'ts' : 'js';
}
function getRootPath(uri) {
    let rootPath;
    if (uri) {
        rootPath = uri.fsPath;
    }
    else if (vscode_1.window.activeTextEditor) {
        rootPath = path.dirname(vscode_1.window.activeTextEditor.document.fileName);
    }
    else if (vscode_1.workspace.workspaceFolders && vscode_1.workspace.workspaceFolders.length === 1) {
        rootPath = vscode_1.workspace.workspaceFolders[0].uri.fsPath;
    }
    return rootPath;
}
//# sourceMappingURL=index.js.map