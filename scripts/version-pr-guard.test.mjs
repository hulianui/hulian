import assert from "node:assert/strict";
import test from "node:test";
import { findViolations, packageJsonOnlyBumpsVersion, parseNameStatus } from "./version-pr-guard.mjs";

const pkg = (fields) => JSON.stringify({ name: "@hulianui/ui", version: "0.75.0", ...fields }, null, 2);
const readPkg = (after) => () => ({ before: pkg({}), after });

test("真实版本 PR 的文件形状放行（取自 #396）", () => {
  const changes = parseNameStatus(
    [
      "D\t.changeset/snippet-wrap.md",
      "M\tapps/www/lib/changelog.en.json",
      "M\tapps/www/lib/changelog.json",
      "M\tapps/www/lib/ui-version.ts",
      "M\tapps/www/public/llms-full.txt",
      "M\tapps/www/public/llms-props.json",
      "M\tapps/www/public/llms.txt",
      "M\tapps/www/public/registry.json",
      "M\tpackages/ui/CHANGELOG.en.md",
      "M\tpackages/ui/CHANGELOG.md",
      "M\tpackages/ui/package.json",
    ].join("\n"),
  );
  assert.deepEqual(findViolations(changes, readPkg(pkg({ version: "0.76.0" }))), []);
});

test("夹带代码改动被拦下", () => {
  const changes = parseNameStatus("M\tpackages/ui/src/button/button.tsx\nM\tpackages/ui/CHANGELOG.md");
  const violations = findViolations(changes, readPkg(pkg({})));
  assert.equal(violations.length, 1);
  assert.match(violations[0], /button\.tsx/);
});

test("package.json 除 version 外的改动被拦下", () => {
  const changes = parseNameStatus("M\tpackages/ui/package.json");
  const after = pkg({ version: "0.76.0", dependencies: { leftpad: "^1.0.0" } });
  assert.match(findViolations(changes, readPkg(after))[0], /除 "version" 外/);
});

test("新增 changeset、新增文件、改根 package.json 都不放行", () => {
  const changes = parseNameStatus(
    ["A\t.changeset/sneaky.md", "A\tpackages/ui/CHANGELOG.md", "M\tpackage.json"].join("\n"),
  );
  assert.equal(findViolations(changes, readPkg(pkg({}))).length, 3);
});

test("重命名行取新路径", () => {
  assert.deepEqual(parseNameStatus("R100\told.ts\tnew.ts"), [{ status: "R", path: "new.ts" }]);
});

test("packageJsonOnlyBumpsVersion 不受字段顺序影响", () => {
  const before = JSON.stringify({ name: "a", version: "1.0.0", private: false });
  const after = JSON.stringify({ private: false, version: "1.1.0", name: "a" });
  assert.equal(packageJsonOnlyBumpsVersion(before, after), true);
});
