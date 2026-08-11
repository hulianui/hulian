import assert from "node:assert/strict";
import test from "node:test";

import { auditFamily, auditLockfile, auditPeerFloors, floorOfLoose } from "./check-dep-family.mjs";

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

// ── 第二档：peer 下界必须是有人选过的数字（#209）──────────────────────────────
//
// 这一档判的不是「peer 下界 ≥ devDep 下界」（issue 建议 1 的原话）—— 那条太强，会把每次
// 例行抬 devDep 都变成一次面向消费方的收窄，还会误伤 react 那种**有 CI 实证**的宽下界。
// 判的是「(peer, dev) 这一对与基线记过的那一对是否逐字相同」：任一侧动了都要重新回答
// 一次「这个下界现在还对吗」。

const UI = "packages/ui/package.json";

test("#209 本体：devDep 抬到 ^1.6.0 而 peer 仍是 >=1.0.0 —— 抬版当天就该红", () => {
  // 基线记的是上一次复核时的形态：那时 dev 还是 1.4.x，peer 写 >=1.0.0 尚未脱节。
  const records = { "@base-ui/react": { peer: ">=1.0.0", dev: "^1.4.1", why: "1.x 全段" } };
  const pkg = {
    peerDependencies: { "@base-ui/react": ">=1.0.0" },
    devDependencies: { "@base-ui/react": "^1.6.0" },
  };
  const problems = auditPeerFloors(UI, pkg, records);
  assert.equal(problems.length, 1);
  assert.match(problems[0], /dev \^1\.4\.1 → \^1\.6\.0/);
  // 报错要把旧理由贴出来，否则读的人不知道该复核什么
  assert.match(problems[0], /1\.x 全段/);
});

test("#209 修法：peer 与 dev 一起动、基线同步重记 → 放行", () => {
  const records = { "@base-ui/react": { peer: ">=1.6.0", dev: "^1.6.0", why: "跟住实际开发的版本线" } };
  const pkg = {
    peerDependencies: { "@base-ui/react": ">=1.6.0" },
    devDependencies: { "@base-ui/react": "^1.6.0" },
  };
  assert.deepEqual(auditPeerFloors(UI, pkg, records), []);
});

test("宽下界只要 (peer, dev) 没变就放行 —— react >=18 是有 CI 实证的，不许被一刀切逼高", () => {
  const records = {
    react: { peer: ">=18", dev: "^19.2.8", why: "CI 有 react18-smoke" },
    "react-dom": { peer: ">=18", dev: "^19.2.8", why: "同 react" },
  };
  const pkg = {
    peerDependencies: { react: ">=18", "react-dom": ">=18" },
    devDependencies: { react: "^19.2.8", "react-dom": "^19.2.8" },
  };
  assert.deepEqual(auditPeerFloors(UI, pkg, records), []);
});

test("why 留空 → 红（--write 只能生成骨架，理由必须人写）", () => {
  const records = { motion: { peer: ">=11", dev: "^12.43.0", why: "  " } };
  const pkg = { peerDependencies: { motion: ">=11" }, devDependencies: { motion: "^12.43.0" } };
  const problems = auditPeerFloors(UI, pkg, records);
  assert.equal(problems.length, 1);
  assert.match(problems[0], /缺 why/);
});

test("新加的 peer 没有记录 → 红（新依赖不会静默混进来）", () => {
  const pkg = { peerDependencies: { zod: ">=3" }, devDependencies: { zod: "^4.1.0" } };
  const problems = auditPeerFloors(UI, pkg, {});
  assert.equal(problems.length, 1);
  assert.match(problems[0], /没有基线记录/);
});

test("没有 devDep 的 peer 跳过（optional 的 vite）—— 没有参照物就别编一个", () => {
  const pkg = { peerDependencies: { vite: ">=5" }, devDependencies: {} };
  assert.deepEqual(auditPeerFloors(UI, pkg, {}), []);
});

test("依赖已不是 peer 了，基线里的陈记录要报出来", () => {
  const records = { "@mui/material": { peer: ">=5", dev: "^5.0.0", why: "日期族桥接" } };
  const problems = auditPeerFloors(UI, { peerDependencies: {}, devDependencies: {} }, records);
  assert.equal(problems.length, 1);
  assert.match(problems[0], /已经不在 peerDependencies 里/);
});

test("peer 范围里省略 minor / patch 的写法都读得出下界", () => {
  assert.deepEqual(floorOfLoose(">=18"), [18, 0, 0]);
  assert.deepEqual(floorOfLoose(">=4.1"), [4, 1, 0]);
  assert.deepEqual(floorOfLoose(">=1.6.0"), [1, 6, 0]);
  assert.deepEqual(floorOfLoose("^12.43.0"), [12, 43, 0]);
  assert.equal(floorOfLoose("latest"), null);
});

// 仓库现状：#209 修完之后不许被改回去。
test("仓库现状：@base-ui/react 的 peer 下界不低于 1.6.0", async () => {
  const { readFileSync } = await import("node:fs");
  const pkg = JSON.parse(readFileSync(new URL("../packages/ui/package.json", import.meta.url), "utf8"));
  const floor = floorOfLoose(pkg.peerDependencies["@base-ui/react"]);
  assert.ok(
    floor[0] > 1 || (floor[0] === 1 && floor[1] >= 6),
    `@base-ui/react peer 下界退回到了 ${pkg.peerDependencies["@base-ui/react"]}（#209：1.4.1 上 Slider SSR 偶发 hydration mismatch）`,
  );
});

// docs/consuming.md 里抄了一份 peer 清单给消费方照着写。#209 那次它跟着一起过期了
// （package.json 早就该是 >=1.6.0，文档还写着 >=1.0.0），所以把这份镜像钉死。
test("docs/consuming.md 里的 peer 清单镜像与 package.json 逐字一致", async () => {
  const { readFileSync } = await import("node:fs");
  const pkg = JSON.parse(readFileSync(new URL("../packages/ui/package.json", import.meta.url), "utf8"));
  const doc = readFileSync(new URL("../docs/consuming.md", import.meta.url), "utf8");
  const block = /```json\n(\{\s*"peerDependencies"[\s\S]*?\})\n```/.exec(doc);
  assert.ok(block, "docs/consuming.md 里找不到 peerDependencies 清单代码块");
  const documented = JSON.parse(block[1]).peerDependencies;
  for (const [name, spec] of Object.entries(documented)) {
    assert.equal(
      pkg.peerDependencies[name],
      spec,
      `docs/consuming.md 写 ${name}: ${spec}，package.json 是 ${pkg.peerDependencies[name]}`,
    );
  }
  // 反向：非 optional 的 peer 一个都不许漏抄（vite 是 optional，文档里明说没有 optional peer）
  const optional = new Set(Object.keys(pkg.peerDependenciesMeta ?? {}));
  for (const name of Object.keys(pkg.peerDependencies)) {
    if (optional.has(name)) continue;
    assert.ok(name in documented, `docs/consuming.md 的 peer 清单漏了 ${name}`);
  }
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
