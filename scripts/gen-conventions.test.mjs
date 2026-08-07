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

// 这条锁的是「产物里出现的 matcher 种类都是 guard 真的会执行的那几种」——
// 新增一种 kind 而忘了在 check.mjs 里接上分派，规则会安静地一条都不命中（比没有规则更糟）。
// 所以加 kind 时必须同时改这里，改这里之前先确认 check.mjs 已经处理它。
test("conventions v2 的 matcher 种类都在 guard 里有对应分派", () => {
  const kinds = new Set(conventions.executableRules.map((rule) => rule.matcher.kind));
  assert.deepEqual(
    [...kinds].sort(),
    [
      "class-name-tokens",
      "css-var-prefix",
      "forbidden-call",
      "forbidden-import",
      "forbidden-jsx-prop",
    ],
  );
});
