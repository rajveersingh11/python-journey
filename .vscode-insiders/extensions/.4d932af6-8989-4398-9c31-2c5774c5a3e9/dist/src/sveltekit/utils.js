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
exports.fileExists = fileExists;
exports.findFile = findFile;
exports.checkProjectKind = checkProjectKind;
exports.getVersionFromPackageJson = getVersionFromPackageJson;
const util_1 = require("util");
const path = __importStar(require("path"));
const vscode_1 = require("vscode");
async function fileExists(file) {
    try {
        await vscode_1.workspace.fs.stat(vscode_1.Uri.file(file));
        return true;
    }
    catch (err) {
        return false;
    }
}
async function findFile(searchPath, fileName) {
    for (;;) {
        const filePath = path.join(searchPath, fileName);
        if (await fileExists(filePath)) {
            return filePath;
        }
        const parentPath = path.dirname(searchPath);
        if (parentPath === searchPath) {
            return;
        }
        searchPath = parentPath;
    }
}
async function checkProjectKind(path) {
    const tsconfig = await findFile(path, 'tsconfig.json');
    const jsconfig = await findFile(path, 'jsconfig.json');
    const svelteVersion = await getVersionFromPackageJson('svelte');
    const withRunes = svelteVersion ? versionAtLeast(svelteVersion, 5) : true;
    const svelteKitVersion = await getVersionFromPackageJson('@sveltejs/kit');
    let withProps = svelteKitVersion ? versionAtLeast(svelteKitVersion, 2, 16) : true;
    const withTs = !!tsconfig && (!jsconfig || tsconfig.length >= jsconfig.length);
    let withSatisfies = false;
    if (withTs) {
        try {
            const packageJSONPath = require.resolve('typescript/package.json', {
                paths: [tsconfig]
            });
            const { version } = require(packageJSONPath);
            withSatisfies = version ? versionAtLeast(version, 4, 9) : true;
        }
        catch (e) {
            withSatisfies = true;
        }
    }
    return {
        withTs,
        withSatisfies,
        withRunes,
        withProps
    };
}
function versionAtLeast(version, major, minor) {
    const [majorVersion, minorVersion] = version.split('.');
    return ((Number(majorVersion) === major && Number(minorVersion) >= (minor ?? 0)) ||
        Number(majorVersion) > major);
}
async function getVersionFromPackageJson(packageName) {
    const packageJsonList = await vscode_1.workspace.findFiles('**/package.json', '**/node_modules/**');
    if (packageJsonList.length === 0) {
        return undefined;
    }
    for (const fileUri of packageJsonList) {
        try {
            const text = new util_1.TextDecoder().decode(await vscode_1.workspace.fs.readFile(fileUri));
            const pkg = JSON.parse(text);
            const svelteVersion = pkg.devDependencies?.[packageName] ?? pkg.dependencies?.[packageName];
            if (svelteVersion !== undefined) {
                return svelteVersion;
            }
        }
        catch (error) {
            console.error(error);
        }
    }
    return undefined;
}
//# sourceMappingURL=utils.js.map