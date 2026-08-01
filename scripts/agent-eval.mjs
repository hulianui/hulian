#!/usr/bin/env node
// Agent Eval：跑八类基准任务，量「加载契约与 profile 前后」Agent 的行为差异。
//
//   node scripts/agent-eval.mjs --list
//   node scripts/agent-eval.mjs --task admin-user-list --dir <产出目录>
//   node scripts/agent-eval.mjs --task retrofit-plain-page --dir <后> --baseline <前>
//   node scripts/agent-eval.mjs --validate            # 校验任务集自身
//
// 只自动判 static 项。trace 项需要会话的 tool 调用序列、human 项需要人或浏览器 ——
// 这两类会原样列出待判，**不计入自动分**。把它们算进去，Eval 就成了自我认证：
// 一个从没查过 props、从没在真机上看过的产出，也能拿满分。
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const TASKS = join(ROOT, "docs", "agent-eval", "tasks.json");
const REGISTRY_JSON = join(ROOT, "apps", "www", "public", "registry.json");

const SKIP_DIR = new Set(["node_modules", ".git", ".next", "dist", "build", "out", ".turbo"]);
const CODE = /\.(tsx|jsx|ts|js)$/;

const HANDMADE = [
  { id: "bare-table", re: /<table[\s>]/g },
  { id: "bare-button", re: /<button[\s>]/g },
  { id: "bare-input", re: /<input[\s>]/g },
  { id: "bare-select", re: /<select[\s>]/g },
  { id: "inline-style", re: /\sstyle=\{\{/g },
  { id: "hardcoded-color", re: /(?:text|bg|border|from|to|via)-\[#[0-9a-fA-F]{3,8}\]/g },
];

const argv = process.argv.slice(2);
const flag = (n) => argv.includes(n);
const val = (n) => (argv.includes(n) ? argv[argv.indexOf(n) + 1] : null);

function walk(dir, acc = []) {
  let entries;
  try {
    entries = readdirSync(dir, { withFileTypes: true });
  } catch {
    return acc;
  }
  for (const e of entries) {
    if (SKIP_DIR.has(e.name)) continue;
    const p = join(dir, e.name);
    if (e.isDirectory()) walk(p, acc);
    else if (CODE.test(e.name)) acc.push(p);
  }
  return acc;
}

/** 从产出目录提取：用到的组件 slug、block/page 名、手搓信号。 */
function analyze(dir, registry) {
  const ui = registry.items.filter((i) => i.type === "registry:ui");
  const symbolToSlug = new Map();
  for (const item of ui)
    for (const ex of item.meta?.exports ?? [])
      if (!symbolToSlug.has(ex)) symbolToSlug.set(ex, item.name);
  const meta = new Map(ui.map((i) => [i.name, i]));
  const blockNames = registry.items
    .filter((i) => i.type === "registry:block")
    .map((i) => i.name);

  const slugs = new Set();
  const blocks = new Set();
  const handmade = {};
  let raw = "";

  for (const f of walk(dir)) {
    let src;
    try {
      src = readFileSync(f, "utf8");
    } catch {
      continue;
    }
    raw += `\n${src}`;
    for (const m of src.matchAll(
      /import\s+(type\s+)?\{([^{}]*?)\}\s*from\s*["']@hulianui\/ui[^"']*["']/g,
    )) {
      if (m[1]) continue;
      for (let n of m[2].split(",")) {
        n = n.trim();
        if (!n || n.startsWith("type ")) continue;
        const slug = symbolToSlug.get(n.split(/\s+as\s+/)[0].trim());
        if (slug) slugs.add(slug);
      }
    }
    // 区块/整页落盘后就是普通代码，源码里未必留下 block-xxx 字样。
    // 除文本外再按文件名认：install_block 落的 data-table.tsx 就是 block-data-table。
    const base = (f.split("/").pop() ?? "").replace(/\.(tsx|jsx|ts|js)$/, "");
    for (const b of blockNames)
      if (src.includes(b) || b === `block-${base}` || b === `page-${base}`) blocks.add(b);
    for (const h of HANDMADE) {
      const hit = src.match(h.re);
      if (hit) handmade[h.id] = (handmade[h.id] ?? 0) + hit.length;
    }
  }

  const webgl = [...slugs].filter((s) => meta.get(s)?.meta?.webgl);
  const animated = [...slugs].filter((s) => meta.get(s)?.meta?.animated);
  return {
    slugs,
    blocks,
    handmade,
    handmadeTotal: Object.values(handmade).reduce((a, b) => a + b, 0),
    webgl,
    animated,
    raw,
  };
}

/** 判定一条 static check。返回 {pass, note}。 */
function evalCheck(check, found, baseline, known) {
  // registry 里的条目只认结构化命中（真的 import 了 / 真的落了区块源码）。
  // 退回 raw.includes 会把 import 路径、注释、变量名都算成「用了」——
  // 实测 `import { X } from "../blocks/page-header"` 会让 page-header 假命中，
  // 分数虚高。只有非 registry 的字面量（如 window.confirm）才走文本匹配。
  const present = (name) =>
    known.has(name) ? found.slugs.has(name) || found.blocks.has(name) : found.raw.includes(name);

  if (check.manual) return { pass: null, note: check.manual };

  if (check.noHandmade) {
    if (baseline) {
      const before = baseline.handmadeTotal;
      const after = found.handmadeTotal;
      return {
        pass: after < before,
        note: `手搓信号 ${before} → ${after}`,
      };
    }
    return {
      pass: found.handmadeTotal === 0,
      note: found.handmadeTotal
        ? `发现 ${found.handmadeTotal} 处：${Object.entries(found.handmade).map(([k, v]) => `${k}×${v}`).join(" ")}`
        : "无",
    };
  }

  if (typeof check.maxWebgl === "number") {
    return {
      pass: found.webgl.length <= check.maxWebgl,
      note: `WebGL 件 ${found.webgl.length} 个${found.webgl.length ? `（${found.webgl.join(" ")}）` : ""}，上限 ${check.maxWebgl}`,
    };
  }

  if (check.forbidAny && !check.requireAny) {
    const hit = check.forbidAny.filter(present);
    return { pass: hit.length === 0, note: hit.length ? `出现了不该有的：${hit.join(" ")}` : "无" };
  }

  if (check.requireAny) {
    const hit = check.requireAny.filter(present);
    const need = check.requireCount ?? 1;
    const forbidden = (check.forbidAny ?? []).filter(present);
    const pass = hit.length >= need && forbidden.length === 0;
    let note = `命中 ${hit.length}/${need}${hit.length ? `：${hit.join(" ")}` : ""}`;
    if (forbidden.length) note += ` · 但出现了 ${forbidden.join(" ")}`;
    return { pass, note };
  }

  return { pass: null, note: "无判定依据，需人工" };
}

function main() {
  const tasks = JSON.parse(readFileSync(TASKS, "utf8"));

  if (flag("--validate")) {
    const errors = [];
    const ids = new Set();
    for (const t of tasks.tasks) {
      if (ids.has(t.id)) errors.push(`任务 id 重复：${t.id}`);
      ids.add(t.id);
      if (!t.prompt) errors.push(`${t.id}: 缺 prompt`);
      if (!t.expect?.surface) errors.push(`${t.id}: 缺 expect.surface`);
      const kinds = new Set(t.checks.map((c) => c.kind));
      for (const k of kinds)
        if (!tasks.scoring[k]) errors.push(`${t.id}: 未知 check kind ${k}`);
      if (!t.checks.some((c) => c.kind === "static"))
        errors.push(`${t.id}: 没有任何 static 检查项，无法自动评分`);
      for (const c of t.checks) {
        if (!c.weight) errors.push(`${t.id}/${c.id}: 缺 weight`);
        if (c.kind !== "static") continue;
        const hasPredicate =
          c.requireAny || c.forbidAny || c.noHandmade || typeof c.maxWebgl === "number" || c.manual;
        if (!hasPredicate) errors.push(`${t.id}/${c.id}: static 项缺判定依据`);
      }
    }
    // 引用的组件 / block 必须真实存在
    if (existsSync(REGISTRY_JSON)) {
      const reg = JSON.parse(readFileSync(REGISTRY_JSON, "utf8"));
      const known = new Set(reg.items.map((i) => i.name));
      for (const t of tasks.tasks)
        for (const c of t.checks)
          for (const n of [...(c.requireAny ?? []), ...(c.forbidAny ?? [])])
            if (!known.has(n) && !n.includes(".") && !known.has(n))
              errors.push(`${t.id}/${c.id}: 引用了 registry 里没有的 "${n}"`);
    }
    if (errors.length) {
      console.error(`任务集校验失败（${errors.length}）：\n  ${errors.join("\n  ")}`);
      process.exit(1);
    }
    console.log(`任务集校验通过：${tasks.tasks.length} 个任务，全部有 static 判定依据。`);
    return;
  }

  if (flag("--list") || !flag("--task")) {
    console.log(`八类基准任务（${tasks.tasks.length}）\n`);
    for (const t of tasks.tasks) {
      const by = (k) => t.checks.filter((c) => c.kind === k).length;
      console.log(`${t.id.padEnd(22)}${t.title}`);
      console.log(
        `  期望场景：${t.expect.surface}${t.expect.modifiers ? ` + [${t.expect.modifiers}]` : ""} · workflow=${t.expect.workflow}`,
      );
      console.log(`  评分点：static ${by("static")} · trace ${by("trace")} · human ${by("human")}\n`);
    }
    console.log("跑法：--task <id> --dir <产出目录>。static 项自动判，trace/human 项列出待判。");
    return;
  }

  const taskId = val("--task");
  const task = tasks.tasks.find((t) => t.id === taskId);
  if (!task) {
    console.error(`未知任务：${taskId}。用 --list 看全部。`);
    process.exit(1);
  }
  const dir = val("--dir");
  if (!dir || !existsSync(dir)) {
    console.error(`--dir 需要指向存在的产出目录（当前：${dir ?? "未提供"}）`);
    process.exit(1);
  }
  if (task.baselineRequired && !val("--baseline")) {
    console.error(`${task.id} 是改造类任务，必须用 --baseline <改造前目录> 才能判「是否下降」。`);
    process.exit(1);
  }

  const registry = JSON.parse(readFileSync(REGISTRY_JSON, "utf8"));
  const known = new Set(registry.items.map((i) => i.name));
  const found = analyze(dir, registry);
  const baseline = val("--baseline") ? analyze(val("--baseline"), registry) : null;

  console.log(`# ${task.title}（${task.id}）\n`);
  console.log(
    `期望场景：${task.expect.surface}${task.expect.modifiers ? ` + [${task.expect.modifiers}]` : ""} · workflow=${task.expect.workflow}`,
  );
  console.log(`产出：${found.slugs.size} 个组件、${found.blocks.size} 个区块/整页、手搓 ${found.handmadeTotal} 处\n`);

  let got = 0;
  let total = 0;
  const pending = [];

  console.log("## 自动判定（static）");
  for (const c of task.checks) {
    if (c.kind !== "static") {
      pending.push(c);
      continue;
    }
    const { pass, note } = evalCheck(c, found, baseline, known);
    if (pass === null) {
      pending.push({ ...c, note });
      continue;
    }
    total += c.weight;
    if (pass) got += c.weight;
    console.log(`  ${pass ? "✅" : "❌"} [${c.weight}] ${c.desc}`);
    console.log(`       ${note}`);
  }

  console.log(`\n自动分：${got}/${total}${total ? `（${((got / total) * 100).toFixed(0)}%）` : ""}`);

  const pendWeight = pending.reduce((s, c) => s + c.weight, 0);
  console.log(`\n## 待人工判定（不计入自动分，共 ${pendWeight} 分）`);
  for (const c of pending)
    console.log(`  ○ [${c.weight}] (${c.kind}) ${c.desc}${c.note ? ` —— ${c.note}` : ""}`);

  console.log(
    "\n注：trace 项要看本次会话的 tool 调用序列（是否先 recommend_ui、是否写代码前 get_component_doc）；",
  );
  console.log("human 项要真人或真实浏览器确认。这两类算进自动分就等于自我认证。");

  if (flag("--strict") && got < total) process.exit(1);
}

main();
