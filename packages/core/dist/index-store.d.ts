import { InstalledSkillIndex, InstalledSkillRecord } from "./types";
export declare function readIndex(): Promise<InstalledSkillIndex>;
export declare function writeIndex(index: InstalledSkillIndex): Promise<void>;
export declare function upsertIndexRecord(key: string, value: InstalledSkillRecord): Promise<void>;
export declare function removeIndexRecord(key: string): Promise<void>;
