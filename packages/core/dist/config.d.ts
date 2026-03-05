import { XixiConfig } from "./types";
export declare function getDefaultConfig(): XixiConfig;
export declare function loadOrCreateConfig(): Promise<{
    config: XixiConfig;
    path: string;
    created: boolean;
}>;
export declare function resolveDeptList(config: XixiConfig): string[];
export declare function getResolvedInstallRoot(config: XixiConfig): string;
