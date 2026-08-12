import assert from "node:assert/strict";
import test from "node:test";

import { auditRegistryVersions, readStamp } from "./check-registry-version.mjs";

test("#246 本体：包已发到 0.39.0，产物还停在 0.37.0 → 阻断", () => {
  const problems = auditRegistryVersions("0.39.0", [
    { file: "apps/www/public/registry.json", version: "0.37.0" },
    { file: "apps/www/public/llms-props.json", version: "0.37.0" },
  ]);
  assert.equal(problems.length, 2);
  // 两个数都要点名，否则读的人不知道该跑什么、差了多远
  for (const problem of problems) {
    assert.match(problem, /0\.37\.0/);
    assert.match(problem, /0\.39\.0/);
  }
});

test("全部同版 → 放行", () => {
  assert.deepEqual(
    auditRegistryVersions("0.39.0", [
      { file: "a.json", version: "0.39.0" },
      { file: "b.txt", version: "0.39.0" },
    ]),
    [],
  );
});

test("只有一份漏了重生成，同样阻断（漂移是逐份发生的）", () => {
  const problems = auditRegistryVersions("0.39.0", [
    { file: "apps/www/public/registry.json", version: "0.39.0" },
    { file: "apps/www/public/llms.txt", version: "0.38.0" },
  ]);
  assert.equal(problems.length, 1);
  assert.match(problems[0], /llms\.txt/);
});

test("读不出版本戳算失败，不算通过 —— 产物缺失和格式变了都得有人看", () => {
  const problems = auditRegistryVersions("0.39.0", [{ file: "x.txt", version: null }]);
  assert.equal(problems.length, 1);
  assert.match(problems[0], /读不出版本戳/);
});

test("预发布号逐字比较，不做 semver 语义化归并", () => {
  assert.deepEqual(auditRegistryVersions("1.0.0-rc.1", [{ file: "a.json", version: "1.0.0-rc.1" }]), []);
  assert.equal(auditRegistryVersions("1.0.0", [{ file: "a.json", version: "1.0.0-rc.1" }]).length, 1);
});

test("JSON 产物取 .version；坏 JSON 不许静默当通过", () => {
  assert.equal(readStamp('{"version":"0.39.0"}', "json"), "0.39.0");
  assert.equal(readStamp("{ 半截", "json"), null);
  assert.equal(readStamp('{"name":"hulianui"}', "json"), null);
});

test("文本产物：llms.txt 的版本在末段、llms-full.txt 在中段，都得取到", () => {
  const llms = "# 瑚琏 Hulian (`@hulianui/ui`)\n\n> 颜值 + 好用的 React 设计系统 · 390 个组件 · v0.39.0\n";
  const full = "# 瑚琏 Hulian\n\n> 颜值 + 好用的 React 设计系统 · v0.39.0 · 351 个组件文档\n";
  assert.equal(readStamp(llms, "text"), "0.39.0");
  assert.equal(readStamp(full, "text"), "0.39.0");
});

test("文本产物只扫头部：正文里的 v1.2.3 不能被当成版本戳", () => {
  const body = ["# 标题", "", "> tagline · v0.39.0", "", "…", "", "升级到 v1.2.3 以后……"].join("\n");
  assert.equal(readStamp(body, "text"), "0.39.0");
});
