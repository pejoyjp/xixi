"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDefaultConfig = getDefaultConfig;
exports.loadOrCreateConfig = loadOrCreateConfig;
exports.resolveDeptList = resolveDeptList;
exports.getResolvedInstallRoot = getResolvedInstallRoot;
const node_path_1 = __importDefault(require("node:path"));
const fs_extra_1 = __importDefault(require("fs-extra"));
const zod_1 = require("zod");
const constants_1 = require("./constants");
const errors_1 = require("./errors");
const paths_1 = require("./paths");
const configSchema = zod_1.z.object({
    skillsRepo: zod_1.z.object({
        url: zod_1.z.string().min(1),
        defaultBranch: zod_1.z.string().min(1).optional()
    }),
    installRoot: zod_1.z.string().min(1).optional(),
    tmpRoot: zod_1.z.string().min(1).optional(),
    depts: zod_1.z.array(zod_1.z.string().min(1)).optional()
});
function getDefaultConfig() {
    const xixiHome = (0, paths_1.getXixiHomeDir)();
    return {
        skillsRepo: {
            url: constants_1.DEFAULT_SKILLS_REPO_URL
        },
        installRoot: (0, paths_1.getDefaultInstallRoot)(),
        tmpRoot: (0, paths_1.getTmpRoot)({
            skillsRepo: { url: constants_1.DEFAULT_SKILLS_REPO_URL }
        }),
        depts: [...constants_1.DEFAULT_DEPTS]
    };
}
async function loadOrCreateConfig() {
    const configPath = (0, paths_1.getConfigPath)();
    const xixiHome = (0, paths_1.getXixiHomeDir)();
    await fs_extra_1.default.ensureDir(xixiHome);
    if (!(await fs_extra_1.default.pathExists(configPath))) {
        const defaults = getDefaultConfig();
        await fs_extra_1.default.writeJson(configPath, defaults, { spaces: 2 });
        return { config: defaults, path: configPath, created: true };
    }
    try {
        const loaded = await fs_extra_1.default.readJson(configPath);
        const parsed = configSchema.parse(loaded);
        const legacyInstallRoot = node_path_1.default.join((0, paths_1.getXixiHomeDir)(), "installed");
        const normalizedInstallRoot = !parsed.installRoot || parsed.installRoot === legacyInstallRoot
            ? (0, paths_1.getDefaultInstallRoot)()
            : parsed.installRoot;
        if (normalizedInstallRoot !== parsed.installRoot) {
            const migrated = {
                ...parsed,
                installRoot: normalizedInstallRoot
            };
            await fs_extra_1.default.writeJson(configPath, migrated, { spaces: 2 });
            return { config: migrated, path: configPath, created: false };
        }
        return { config: parsed, path: configPath, created: false };
    }
    catch (error) {
        throw new errors_1.XixiError("CONFIG_INVALID", `Failed to load config from ${configPath}`, `Fix ${constants_1.CONFIG_FILENAME} and rerun.`, error);
    }
}
function resolveDeptList(config) {
    const fromConfig = config.depts?.filter(Boolean) ?? [];
    if (fromConfig.length > 0) {
        return fromConfig;
    }
    return [...constants_1.DEFAULT_DEPTS];
}
function getResolvedInstallRoot(config) {
    return (0, paths_1.getInstallRoot)(config);
}
//# sourceMappingURL=config.js.map