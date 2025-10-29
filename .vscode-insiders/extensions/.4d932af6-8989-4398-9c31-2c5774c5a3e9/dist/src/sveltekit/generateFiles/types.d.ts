export declare enum CommandType {
    PAGE = "svelte.kit.generatePage",
    PAGE_LOAD = "svelte.kit.generatePageLoad",
    PAGE_SERVER = "svelte.kit.generatePageServerLoad",
    LAYOUT = "svelte.kit.generateLayout",
    LAYOUT_LOAD = "svelte.kit.generateLayoutLoad",
    LAYOUT_SERVER = "svelte.kit.generateLayoutServerLoad",
    SERVER = "svelte.kit.generateServer",
    ERROR = "svelte.kit.generateError",
    MULTIPLE = "svelte.kit.generateMultipleFiles"
}
export declare enum FileType {
    SCRIPT = 0,
    PAGE = 1
}
export declare enum ResourceType {
    PAGE = 0,
    PAGE_LOAD = 1,
    PAGE_SERVER = 2,
    LAYOUT = 3,
    LAYOUT_LOAD = 4,
    LAYOUT_SERVER = 5,
    SERVER = 6,
    ERROR = 7
}
export type Resource = {
    type: FileType;
    filename: string;
    generate: (config: GenerateConfig) => Promise<string>;
};
export interface GenerateConfig {
    path: string;
    kind: {
        withTs: boolean;
        withSatisfies: boolean;
        withRunes: boolean;
        withProps: boolean;
    };
    pageExtension: string;
    scriptExtension: string;
    resources: Resource[];
}
