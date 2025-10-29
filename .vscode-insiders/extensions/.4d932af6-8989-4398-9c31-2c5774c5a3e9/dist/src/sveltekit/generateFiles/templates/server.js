"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = default_1;
const defaultScriptTemplate = `
/** @type {import('./$types').RequestHandler} */
export async function GET() {
    return new Response();
};
`;
const tsScriptTemplate = `
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async () => {
    return new Response();
};
`;
async function default_1(config) {
    const { withTs } = config.kind;
    let template = defaultScriptTemplate;
    if (withTs) {
        template = tsScriptTemplate;
    }
    return template.trim();
}
//# sourceMappingURL=server.js.map