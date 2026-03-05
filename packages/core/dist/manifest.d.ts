import { XixiSkillManifestV1 } from "./types";
export declare const manifestFilename = "SKILL.md";
export declare const openaiYamlFilename: string;
export declare function loadManifest(skillRoot: string): Promise<XixiSkillManifestV1>;
export declare function loadAndValidateManifest(skillRoot: string): Promise<XixiSkillManifestV1>;
export declare function isKebabCase(value: string): boolean;
