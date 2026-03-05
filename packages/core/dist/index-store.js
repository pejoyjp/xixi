"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.readIndex = readIndex;
exports.writeIndex = writeIndex;
exports.upsertIndexRecord = upsertIndexRecord;
exports.removeIndexRecord = removeIndexRecord;
const fs_extra_1 = __importDefault(require("fs-extra"));
const errors_1 = require("./errors");
const paths_1 = require("./paths");
async function readIndex() {
    const indexPath = (0, paths_1.getIndexPath)();
    if (!(await fs_extra_1.default.pathExists(indexPath))) {
        return {};
    }
    try {
        const loaded = await fs_extra_1.default.readJson(indexPath);
        return loaded;
    }
    catch (error) {
        throw new errors_1.XixiError("INDEX_IO_FAILED", `Failed to read index: ${indexPath}`, "Fix invalid JSON and rerun.", error);
    }
}
async function writeIndex(index) {
    const indexPath = (0, paths_1.getIndexPath)();
    try {
        await fs_extra_1.default.ensureFile(indexPath);
        await fs_extra_1.default.writeJson(indexPath, index, { spaces: 2 });
    }
    catch (error) {
        throw new errors_1.XixiError("INDEX_IO_FAILED", `Failed to write index: ${indexPath}`, undefined, error);
    }
}
async function upsertIndexRecord(key, value) {
    const index = await readIndex();
    index[key] = value;
    await writeIndex(index);
}
async function removeIndexRecord(key) {
    const index = await readIndex();
    delete index[key];
    await writeIndex(index);
}
//# sourceMappingURL=index-store.js.map