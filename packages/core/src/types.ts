export type XixiSkillManifestV1 = {
  schema_version: 1;
  name: string;
  dept: string;
  description: string;
  entry: string;
  version?: string;
};

export type XixiConfig = {
  skillsRepo: {
    url: string;
    defaultBranch?: string;
  };
  installRoot?: string;
  tmpRoot?: string;
  depts?: string[];
};

export type InstalledSkillRecord = {
  dept: string;
  name: string;
  description: string;
  installedPath: string;
  source: {
    repo: string;
    ref: string;
  };
};

export type InstalledSkillIndex = Record<string, InstalledSkillRecord>;

