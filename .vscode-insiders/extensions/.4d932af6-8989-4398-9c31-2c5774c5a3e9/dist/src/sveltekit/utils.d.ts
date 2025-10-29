import type { GenerateConfig } from './generateFiles/types';
export declare function fileExists(file: string): Promise<boolean>;
export declare function findFile(searchPath: string, fileName: string): Promise<string | undefined>;
export declare function checkProjectKind(path: string): Promise<GenerateConfig['kind']>;
export declare function getVersionFromPackageJson(packageName: string): Promise<string | undefined>;
