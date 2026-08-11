#!/usr/bin/env node
/**
 * 「同族依赖必须同版，且新增成员时必须整族抬版」门禁。
 *
 * 为什么需要这一道 —— tiptap 全家的 `peerDependencies` 钉的是**精确版本**而不是范围：
 *
 *   @tiptap/extension-table@3.30.0 → { "@tiptap/core": "3.30.0", "@tiptap/pm": "3.30.0" }
 *   @tiptap/core@3.30.0            → { "@tiptap/pm": "3.30.0" }
 *
 * 于是我们写的 `^3.29.2` 只在「整个家族在同一次解析里被一起决定」时才成立。**带着旧
 * lockfile 升级的消费方恰恰不满足这个前提**：0.30.0 新增了 4 个 tiptap 扩展，而消费方锁里
 * `@tiptap/core` / `@tiptap/pm` 早已固定在 3.29.2 —— 老成员的 specifier 没变、锁被原样保留，
 * 只有 4 个新成员是第一次进锁、按范围取到当时最新的 3.30.0，两边当场对不上（#207）。
 * 跑起来的组合是 extension@3.30.0 + core@3.29.2，而 tiptap 把 peer 钉成精确值本身就说明
 * 它不担保跨版本的内部 API 兼容。
 *
 * 修法不是「把 specifier 改成精确版本」——**那条路实测更糟**：`@tiptap/starter-kit` 自己的
 * dependencies 用的是 `^3.29.2`，会把 core / extensions 拉到家族最新，于是我们钉死的
 * 3.29.2 扩展反过来与它冲突，**全新解析当场就裂**（上游每发一版就复发一次，影响所有新
 * 消费方，比原问题频繁得多）。正确的修法是保持 caret、**在新增家族成员的同一次改动里把
 * 全族 specifier 一起抬高**：老成员的 specifier 变了，消费方那把旧锁对它们就失效了，
 * 于是全族在同一次解析里一起前进，回到「同一次解析」这个前提上。
 *
 * 这道门禁把上面那条隐性约定变成机械判据。它是**纯静态**的：只读 package.json 与基线，
 * 不装依赖、不联网、毫秒级，因此可以挂在秒级门禁那一档里。
 *
 * ⚠️ 它**不**能替代「消费方带旧锁升级」的真实复现 —— 那需要一把几周前建的 lockfile 作为
 * 输入，而库仓库里没有这个输入（我们每次都是全新解析，家族天然同版）。见 docs/consuming.md。
 *
 * 用法：
 *   node scripts/check-dep-family.mjs           # 校验（CI 用）
 *   node scripts/check-dep-family.mjs --write    # 抬版/增删成员后更新基线
 */

import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const REPO_ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const BASELINE_PATH = join(REPO_ROOT, "scripts/dep-family-baseline.json");

/**
 * 需要「整族同版」的依赖家族。
 *
 * 判据是**被依赖方的 peer 是否钉精确值**，不是「名字看起来像一家人」：
 * `tiptap-markdown` 虽然也是 tiptap 生态，但它的 peer 是 `{"@tiptap/core": "^3.0.1"}`（范围），
 * 不受这条约束，因此 `@tiptap/` 这个前缀刚好把它排除在外 —— 别改成 `tiptap` 模糊匹配。
 */
const FAMILIES = [
  {
    prefix: "@tiptap/",
    manifest: "packages/ui/package.json",
    why: "tiptap 全家的 peerDependencies 钉的是精确版本",
  },
];

/** 取范围里的下界版本。`^3.29.2` / `~3.29.2` / `>=3.29.2 <4` / `3.29.2` 都取 3.29.2。 */
function floorOf(specifier) {
  const match = /(\d+)\.(\d+)\.(\d+)/.exec(specifier);
  if (!match) return null;
  return [Number(match[1]), Number(match[2]), Number(match[3])];
}

function compareFloor(a, b) {
  for (let i = 0; i < 3; i += 1) {
    if (a[i] !== b[i]) return a[i] < b[i] ? -1 : 1;
  }
  return 0;
}

/** 从一份 package.json 里收集某个家族的全部成员（三种依赖栏都算）。 */
function collectFamily(manifestPath, prefix) {
  const pkg = JSON.parse(readFileSync(join(REPO_ROOT, manifestPath), "utf8"));
  const members = {};
  for (const field of ["dependencies", "peerDependencies", "devDependencies"]) {
    for (const [name, specifier] of Object.entries(pkg[field] ?? {})) {
      if (name.startsWith(prefix)) members[name] = specifier;
    }
  }
  return members;
}

/**
 * 判据四：lockfile 里这一族只能解析出**一个**版本。
 *
 * 上面三条看的是「我们声明了什么」，这一条看的是「实际装出来是什么」——两者会脱节：
 * 把 specifier 改成精确版本时，`@tiptap/starter-kit` 自己的 `^3.x` 仍会把 core / extensions
 * 拉到家族最新版，于是锁里同时躺着 3.29.2 与 3.30.0 两族，而三条静态判据全都看不见。
 *
 * 刻意不用 `pnpm install --strict-peer-dependencies` 来覆盖这一层：那条命令在本仓会因为一条
 * 与此无关的既有冲突（apps/www → intlayer → zod-to-ts 要 typescript@"^5 || ^6"，仓库已是 7.x）
 * 常红，且锁是最新时 pnpm 会整个跳过解析步骤、连 peer 都不判。读 lockfile 精确得多。
 *
 * @param {string} prefix
 * @param {string} lockText  pnpm-lock.yaml 全文
 * @returns {string[]}
 */
export function auditLockfile(prefix, lockText) {
  const escaped = prefix.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  // 覆盖 lockfile v6 里的两种形态：`/@tiptap/core@3.29.2(...)` 与 `'@tiptap/pm': 3.29.2`
  const pattern = new RegExp(`${escaped}[a-z0-9-]+(?:@|':\\s*)(\\d+\\.\\d+\\.\\d+)`, "g");
  const versions = new Set([...lockText.matchAll(pattern)].map((match) => match[1]));
  if (versions.size <= 1) return [];
  return [
    `${prefix}：lockfile 里同时解析出了 ${[...versions].sort().join(" / ")} 共 ${versions.size} 个版本。\n` +
      `    这一族的 peer 钉的是精确值，跨版本混装就是错配组合。常见成因是把 specifier 改成了\n` +
      `    精确版本 —— @tiptap/starter-kit 自己的依赖是 \`^3.x\`，会把 core / extensions 拉到家族\n` +
      `    最新版，反过来与被钉死的扩展冲突。保持 caret、整族一起抬版。`,
  ];
}

/**
 * 判据本体（纯函数，便于单测）。
 *
 * @param {{prefix: string, why: string}} family
 * @param {Record<string, string>} members  家族成员 → specifier
 * @param {{specifier: string, members: string[]}|undefined} previous  基线里这个家族的上一次形态
 * @returns {string[]} 违规说明；空数组表示合规
 */
export function auditFamily(family, members, previous) {
  const problems = [];
  const key = family.prefix;
  const names = Object.keys(members).sort();

  if (names.length === 0) {
    return [`${key}：一个成员都没有 —— 家族整体移除了就把它从 FAMILIES 里删掉`];
  }

  // 判据一：全族逐字同一个 specifier。混着写等于没写 —— 只要有一个成员的范围不同，
  // 它就可能被解析到另一个版本上，而 peer 是精确值，一个不同就够裂。
  const distinct = [...new Set(Object.values(members))];
  if (distinct.length > 1) {
    const detail = names.map((name) => `    ${name}: ${members[name]}`).join("\n");
    problems.push(
      `${key}：全族必须共用同一个 specifier（${family.why}），现在有 ${distinct.length} 种：\n${detail}`,
    );
    return problems;
  }

  const specifier = distinct[0];
  const floor = floorOf(specifier);
  if (!floor) {
    return [`${key}：specifier "${specifier}" 里读不出版本下界`];
  }

  if (!previous) {
    return [`${key}：基线里没有这个家族，跑 \`pnpm deps:family --write\` 建立基线`];
  }

  const previousFloor = floorOf(previous.specifier);
  const added = names.filter((name) => !previous.members.includes(name));

  // 判据二：下界不许倒退。倒退意味着已经装到新版本的消费方在下次解析时可能被拉回老版本，
  // 而新版本的扩展与老 core 同样是错配组合。
  if (compareFloor(floor, previousFloor) < 0) {
    return [`${key}：specifier 从 ${previous.specifier} 退回到 ${specifier}，下界不许倒退`];
  }

  // 判据三（本门禁存在的理由）：新增成员时，全族下界必须**严格抬高**。
  // 沿用旧下界的话，老成员的 specifier 没变 → 消费方那把旧锁对它们继续生效 → 只有新成员
  // 被重新解析到家族最新版 → 就是 #207 的裂法。
  if (added.length > 0 && compareFloor(floor, previousFloor) === 0) {
    problems.push(
      `${key}：新增了成员（${added.join(" / ")}）却沿用了旧下界 ${specifier}。\n` +
        `    带旧 lockfile 升级的消费方会只把新成员解析到家族最新版，与锁里的老版本 core / pm 错配（#207）。\n` +
        `    把全族 specifier 一起抬到家族当前最新版，再跑 \`pnpm deps:family --write\` 更新基线。\n` +
        `    （若上游确实没有更新的版本可抬 —— 那么消费方锁里也不可能有更高版本，此时直接 --write 并在 PR 里说明。）`,
    );
  }

  return problems;
}

function main() {
  const write = process.argv.includes("--write");
  const baseline = JSON.parse(readFileSync(BASELINE_PATH, "utf8"));
  const lockText = readFileSync(join(REPO_ROOT, "pnpm-lock.yaml"), "utf8");
  const problems = [];
  const nextBaseline = { ...baseline };

  for (const family of FAMILIES) {
    const members = collectFamily(family.manifest, family.prefix);
    const names = Object.keys(members).sort();
    // 基线只在「全族同一个 specifier」时才有意义；混着写的时候不写基线，免得把违规状态固化下去。
    if (names.length > 0 && new Set(Object.values(members)).size === 1) {
      nextBaseline[family.prefix] = { specifier: Object.values(members)[0], members: names };
    }
    problems.push(...auditFamily(family, members, baseline[family.prefix]));
    problems.push(...auditLockfile(family.prefix, lockText));
  }

  if (write) {
    writeFileSync(BASELINE_PATH, `${JSON.stringify(nextBaseline, null, 2)}\n`);
    console.log(`✓ 已更新 ${BASELINE_PATH}`);
    if (problems.length > 0) {
      console.log("  （基线已按当前 package.json 重写，上面那些判据下次运行时以新基线为准）");
    }
    return;
  }

  if (problems.length > 0) {
    console.error("✗ 同族依赖版本口径不合规：\n");
    for (const problem of problems) console.error(`  ${problem}\n`);
    process.exitCode = 1;
    return;
  }

  console.log(`✓ 同族依赖版本口径合规（${FAMILIES.map((f) => f.prefix).join(" · ")}）`);
}

if (process.argv[1] && import.meta.url === `file://${process.argv[1]}`) main();
