import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const conventions = JSON.parse(
  readFileSync(join(ROOT, "packages/ui/conventions.json"), "utf8"),
);

test("conventions v2 将可执行规则与建议分开", () => {
  assert.equal(conventions.version, "2");
  assert.ok(conventions.executableRules.length > 0);
  assert.ok(
    conventions.executableRules.every(
      (rule) => rule.id && rule.severity && rule.matcher?.kind && rule.message,
    ),
  );
  assert.equal(
    new Set(conventions.executableRules.map((rule) => rule.id)).size,
    conventions.executableRules.length,
  );
  assert.ok(conventions.advisories.length >= 990);
  assert.ok(conventions.advisories.every((rule) => rule.id && rule.rule && rule.source));
});

test("conventions v2 覆盖当前四类稳定 matcher", () => {
  const kinds = new Set(conventions.executableRules.map((rule) => rule.matcher.kind));
  assert.deepEqual(
    [...kinds].sort(),
    [
      "css-var-prefix",
      "forbidden-call",
      "forbidden-import",
      "forbidden-jsx-prop",
    ],
  );
});
