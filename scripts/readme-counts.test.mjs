import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";

// 口径与同步逻辑都在 readme-counts.mjs —— 测试只负责断言，不再自带一份正则，
// 否则「校验用的口径」和「修复用的口径」会各自漂移，那正是这条门禁想防的病。
import {
  README_FILES,
  ROOT,
  componentCount,
  componentNumbersIn,
  demoCount,
  demoNumbersIn,
} from "./readme-counts.mjs";

for (const file of README_FILES) {
  const readme = readFileSync(join(ROOT, file), "utf8");

  test(`${file} 的组件数与 packages/ui 实际组件数一致`, () => {
    const claimed = componentNumbersIn(readme);
    assert.ok(claimed.length > 0, `${file} 里找不到「N 个组件 / N components」，别把口径写没了`);
    for (const n of claimed) {
      assert.equal(
        n,
        componentCount(),
        `${file} 写了 ${n} 个组件，实际 ${componentCount()} 个 —— 跑 \`pnpm readme:sync\` 同步（GitHub About 也要跟着改）`,
      );
    }
  });

  test(`${file} 的 demo 数与 demos.ts 一致`, () => {
    const claimed = demoNumbersIn(readme);
    assert.ok(claimed.length > 0, `${file} 里找不到 demo 数`);
    for (const n of claimed) {
      assert.equal(
        n,
        demoCount(),
        `${file} 写了 ${n} 个 demo，实际 ${demoCount()} 个 —— 跑 \`pnpm readme:sync\` 同步`,
      );
    }
  });
}

test("README 不再写死会随每次提交漂移的测试用例数", () => {
  // 用例数每加一条测试就变，写进 README 等于制造一个必然滞后的数字（曾写 2705 / 367，
  // 实际已到 3848 / 415）。这里只禁「N 用例 / N tests」这种精确计数，不禁其它描述。
  for (const file of README_FILES) {
    const readme = readFileSync(join(ROOT, file), "utf8");
    assert.equal(
      /\d{3,}\s*(?:用例|tests\b)/.test(readme),
      false,
      `${file} 里写死了测试用例数——改成描述性说法（如「vitest 双 project」），别再制造滞后数字`,
    );
  }
});
