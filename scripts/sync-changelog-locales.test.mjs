import assert from "node:assert/strict";
import test from "node:test";

import { syncChangelogLocales } from "./sync-changelog-locales.mjs";

const chinese = `# @hulianui/ui

## 1.2.0

### Minor Changes

- abcdef1: 新增紧凑卡片。

  依赖隐式字号的调用方需要显式声明字号。

  <!-- changelog-en:start -->
  Adds compact cards.

  Consumers that relied on the implicit font size must declare it explicitly.
  <!-- changelog-en:end -->

### Patch Changes

- 123abcd: 修复选择器。

  <!-- changelog-en:start -->
  Fixes the selector.
  <!-- changelog-en:end -->

## 1.1.0

### Patch Changes

- 987fedc: 旧修复
`;

const english = `# @hulianui/ui

## 1.1.0

### Patch Changes

- 987fedc: Existing fix
`;

test("splits each newly missing release entry into locale-only changelogs", () => {
  const result = syncChangelogLocales(chinese, english, "@hulianui/ui");

  assert.deepEqual(result.syncedVersions, ["1.2.0"]);
  assert.equal(
    result.chinese,
    `# @hulianui/ui

## 1.2.0

### Minor Changes

- abcdef1: 新增紧凑卡片。

  依赖隐式字号的调用方需要显式声明字号。

### Patch Changes

- 123abcd: 修复选择器。

## 1.1.0

### Patch Changes

- 987fedc: 旧修复
`,
  );
  assert.equal(
    result.english,
    `# @hulianui/ui

## 1.2.0

### Minor Changes

- abcdef1: Adds compact cards.

  Consumers that relied on the implicit font size must declare it explicitly.

### Patch Changes

- 123abcd: Fixes the selector.

## 1.1.0

### Patch Changes

- 987fedc: Existing fix
`,
  );

  assert.doesNotMatch(result.chinese, /Adds compact cards|changelog-en/);
  assert.doesNotMatch(result.english, /新增紧凑卡片|changelog-en/);
});

test("preserves version order, bump headings, SHA identities, multiline Markdown, and history", () => {
  const result = syncChangelogLocales(chinese, english, "@hulianui/ui");

  assert.match(
    result.english,
    /## 1\.2\.0[\s\S]*### Minor Changes[\s\S]*- abcdef1:[\s\S]*### Patch Changes[\s\S]*- 123abcd:[\s\S]*## 1\.1\.0/,
  );
  assert.ok(result.english.endsWith("- 987fedc: Existing fix\n"));
  assert.ok(result.chinese.endsWith("- 987fedc: 旧修复\n"));
});

test("is byte-for-byte idempotent after the missing release has been synchronized", () => {
  const once = syncChangelogLocales(chinese, english, "@hulianui/ui");
  const twice = syncChangelogLocales(once.chinese, once.english, "@hulianui/ui");

  assert.deepEqual(twice.syncedVersions, []);
  assert.equal(twice.chinese, once.chinese);
  assert.equal(twice.english, once.english);
});

test("fails clearly before changing either document when a missing release entry has no English marker", () => {
  const missingMarker = chinese.replace(
    /\n  <!-- changelog-en:start -->\n  Fixes the selector\.\n  <!-- changelog-en:end -->/,
    "",
  );

  assert.throws(
    () => syncChangelogLocales(missingMarker, english, "@hulianui/ui"),
    /@hulianui\/ui 1\.2\.0 entry 123abcd is missing .*changelog-en:start/,
  );
});

test("rejects malformed or duplicate markers instead of silently publishing mixed locales", () => {
  const unterminated = chinese.replace("  <!-- changelog-en:end -->", "");
  assert.throws(
    () => syncChangelogLocales(unterminated, english, "@hulianui/ui"),
    /@hulianui\/ui 1\.2\.0 entry abcdef1 has malformed English changelog markers/,
  );
});

test("splits the two pending 0.57.0 Changesets entries even before Git adds release SHAs", () => {
  const generated = `# @hulianui/ui

## 0.57.0

### Minor Changes

- 新增消费方布局能力。

  <!-- changelog-en:start -->
  Adds consumer layout capabilities.
  <!-- changelog-en:end -->

### Patch Changes

- 修复 AnimatedShinyText 布局。

  <!-- changelog-en:start -->
  Fixes AnimatedShinyText layout.
  <!-- changelog-en:end -->

## 0.56.1

### Patch Changes

- e3905bf: 旧修复
`;
  const existingEnglish = `# @hulianui/ui

## 0.56.1

### Patch Changes

- e3905bf: Existing fix
`;

  const result = syncChangelogLocales(generated, existingEnglish, "@hulianui/ui");
  assert.match(
    result.chinese,
    /### Minor Changes[\s\S]*- 新增消费方布局能力。 <!-- parity-id: hulianui-ui-0.57.0-1 -->/,
  );
  assert.match(
    result.chinese,
    /### Patch Changes[\s\S]*- 修复 AnimatedShinyText 布局。 <!-- parity-id: hulianui-ui-0.57.0-2 -->/,
  );
  assert.match(
    result.english,
    /### Minor Changes[\s\S]*- Adds consumer layout capabilities\. <!-- parity-id: hulianui-ui-0.57.0-1 -->/,
  );
  assert.match(
    result.english,
    /### Patch Changes[\s\S]*- Fixes AnimatedShinyText layout\. <!-- parity-id: hulianui-ui-0.57.0-2 -->/,
  );
});
