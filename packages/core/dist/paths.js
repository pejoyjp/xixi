"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getXixiHomeDir = getXixiHomeDir;
exports.getConfigPath = getConfigPath;
exports.getIndexPath = getIndexPath;
exports.getDefaultInstallRoot = getDefaultInstallRoot;
exports.getInstallRoot = getInstallRoot;
exports.getTmpRoot = getTmpRoot;
const node_os_1 = __importDefault(require("node:os"));
const node_path_1 = __importDefault(require("node:path"));
const constants_1 = require("./constants");
function getXixiHomeDir() {
    return node_path_1.default.join(node_os_1.default.homedir(), constants_1.XIXI_DIRNAME);
}
function getConfigPath() {
    return node_path_1.default.join(getXixiHomeDir(), constants_1.CONFIG_FILENAME);
}
function getIndexPath() {
    return node_path_1.default.join(getXixiHomeDir(), constants_1.INDEX_FILENAME);
}
function getDefaultInstallRoot() {
    return node_path_1.default.join(node_os_1.default.homedir(), ".codex", "skills");
}
function getInstallRoot(config) {
    return config.installRoot ?? getDefaultInstallRoot();
}
function getTmpRoot(config) {
    return config.tmpRoot ?? node_os_1.default.tmpdir();
}
//# sourceMappingURL=paths.js.map