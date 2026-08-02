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
