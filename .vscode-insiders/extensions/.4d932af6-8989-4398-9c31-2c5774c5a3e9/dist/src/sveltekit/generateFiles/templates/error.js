"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = default_1;
const defaultScriptTemplate = `
<script>
    import { page } from '$app/stores';
</script>

<h1>{$page.status}: {$page.error.message}</h1>
`;
const tsScriptTemplate = `
<script lang="ts">
    import { page } from '$app/stores';
</script>

<h1>{$page.status}: {$page.error?.message}</h1>
`;
async function default_1(config) {
    const { withTs } = config.kind;
    let template = defaultScriptTemplate;
    if (withTs) {
        template = tsScriptTemplate;
    }
    return template.trim();
}
//# sourceMappingURL=error.js.map