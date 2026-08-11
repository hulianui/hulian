import assert from "node:assert/strict";
import test from "node:test";

import { auditFamily, auditLockfile } from "./check-dep-family.mjs";

const FAMILY = { prefix: "@tiptap/", why: "peer 钉的是精确版本" };

/** 0.29.0 的形态：5 个成员，全族 `^3.29.2`。 */
const BASE_029 = {
  specifier: "^3.29.2",
  members: [
    "@tiptap/extension-link",
    "@tiptap/extension-placeholder",
    "@tiptap/pm",
    "@tiptap/react",
    "@tiptap/starter-kit",
  ],
};

function members(specifier, names) {
  return Object.fromEntries(names.map((name) => [name, specifier]));
}

const NINE = [
  ...BASE_029.members,
  "@tiptap/extension-image",
  "@tiptap/extension-table",
  "@tiptap/extension-text-align",
  "@tiptap/extension-text-style",
];

test("#207 本体：新增成员却沿用旧下界 —— 这正是 0.30.0 发出去的形态", () => {
  const problems = auditFamily(FAMILY, members("^3.29.2", NINE), BASE_029);
  assert.equal(problems.length, 1);
  assert.match(problems[0], /新增了成员/);
  // 四个新成员都要点名，否则读的人不知道该抬谁
  for (const added of ["image", "table", "text-align", "text-style"]) {
    assert.match(problems[0], new RegExp(added));
  }
});

test("#207 修法：新增成员的同时把全族一起抬高 → 放行", () => {
  assert.deepEqual(auditFamily(FAMILY, members("^3.30.0", NINE), BASE_029), []);
});

test("成员没变时不要求抬版 —— 上游发新版不该让门禁假红", () => {
  assert.deepEqual(auditFamily(FAMILY, members("^3.29.2", BASE_029.members), BASE_029), []);
});

// issue #207 建议 1 的写法。实测它会让**全新解析**当场裂：@tiptap/starter-kit 自己的
// dependencies 是 `^3.x`，会把 core / extensions 拉到家族最新版，与被钉死的扩展冲突。
// 这里只钉「混着写必红」这一层 —— 半途改一半是最常见的落地形态。
test("全族 specifier 混着写 → 红，并把每个成员的现值列出来", () => {
  const mixed = { ...members("^3.29.2", BASE_029.members), "@tiptap/extension-image": "3.29.2" };
  const problems = auditFamily(FAMILY, mixed, BASE_029);
  assert.equal(problems.length, 1);
  assert.match(problems[0], /必须共用同一个 specifier/);
  assert.match(problems[0], /@tiptap\/extension-image: 3\.29\.2/);
});

test("下界倒退 → 红（已升上去的消费方会被拉回老 core）", () => {
  const problems = auditFamily(FAMILY, members("^3.28.0", BASE_029.members), BASE_029);
  assert.equal(problems.length, 1);
  assert.match(problems[0], /不许倒退/);
});

test("只移除成员、不新增 → 不要求抬版（移除不产生新的解析）", () => {
  const fewer = members("^3.29.2", BASE_029.members.filter((n) => n !== "@tiptap/react"));
  assert.deepEqual(auditFamily(FAMILY, fewer, BASE_029), []);
});

test("下界从各种范围形态里都读得出来", () => {
  assert.deepEqual(auditFamily(FAMILY, members(">=3.30.0 <4", NINE), BASE_029), []);
  assert.deepEqual(auditFamily(FAMILY, members("3.30.0", NINE), BASE_029), []);
  const bad = auditFamily(FAMILY, members("latest", NINE), BASE_029);
  assert.match(bad[0], /读不出版本下界/);
});

test("基线里没有这个家族时要求先建基线，而不是静默放行", () => {
  const problems = auditFamily(FAMILY, members("^3.30.0", NINE), undefined);
  assert.equal(problems.length, 1);
  assert.match(problems[0], /建立基线/);
});

// ── 判据四：lockfile 里同族只能有一个版本 ──────────────────────────────────
// 这一条看的是「实际装出来是什么」。它补的正是精确钉版那种脱节：三条静态判据全绿，
// 而锁里躺着两族版本（starter-kit 自己的 `^3.x` 把 core 拉到了最新版）。

test("lockfile 里同族混装两个版本 → 红", () => {
  const lock = [
    "  /@tiptap/core@3.30.0(@tiptap/pm@3.30.0):",
    "      '@tiptap/pm': 3.30.0",
    "  /@tiptap/extension-image@3.29.2(@tiptap/core@3.30.0):",
    "      '@tiptap/core': 3.30.0",
  ].join("\n");
  const problems = auditLockfile("@tiptap/", lock);
  assert.equal(problems.length, 1);
  assert.match(problems[0], /3\.29\.2 \/ 3\.30\.0 共 2 个版本/);
});

test("lockfile 里同族单一版本 → 绿（两种书写形态都要认得）", () => {
  const lock = [
    "  /@tiptap/core@3.30.0(@tiptap/pm@3.30.0):", // packages 段
    "      '@tiptap/pm': 3.30.0", // 依赖行
    "      '@tiptap/starter-kit': 3.30.0",
  ].join("\n");
  assert.deepEqual(auditLockfile("@tiptap/", lock), []);
});

test("家族在 lockfile 里不存在时不报错（家族整体移除的过渡态）", () => {
  assert.deepEqual(auditLockfile("@tiptap/", "  /react@19.2.8:\n"), []);
});

test("前缀不会误伤 tiptap-markdown —— 它不在 @tiptap/ 这一族里", () => {
  const lock = ["  /@tiptap/core@3.30.0:", "  /tiptap-markdown@0.9.0(@tiptap/core@3.30.0):"].join("\n");
  assert.deepEqual(auditLockfile("@tiptap/", lock), []);
});

// 真实清单同步：门禁配置里写的 manifest 与前缀，必须真的能在仓库里收到成员。
// 这条防的是「组件搬家 / 依赖挪栏之后门禁静默变成空转」。
test("仓库现状：@tiptap/ 家族收得到成员且全族同版", async () => {
  const { readFileSync } = await import("node:fs");
  const pkg = JSON.parse(readFileSync(new URL("../packages/ui/package.json", import.meta.url), "utf8"));
  const found = Object.entries(pkg.dependencies ?? {}).filter(([name]) => name.startsWith("@tiptap/"));
  assert.ok(found.length >= 9, `@tiptap/ 家族只收到 ${found.length} 个成员，门禁可能已空转`);
  assert.equal(new Set(found.map(([, spec]) => spec)).size, 1);
  // tiptap-markdown 的 peer 是范围（^3.0.1），不属于这个家族 —— 前缀别放宽成 "tiptap"
  assert.ok(!found.some(([name]) => name === "tiptap-markdown"));
});
