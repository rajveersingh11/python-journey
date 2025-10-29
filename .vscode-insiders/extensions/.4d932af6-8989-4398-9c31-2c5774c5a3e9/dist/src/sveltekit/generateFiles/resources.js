"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resourcesMap = void 0;
const types_1 = require("./types");
const page_1 = __importDefault(require("./templates/page"));
const page_load_1 = __importDefault(require("./templates/page-load"));
const page_server_1 = __importDefault(require("./templates/page-server"));
const layout_1 = __importDefault(require("./templates/layout"));
const layout_load_1 = __importDefault(require("./templates/layout-load"));
const layout_server_1 = __importDefault(require("./templates/layout-server"));
const error_1 = __importDefault(require("./templates/error"));
const server_1 = __importDefault(require("./templates/server"));
exports.resourcesMap = new Map([
    [types_1.ResourceType.PAGE, { type: types_1.FileType.PAGE, filename: '+page', generate: page_1.default }],
    [types_1.ResourceType.PAGE_LOAD, { type: types_1.FileType.SCRIPT, filename: '+page', generate: page_load_1.default }],
    [
        types_1.ResourceType.PAGE_SERVER,
        {
            type: types_1.FileType.SCRIPT,
            filename: '+page.server',
            generate: page_server_1.default
        }
    ],
    [types_1.ResourceType.LAYOUT, { type: types_1.FileType.PAGE, filename: '+layout', generate: layout_1.default }],
    [
        types_1.ResourceType.LAYOUT_LOAD,
        { type: types_1.FileType.SCRIPT, filename: '+layout', generate: layout_load_1.default }
    ],
    [
        types_1.ResourceType.LAYOUT_SERVER,
        {
            type: types_1.FileType.SCRIPT,
            filename: '+layout.server',
            generate: layout_server_1.default
        }
    ],
    [types_1.ResourceType.SERVER, { type: types_1.FileType.SCRIPT, filename: '+server', generate: server_1.default }],
    [types_1.ResourceType.ERROR, { type: types_1.FileType.PAGE, filename: '+error', generate: error_1.default }]
]);
//# sourceMappingURL=resources.js.map