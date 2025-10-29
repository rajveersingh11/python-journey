import { ExtensionContext } from 'vscode';
export declare class TsPlugin {
    private enabled;
    constructor(context: ExtensionContext);
    static isEnabled(): boolean;
    private toggleTsPlugin;
    askToEnable(): Promise<void>;
}
