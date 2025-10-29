"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.atob = atob;
exports.btoa = btoa;
function atob(encoded) {
    const buffer = Buffer.from(encoded, 'base64');
    return buffer.toString('utf8');
}
function btoa(decoded) {
    const buffer = Buffer.from(decoded, 'utf8');
    return buffer.toString('base64');
}
//# sourceMappingURL=utils.js.map