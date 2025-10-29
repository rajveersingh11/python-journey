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
const vitest_1 = require("vitest");
function setupMocks(config = {}) {
    vitest_1.vi.resetModules(); // Reset modules before setting up new mocks
    const { tsconfig, jsconfig, svelteVersion, svelteKitVersion, tsVersion } = config;
    // Default package.json with versions
    const defaultPackageJson = {
        dependencies: {
            svelte: svelteVersion,
            '@sveltejs/kit': svelteKitVersion
        }
    };
    // Mock TypeScript package for version detection if tsVersion is provided
    if (tsVersion) {
        // Override Module._resolveFilename if available to intercept require.resolve calls
        const Module = require('module');
        const originalResolveFilename = Module._resolveFilename;
        Module._resolveFilename = function (request, parent, isMain, options) {
            if (request === 'typescript/package.json') {
                return '/fake/typescript/package.json';
            }
            return originalResolveFilename.call(this, request, parent, isMain, options);
        };
        // Override Module._load to provide the mock package.json content
        const originalLoad = Module._load;
        Module._load = function (id, parent, isMain) {
            if (id === '/fake/typescript/package.json') {
                return { version: tsVersion };
            }
            return originalLoad.call(this, id, parent, isMain);
        };
    }
    vitest_1.vi.doMock('vscode', () => ({
        Uri: { file: vitest_1.vi.fn((path) => ({ path })) },
        workspace: {
            fs: {
                stat: vitest_1.vi.fn().mockImplementation((uri) => {
                    const path = uri.path || uri.toString();
                    // Mock config file existence based on configuration
                    if (path.endsWith('tsconfig.json') && tsconfig) {
                        return Promise.resolve({ type: 1 }); // File exists
                    }
                    if (path.endsWith('jsconfig.json') && jsconfig) {
                        return Promise.resolve({ type: 1 }); // File exists
                    }
                    return Promise.reject(new Error('File not found'));
                }),
                readFile: vitest_1.vi
                    .fn()
                    .mockResolvedValue(new TextEncoder().encode(JSON.stringify(defaultPackageJson)))
            },
            findFiles: vitest_1.vi.fn().mockReturnValue([{ path: '/fake/package.json' }])
        }
    }));
}
(0, vitest_1.describe)('checkProjectKind', () => {
    (0, vitest_1.beforeEach)(() => {
        vitest_1.vi.clearAllMocks();
        vitest_1.vi.resetModules();
    });
    const combinations = [
        // by default
        ['default to js', {}, 'withTs', false],
        ['default to runes', {}, 'withRunes', true],
        ['default to not satisfies', {}, 'withSatisfies', false],
        ['default to withProps', {}, 'withProps', true],
        ['js', { jsconfig: true }, 'withTs', false],
        ['ts', { tsconfig: true }, 'withTs', true],
        ['ts satisfies (default)', { tsconfig: true }, 'withSatisfies', true],
        ['ts not satisfies', { tsconfig: true, tsVersion: '3.0' }, 'withSatisfies', false],
        ['ts satisfies', { tsconfig: true, tsVersion: '4.9' }, 'withSatisfies', true],
        ['ts not satisfies major', { tsconfig: true, tsVersion: '4' }, 'withSatisfies', false],
        ['ts not satisfies minor', { tsconfig: true, tsVersion: '4.8' }, 'withSatisfies', false],
        ['no runes 1', { svelteVersion: '1' }, 'withRunes', false],
        ['no runes 4', { svelteVersion: '4.99' }, 'withRunes', false],
        ['runes 12', { svelteVersion: '12' }, 'withRunes', true],
        ['runes 12', { svelteVersion: '5.0' }, 'withRunes', true],
        ['no sveltekit', { svelteKitVersion: '1' }, 'withProps', false],
        ['no sveltekit', { svelteKitVersion: '2' }, 'withProps', false],
        ['sveltekit', { svelteKitVersion: '2.15' }, 'withProps', false],
        ['sveltekit', { svelteKitVersion: '2.16' }, 'withProps', true],
        ['sveltekit', { svelteKitVersion: '3' }, 'withProps', true]
    ];
    for (const [name, config, ex, toBe] of combinations) {
        (0, vitest_1.it)(name, async () => {
            setupMocks(config);
            const utils = await Promise.resolve().then(() => __importStar(require('../../src/sveltekit/utils')));
            const result = await utils.checkProjectKind('/test/path');
            (0, vitest_1.expect)(result[ex]).toBe(toBe);
        });
    }
});
//# sourceMappingURL=utils.spec.js.map