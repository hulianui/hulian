import assert from "node:assert/strict";
import test from "node:test";
import { assertLocaleParity, parseChangelog } from "./gen-changelog.mjs";

const zh = `# @hulianui/ui

## 1.1.0
### Minor Changes
- abcdef1: 新功能

## 1.0.0
### Patch Changes
- abcdef0: 修复
`;

const en = `# @hulianui/ui

## 1.1.0
### Minor Changes
- abcdef1: New feature

## 1.0.0
### Patch Changes
- abcdef0: Fix
`;

test("parseChangelog preserves version, bump, sha, and body", () => {
  assert.deepEqual(parseChangelog(en), [
    {
      version: "1.1.0",
      entries: [{ sha: "abcdef1", bump: "minor", breaking: false, body: "New feature" }],
    },
    {
      version: "1.0.0",
      entries: [{ sha: "abcdef0", bump: "patch", breaking: false, body: "Fix" }],
    },
  ]);
});

test("English changelog fails when a Chinese version is missing", () => {
  const missingVersion = en.replace(/\n## 1\.0\.0[\s\S]*$/, "\n");
  assert.throws(
    () => assertLocaleParity("@hulianui/ui", parseChangelog(zh), parseChangelog(missingVersion)),
    /missing English versions: 1\.0\.0/,
  );
});

test("English changelog fails when entry counts differ", () => {
  const missingEntry = en.replace("- abcdef1: New feature", "");
  assert.throws(
    () => assertLocaleParity("@hulianui/ui", parseChangelog(zh), parseChangelog(missingEntry)),
    /1\.1\.0 entry count differs: zh-CN=1, en=0/,
  );
});

test("matching version and entry sets pass", () => {
  assert.doesNotThrow(() =>
    assertLocaleParity("@hulianui/ui", parseChangelog(zh), parseChangelog(en)),
  );
});

test("English changelog fails when matching versions are reordered", () => {
  const reordered = `# @hulianui/ui\n\n## 1.0.0\n### Patch Changes\n- abcdef0: Fix\n\n## 1.1.0\n### Minor Changes\n- abcdef1: New feature\n`;
  assert.throws(
    () => assertLocaleParity("@hulianui/ui", parseChangelog(zh), parseChangelog(reordered)),
    /version order differs/,
  );
});

test("English changelog fails when a breaking marker is removed", () => {
  const breakingZh = `# p\n\n## 1.0.0\n### Minor Changes\n- abcdef1: **破坏性**：移除旧 API\n`;
  const notBreakingEn = `# p\n\n## 1.0.0\n### Minor Changes\n- abcdef1: Remove the old API\n`;
  assert.throws(
    () => assertLocaleParity("p", parseChangelog(breakingZh), parseChangelog(notBreakingEn)),
    /breaking marker differs/,
  );
});

test("English changelog fails when a Markdown link target changes", () => {
  const linkedZh = `# p\n\n## 1.0.0\n### Patch Changes\n- abcdef1: 参见 [迁移指南](https://example.com/migrate)\n`;
  const linkedEn = `# p\n\n## 1.0.0\n### Patch Changes\n- abcdef1: See the [migration guide](https://wrong.example/migrate)\n`;
  assert.throws(
    () => assertLocaleParity("p", parseChangelog(linkedZh), parseChangelog(linkedEn)),
    /link targets differ/,
  );
});

const legacyZh = `# p\n\n## 0.1.0\n### Patch Changes\n- 修复甲 <!-- parity-id: legacy-a -->\n- 修复乙 <!-- parity-id: legacy-b -->\n`;
const legacyEn = `# p\n\n## 0.1.0\n### Patch Changes\n- Fix A <!-- parity-id: legacy-a -->\n- Fix B <!-- parity-id: legacy-b -->\n`;

test("no-SHA legacy entries use stable parity ids that are omitted from rendered bodies", () => {
  const parsed = parseChangelog(legacyEn);
  assert.deepEqual(parsed[0].entries.map((entry) => entry.parityId), ["legacy-a", "legacy-b"]);
  assert.deepEqual(parsed[0].entries.map((entry) => entry.body), ["Fix A", "Fix B"]);
  assert.doesNotThrow(() => assertLocaleParity("p", parseChangelog(legacyZh), parsed));
});

test("English changelog fails when a no-SHA legacy entry is replaced without its stable id", () => {
  const replaced = legacyEn.replace("Fix A <!-- parity-id: legacy-a -->", "Different replacement");
  assert.throws(
    () => assertLocaleParity("p", parseChangelog(legacyZh), parseChangelog(replaced)),
    /missing parity-id|identity differs/,
  );
});

test("English changelog fails when no-SHA legacy entries are reordered", () => {
  const reordered = legacyEn.replace(
    "- Fix A <!-- parity-id: legacy-a -->\n- Fix B <!-- parity-id: legacy-b -->",
    "- Fix B <!-- parity-id: legacy-b -->\n- Fix A <!-- parity-id: legacy-a -->",
  );
  assert.throws(
    () => assertLocaleParity("p", parseChangelog(legacyZh), parseChangelog(reordered)),
    /identity differs/,
  );
});
