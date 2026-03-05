export type XixiSkillManifestV1 = {
  name: string;
  description: string;
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
  name: string;
  description: string;
  installedPath: string;
  source: {
    repo: string;
    ref: string;
  };
};

export type InstalledSkillIndex = Record<string, InstalledSkillRecord>;
