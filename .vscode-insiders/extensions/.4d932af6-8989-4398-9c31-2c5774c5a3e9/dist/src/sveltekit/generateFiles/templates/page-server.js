"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = default_1;
const defaultScriptTemplate = `
/** @type {import('./$types').PageServerLoad} */
export async function load() {
    return {};
};
`;
const tsScriptTemplate = `
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
    return {};
};
`;
const tsSatisfiesScriptTemplate = `
import type { PageServerLoad } from './$types';

export const load = (async () => {
    return {};
}) satisfies PageServerLoad;
`;
async function default_1(config) {
    const { withTs, withSatisfies } = config.kind;
    let template = defaultScriptTemplate;
    if (withTs && withSatisfies) {
        template = tsSatisfiesScriptTemplate;
    }
    else if (withTs && !withSatisfies) {
        template = tsScriptTemplate;
    }
    return template.trim();
}
//# sourceMappingURL=page-server.js.map