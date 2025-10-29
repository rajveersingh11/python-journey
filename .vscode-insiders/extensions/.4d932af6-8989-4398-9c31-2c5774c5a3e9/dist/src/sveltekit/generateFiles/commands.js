"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addResourceCommandMap = void 0;
const types_1 = require("./types");
exports.addResourceCommandMap = new Map([
    [types_1.CommandType.PAGE, types_1.ResourceType.PAGE],
    [types_1.CommandType.PAGE_LOAD, types_1.ResourceType.PAGE_LOAD],
    [types_1.CommandType.PAGE_SERVER, types_1.ResourceType.PAGE_SERVER],
    [types_1.CommandType.LAYOUT, types_1.ResourceType.LAYOUT],
    [types_1.CommandType.LAYOUT_LOAD, types_1.ResourceType.LAYOUT_LOAD],
    [types_1.CommandType.LAYOUT_SERVER, types_1.ResourceType.LAYOUT_SERVER],
    [types_1.CommandType.SERVER, types_1.ResourceType.SERVER],
    [types_1.CommandType.ERROR, types_1.ResourceType.ERROR]
]);
//# sourceMappingURL=commands.js.map