import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";

import { renderUiVersionModule, syncUiVersion } from "./sync-ui-version.mjs";

test("renders a deterministic TypeScript module from package JSON", () => {
  assert.equal(
    renderUiVersionModule('{"name":"@hulianui/ui","version":"1.2.3"}'),
    '// 自动生成（next.config.mjs 构建期写入），请勿手改。源：packages/ui/package.json\nexport const UI_VERSION = "1.2.3";\n',
  );
});

test("rejects missing or non-string package versions", () => {
  assert.throws(() => renderUiVersionModule('{"name":"@hulianui/ui"}'), /valid string version/);
  assert.throws(() => renderUiVersionModule('{"version":123}'), /valid string version/);
});

test("the shared synchronizer writes the CLI and Next.js artifact deterministically", () => {
  const root = mkdtempSync(join(tmpdir(), "hulian-ui-version-"));
  try {
    const packageJsonPath = join(root, "package.json");
    const outputPath = join(root, "ui-version.ts");
    writeFileSync(packageJsonPath, '{"version":"2.0.0-rc.1"}\n');

    const first = syncUiVersion({ packageJsonPath, outputPath });
    const firstBytes = readFileSync(outputPath, "utf8");
    const second = syncUiVersion({ packageJsonPath, outputPath });

    assert.equal(first.version, "2.0.0-rc.1");
    assert.equal(first.content, firstBytes);
    assert.deepEqual(second, first);
    assert.equal(readFileSync(outputPath, "utf8"), firstBytes);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});
