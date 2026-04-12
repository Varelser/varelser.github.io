import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const failOnIssues = process.argv.includes("--fail-on-issues");
const largeFileLineThreshold = 450;
const implExtensions = new Set([".ts", ".tsx"]);
const implSkipDirs = new Set([".git", "node_modules", "dist", "coverage", "exports", "tmp"]);
const tempDirPatterns = [/^\.tmp_/u, /^out(?:$|_)/u, /^tmp$/u];

function toPosix(relativePath) { return relativePath.split(path.sep).join("/"); }
function readText(filePath) { return fs.readFileSync(filePath, "utf8"); }
function walk(dir, fileList = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (implSkipDirs.has(entry.name)) continue;
      walk(fullPath, fileList);
      continue;
    }
    fileList.push(fullPath);
  }
  return fileList;
}
function countLines(text) { return text.length === 0 ? 0 : text.split(/\r?\n/u).length; }
function findRootTempDirs() {
  return fs.readdirSync(root, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && tempDirPatterns.some((pattern) => pattern.test(entry.name)))
    .map((entry) => entry.name)
    .sort();
}
function findLargeImplementationFiles() {
  const files = walk(root)
    .filter((file) => implExtensions.has(path.extname(file)))
    .filter((file) => !toPosix(path.relative(root, file)).startsWith("scripts/"));
  const largeFiles = [];
  for (const file of files) {
    const relativePath = toPosix(path.relative(root, file));
    const lineCount = countLines(readText(file));
    if (lineCount > largeFileLineThreshold) largeFiles.push({ path: relativePath, lineCount });
  }
  return largeFiles.sort((a, b) => b.lineCount - a.lineCount || a.path.localeCompare(b.path));
}
function extractFirstInteger(text, regex) {
  const match = text.match(regex);
  return match ? Number.parseInt(match[1], 10) : null;
}
const currentStatus = readText(path.join(root, "CURRENT_STATUS.md"));
const refactorPlan = readText(path.join(root, "REFACTOR_PLAN_LARGE_FILES.md"));
const tempDirs = findRootTempDirs();
const largeImplementationFiles = findLargeImplementationFiles();
const expectedLargeCoreCount = largeImplementationFiles.length;
const statusClaims = {
  currentStatusPath: "CURRENT_STATUS.md",
  refactorPlanPath: "REFACTOR_PLAN_LARGE_FILES.md",
  currentStatusLargeCoreCount: extractFirstInteger(currentStatus, /450行超の実装コアは \*\*(\d+)本\*\*/u),
  currentStatusLargeCoreCountAlt: extractFirstInteger(currentStatus, /450行以上の実装コアも \*\*(\d+)本\*\*/u),
  refactorPlanLargeCoreCount: extractFirstInteger(refactorPlan, /450行超の実装コア: \*\*(\d+)本\*\*/u),
  refactorPlanLargeCoreCountAlt: extractFirstInteger(refactorPlan, /450行以上の実装コア: \*\*(\d+)本\*\*/u),
};
const warnings = [];
const issues = [];
if (tempDirs.length > 0) warnings.push({
  type: "root-temp-dirs-present",
  count: tempDirs.length,
  entries: tempDirs,
  note: "Ignored ephemeral directories are present locally. Clean them before packaging a release artifact.",
});
for (const [label, value] of [["CURRENT_STATUS.md 450行超", statusClaims.currentStatusLargeCoreCount],["CURRENT_STATUS.md 450行以上", statusClaims.currentStatusLargeCoreCountAlt],["REFACTOR_PLAN_LARGE_FILES.md 450行超", statusClaims.refactorPlanLargeCoreCount],["REFACTOR_PLAN_LARGE_FILES.md 450行以上", statusClaims.refactorPlanLargeCoreCountAlt]]) {
  if (value !== null && value !== expectedLargeCoreCount) issues.push({ type: "large-core-count-mismatch", label, expected: expectedLargeCoreCount, actual: value });
}
const report = { ok: issues.length === 0, generatedAt: new Date().toISOString(), thresholds: { largeImplementationFileLines: largeFileLineThreshold }, rootTempDirCount: tempDirs.length, rootTempDirs: tempDirs, largeImplementationFileCount: largeImplementationFiles.length, largeImplementationFiles, statusClaims, warnings, issues };
console.log(JSON.stringify(report, null, 2));
if (failOnIssues && issues.length > 0) process.exit(1);
