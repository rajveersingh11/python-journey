"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResourceType = exports.FileType = exports.CommandType = void 0;
var CommandType;
(function (CommandType) {
    CommandType["PAGE"] = "svelte.kit.generatePage";
    CommandType["PAGE_LOAD"] = "svelte.kit.generatePageLoad";
    CommandType["PAGE_SERVER"] = "svelte.kit.generatePageServerLoad";
    CommandType["LAYOUT"] = "svelte.kit.generateLayout";
    CommandType["LAYOUT_LOAD"] = "svelte.kit.generateLayoutLoad";
    CommandType["LAYOUT_SERVER"] = "svelte.kit.generateLayoutServerLoad";
    CommandType["SERVER"] = "svelte.kit.generateServer";
    CommandType["ERROR"] = "svelte.kit.generateError";
    CommandType["MULTIPLE"] = "svelte.kit.generateMultipleFiles";
})(CommandType || (exports.CommandType = CommandType = {}));
var FileType;
(function (FileType) {
    FileType[FileType["SCRIPT"] = 0] = "SCRIPT";
    FileType[FileType["PAGE"] = 1] = "PAGE";
})(FileType || (exports.FileType = FileType = {}));
var ResourceType;
(function (ResourceType) {
    ResourceType[ResourceType["PAGE"] = 0] = "PAGE";
    ResourceType[ResourceType["PAGE_LOAD"] = 1] = "PAGE_LOAD";
    ResourceType[ResourceType["PAGE_SERVER"] = 2] = "PAGE_SERVER";
    ResourceType[ResourceType["LAYOUT"] = 3] = "LAYOUT";
    ResourceType[ResourceType["LAYOUT_LOAD"] = 4] = "LAYOUT_LOAD";
    ResourceType[ResourceType["LAYOUT_SERVER"] = 5] = "LAYOUT_SERVER";
    ResourceType[ResourceType["SERVER"] = 6] = "SERVER";
    ResourceType[ResourceType["ERROR"] = 7] = "ERROR";
})(ResourceType || (exports.ResourceType = ResourceType = {}));
//# sourceMappingURL=types.js.map