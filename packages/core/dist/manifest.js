"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.openaiYamlFilename = exports.manifestFilename = void 0;
exports.loadManifest = loadManifest;
exports.loadAndValidateManifest = loadAndValidateManifest;
exports.isKebabCase = isKebabCase;
const node_path_1 = __importDefault(require("node:path"));
const fs_extra_1 = __importDefault(require("fs-extra"));
const js_yaml_1 = __importDefault(require("js-yaml"));
const zod_1 = require("zod");
const errors_1 = require("./errors");
const kebabCaseRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const skillFrontmatterSchema = zod_1.z.object({
    name: zod_1.z.string().regex(kebabCaseRegex, "name must be kebab-case"),
    description: zod_1.z.string().min(1)
});
const openaiYamlSchema = zod_1.z.object({
    interface: zod_1.z.object({
        display_name: zod_1.z.string().min(1),
        short_description: zod_1.z.string().min(1),
        default_prompt: zod_1.z.string().min(1)
    })
});
exports.manifestFilename = "SKILL.md";
exports.openaiYamlFilename = node_path_1.default.join("agents", "openai.yaml");
function extractFrontmatter(markdown) {
    const match = markdown.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/);
    if (!match?.[1]) {
        throw new errors_1.XixiError("MANIFEST_INVALID", `Invalid ${exports.manifestFilename}: missing YAML frontmatter.`, `Ensure ${exports.manifestFilename} starts with --- and includes name/description.`);
    }
    return match[1];
}
async function loadManifest(skillRoot) {
    const manifestPath = node_path_1.default.join(skillRoot, exports.manifestFilename);
    if (!(await fs_extra_1.default.pathExists(manifestPath))) {
        throw new errors_1.XixiError("MANIFEST_INVALID", `Missing manifest: ${manifestPath}`);
    }
    try {
        const markdown = await fs_extra_1.default.readFile(manifestPath, "utf8");
        const frontmatter = extractFrontmatter(markdown);
        const parsedYaml = js_yaml_1.default.load(frontmatter);
        return skillFrontmatterSchema.parse(parsedYaml);
    }
    catch (error) {
        throw new errors_1.XixiError("MANIFEST_INVALID", `Invalid manifest at ${manifestPath}`, `Check ${exports.manifestFilename} frontmatter schema.`, error);
    }
}
async function loadAndValidateManifest(skillRoot) {
    const manifest = await loadManifest(skillRoot);
    const openaiYamlPath = node_path_1.default.join(skillRoot, exports.openaiYamlFilename);
    if (!(await fs_extra_1.default.pathExists(openaiYamlPath))) {
        throw new errors_1.XixiError("MANIFEST_INVALID", `Missing metadata: ${openaiYamlPath}`, `Create ${exports.openaiYamlFilename} with interface fields.`);
    }
    try {
        const raw = await fs_extra_1.default.readFile(openaiYamlPath, "utf8");
        const parsedYaml = js_yaml_1.default.load(raw);
        openaiYamlSchema.parse(parsedYaml);
    }
    catch (error) {
        throw new errors_1.XixiError("MANIFEST_INVALID", `Invalid metadata at ${openaiYamlPath}`, `Check ${exports.openaiYamlFilename} schema.`, error);
    }
    return manifest;
}
function isKebabCase(value) {
    return kebabCaseRegex.test(value);
}
//# sourceMappingURL=manifest.js.map