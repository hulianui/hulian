import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

// README（中/英）与 GitHub About 里的「N 个组件 / N 个 demo」是手写的，没有门禁就必然滞后：
// 349 这个数字从 0.15 一直挂到 0.20（真实值 376），demo 数漏掉了第 19 个（hanship）。
// 这里把它们钉到 SSOT 上 —— 加组件 / 加 demo 时忘了同步 README，CI 立刻红。
//
// 口径（两个都要写清楚，否则下次又会各写各的）：
//   组件数 = packages/ui/src/<slug>/<slug>.md 的个数 —— 即 npm 包里能 import 的公开组件，
//            与 llms.txt / registry.json 的 ui 计数同源。**不是**文档站画廊数（画廊少 3 个：
//            access / config / theme 是基础设施件，有意不进画廊）。
//   demo 数 = apps/www/app/demos/lib/demos.ts 里的 slug 条目数（demos 索引页的 SSOT）。
const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

function componentCount() {
  const src = join(ROOT, "packages/ui/src");
  return readdirSync(src, { withFileTypes: true }).filter(
    (d) => d.isDirectory() && existsSync(join(src, d.name, `${d.name}.md`)),
  ).length;
}

function demoCount() {
  const source = readFileSync(join(ROOT, "apps/www/app/demos/lib/demos.ts"), "utf8");
  return [...source.matchAll(/slug: "[a-z0-9-]+"/g)].length;
}

/** README 里所有形如「376 个组件」/「376 components」的数字。 */
function componentNumbersIn(readme) {
  // \b 只对英文分支有意义：中文「个组件」后面常跟 `<`/`，`，两个非单词字符之间没有词边界
  return [...readme.matchAll(/(\d+)\s*(?:个组件|components\b)/g)].map((m) => Number(m[1]));
}

/** README 里所有形如「19 个内置 demo」/「19 个真实 demo」/「19 real demos」的数字。 */
function demoNumbersIn(readme) {
  return [...readme.matchAll(/(\d+)\s*(?:个(?:内置|真实)\s*demo|real demos)/gi)].map((m) =>
    Number(m[1]),
  );
}

for (const file of ["README.md", "README.en.md"]) {
  const readme = readFileSync(join(ROOT, file), "utf8");

  test(`${file} 的组件数与 packages/ui 实际组件数一致`, () => {
    const claimed = componentNumbersIn(readme);
    assert.ok(claimed.length > 0, `${file} 里找不到「N 个组件 / N components」，别把口径写没了`);
    for (const n of claimed) {
      assert.equal(
        n,
        componentCount(),
        `${file} 写了 ${n} 个组件，实际 ${componentCount()} 个（改完组件记得同步 README 与 GitHub About）`,
      );
    }
  });

  test(`${file} 的 demo 数与 demos.ts 一致`, () => {
    const claimed = demoNumbersIn(readme);
    assert.ok(claimed.length > 0, `${file} 里找不到 demo 数`);
    for (const n of claimed) {
      assert.equal(n, demoCount(), `${file} 写了 ${n} 个 demo，实际 ${demoCount()} 个`);
    }
  });
}

test("README 不再写死会随每次提交漂移的测试用例数", () => {
  // 用例数每加一条测试就变，写进 README 等于制造一个必然滞后的数字（曾写 2705 / 367，
  // 实际已到 3848 / 415）。这里只禁「N 用例 / N tests」这种精确计数，不禁其它描述。
  for (const file of ["README.md", "README.en.md"]) {
    const readme = readFileSync(join(ROOT, file), "utf8");
    assert.equal(
      /\d{3,}\s*(?:用例|tests\b)/.test(readme),
      false,
      `${file} 里写死了测试用例数——改成描述性说法（如「vitest 双 project」），别再制造滞后数字`,
    );
  }
});
