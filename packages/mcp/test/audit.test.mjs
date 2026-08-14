// 采用体检的门禁（issue #43）。
//
// 这里验的不是「函数跑不跑得通」，而是**判断质量** —— 一个会乱报的审计比没有审计更糟，
// 因为它会被整个忽略。所以每条测试都对着 #43 的验收标准，用真 registry + 真文件树，
// 不 mock：判定逻辑的价值全在它面对真实代码时的表现。
import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { auditAdoption, diffBaseline, renderAudit } from "../src/audit.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const REGISTRY = JSON.parse(
  readFileSync(join(HERE, "..", "..", "..", "apps", "www", "public", "registry.json"), "utf8"),
);
const PROFILES = JSON.parse(readFileSync(join(HERE, "..", "src", "agent-profiles.json"), "utf8"));

const write = (root, rel, content) => {
  const path = join(root, rel);
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, content);
};

/**
 * 造一个消费项目。deps 里默认给足 @hulianui/ui，因为 audit 的所有判断都建立在
 * 「这是个瑚琏消费方」之上。
 */
function makeConsumer({ files = {}, deps = {}, installed = "0.16.0", declared = "^0.16.0" } = {}) {
  const root = mkdtempSync(join(tmpdir(), "hulian-audit-"));
  write(
    root,
    "package.json",
    JSON.stringify({
      name: "fixture",
      dependencies: { react: "19.0.0", "@base-ui/react": "1.0.0", "@hulianui/ui": declared, ...deps },
    }),
  );
  write(
    root,
    "node_modules/@hulianui/ui/package.json",
    JSON.stringify({ name: "@hulianui/ui", version: installed }),
  );
  for (const [rel, content] of Object.entries(files)) write(root, rel, content);
  return root;
}

const run = (root, opts = {}) => auditAdoption({ projectRoot: root, registry: REGISTRY, ...opts });
const withRoot = (root, fn) => {
  try {
    return fn();
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
};

// ------------------------------------------------------------- 场景判定 --

test("自动判 surface 并给出可追溯的依据", () => {
  const root = makeConsumer({
    files: {
      "app/admin/users/page.tsx": `import { AdminLayout, PageHeader, ProTable } from "@hulianui/ui"
export default () => <AdminLayout><PageHeader /><ProTable /></AdminLayout>\n`,
    },
  });
  withRoot(root, () => {
    const r = run(root);
    assert.equal(r.scene.surface.id, "admin-console");
    assert.equal(r.scene.surface.confidence, "high");
    assert.ok(
      r.scene.surface.evidence.join(" ").includes("admin-layout"),
      "依据必须能追溯到具体证据，不能只给一个结论",
    );
  });
});

test("结构性依赖胜过零散小件命中：Tauri 项目判 desktop-shell", () => {
  // 曾经只按分数排序，导致「碰巧用了两个配置类小件」(medium) 压过
  // 「Tauri 依赖 + 命令面板」(high)。算了置信度却不拿它排序，是自相矛盾。
  const root = makeConsumer({
    deps: { "@tauri-apps/api": "2.0.0" },
    files: {
      "src/App.tsx": `import { Command, Snippet, ColorField } from "@hulianui/ui"
export default () => <><Command /><Snippet /><ColorField /></>\n`,
    },
  });
  withRoot(root, () => {
    const r = run(root);
    assert.equal(r.scene.surface.id, "desktop-shell");
    assert.ok(
      r.scene.surfaceCandidates.some((c) => c.id === "config-tool"),
      "次名要如实留在候选里，真实项目常横跨两种形态",
    );
  });
});

test("人工覆盖 surface 时不再自动判定", () => {
  const root = makeConsumer({
    files: { "app/admin/page.tsx": `import { AdminLayout } from "@hulianui/ui"\nexport default AdminLayout\n` },
  });
  withRoot(root, () => {
    const r = run(root, { surface: "content-brand" });
    assert.equal(r.scene.surface.id, "content-brand");
    assert.equal(r.scene.surface.overridden, true);
  });
});

// --------------------------------------------------------------- 机会点 --

test("机会点只报有邻近信号的缺口：同组用过才报，整组没用不报", () => {
  const root = makeConsumer({
    files: {
      "app/admin/page.tsx": `import { AdminLayout, PageHeader, Table, Pagination } from "@hulianui/ui"
export default () => <AdminLayout><PageHeader /><Table /><Pagination /></AdminLayout>\n`,
    },
  });
  withRoot(root, () => {
    const r = run(root);
    const slugs = r.opportunities.map((o) => o.slug);
    assert.ok(slugs.includes("pro-table"), "「列表页」组里用了 Table/Pagination 却缺 ProTable —— 有邻近信号，该报");
    assert.ok(
      !r.opportunities.some((o) => o.from === "surface:admin-console/权限"),
      "「权限」组一件没用 = 这个项目没这个场景，不该报成采用缺口",
    );
  });
});

test("中后台不会被推全屏背景 / WebGL —— 但局部强调放行", () => {
  // 实证：ins-admin 在登录页用了 aurora-text / shimmer-button，marketing modifier 因此
  // 成立，consider 列表把一批装饰件推进了运维后台。surface 决定组件语言，所以要拦。
  //
  // 但 0.27.0 起拦截精度从 category 提到 group（#140）：decoration 内部 backdrop
  //（52 件全屏背景 / WebGL）与 overlay-fx（40 件局部强调）是两种完全不同的东西。
  // 按整类拦，中后台连入场过渡（reveal）和卡片描边（border-beam）都被禁 —— 而同一份
  // profile 的 avoid 里却写着「关键数字裸写而不用 NumberTicker」，规则自己跟自己打架。
  // 真正要守住的 #41 非目标是「往中后台塞营销背景与 WebGL 特效」，那一条这里仍然守死。
  const root = makeConsumer({
    files: {
      "app/admin/login/page.tsx": `import { AdminLayout, PageHeader, ProTable, AuroraText, ShimmerButton } from "@hulianui/ui"
export default () => <AdminLayout><PageHeader /><ProTable /><AuroraText /><ShimmerButton /></AdminLayout>\n`,
    },
  });
  withRoot(root, () => {
    const r = run(root);
    assert.equal(r.scene.surface.id, "admin-console");
    assert.ok(
      r.scene.modifiers.some((m) => m.id === "marketing"),
      "marketing 确实成立 —— 不是靠压掉判定来解决",
    );
    const metaOf = (slug) => REGISTRY.items.find((i) => i.name === slug);
    const backdrop = r.opportunities.filter((o) => {
      const item = metaOf(o.slug);
      return (
        (item?.categories ?? []).includes("decoration") && item?.meta?.group === "backdrop"
      );
    });
    assert.deepEqual(backdrop, [], "全屏背景 / WebGL 不该越过 surface 边界进入中后台");

    const allowed = new Set(
      (PROFILES.surfaces.find((s) => s.id === "admin-console")?.allowEffects ?? []),
    );
    for (const o of r.opportunities) {
      const item = metaOf(o.slug);
      if (!(item?.categories ?? []).includes("decoration")) continue;
      assert.ok(
        allowed.has(o.slug),
        `装饰件 ${o.slug} 进了中后台建议，但它不在 allowEffects 白名单里`,
      );
    }
  });
});

test("modifier 的 require 缺件按 high 报，兄弟件在用是加强证据而非降级理由", () => {
  // TabBar 吃底部安全区不代表 SafeArea 可省 —— 刘海那一侧照样贴边。
  // 曾经把「兄弟件在用」写成降级条件，读反了 require 的语义（都要，不是二选一）。
  const root = makeConsumer({
    files: {
      "app/m/home/page.tsx": `import { TabBar } from "@hulianui/ui"\nexport default TabBar\n`,
    },
  });
  withRoot(root, () => {
    const r = run(root);
    const safeArea = r.opportunities.find((o) => o.slug === "safe-area");
    assert.ok(safeArea, "判定为 mobile 形态就该报 safe-area");
    assert.equal(safeArea.confidence, "high");
    assert.match(safeArea.reason, /佐证/, "兄弟件在用应作为加强证据出现在理由里");
  });
});

// --------------------------------------------------------------- 风险项 --

test("风险项分级：裸 table 是 high，图标热区按钮是 low", () => {
  const root = makeConsumer({
    files: {
      "src/App.tsx": `import { Button } from "@hulianui/ui"
export default function App() {
  return (
    <div>
      <table className="w-full"><tbody /></table>
      <button aria-label="关闭" onClick={close}><svg /></button>
      <Button>提交</Button>
    </div>
  )
}\n`,
    },
  });
  withRoot(root, () => {
    const r = run(root);
    const table = r.risks.find((x) => x.id === "bare-table");
    const button = r.risks.find((x) => x.id === "bare-button");
    assert.equal(table.confidence, "high");
    assert.equal(button.confidence, "low");
    assert.ok(button.basis.length, "降级必须给出判断依据，否则调用方无从判断信不信");
    assert.ok(table.line > 0 && table.file, "每条都要能定位到文件行号");
  });
});

test("注释里的 <table> / <input> 不是手搓（#266）—— 迁移写得越清楚，误报越多", () => {
  // issue 里的原文：一个 100% 迁完的文件，只因为注释写了「原来这里是手写 <table>」被报风险；
  // 第二条更荒唐，它是从 table.md 的「禁忌 / 坑」抄下来的原话 —— 遵守文档反被自家审计扣分。
  const root = makeConsumer({
    files: {
      "src/installs-table.tsx": `import { Table, Input } from "@hulianui/ui"
// 瑚琏 Table 迁移。行为按原手写 <table> 1:1 复刻：同样 7 列。
export default function InstallsTable({ rows }) {
  return (
    <div>
      {/* minWidth 落在 <table> 本体上，写进 className 会钉住滚动容器。 */}
      <Table data={rows} minWidth={940} />
      {/* ref 落在瑚琏 Input 内层原生 <input> 上。 */}
      <Input />
    </div>
  )
}\n`,
    },
  });
  withRoot(root, () => {
    const r = run(root);
    assert.equal(r.risks.find((x) => x.id === "bare-table"), undefined);
    assert.equal(r.risks.find((x) => x.id === "bare-input"), undefined);
  });
});

test("同一行命中两次只报一条 —— 报告的粒度就是一行（#266）", () => {
  const root = makeConsumer({
    files: {
      "src/Hero.tsx": `import { Button } from "@hulianui/ui"
export default () => <div className="bg-gradient-to-r from-[#ff0000] to-[#0000ff]"><Button /></div>\n`,
    },
  });
  withRoot(root, () => {
    const r = run(root);
    const colors = r.risks.filter((x) => x.id === "hardcoded-color");
    assert.equal(colors.length, 1);
    assert.equal(colors[0].line, 2);
  });
});

test("表单提交按钮升到 high —— 承担主要动作就该用 Button", () => {
  const root = makeConsumer({
    files: {
      "src/Form.tsx": `import { Field } from "@hulianui/ui"
export default () => <form onSubmit={save}><Field /><button type="submit">保存</button></form>\n`,
    },
  });
  withRoot(root, () => {
    const r = run(root);
    const button = r.risks.find((x) => x.id === "bare-button");
    assert.equal(button.confidence, "high");
  });
});

test("未接入瑚琏的文件里的高危信号降一档 —— 那是没迁移，不是绕过", () => {
  const root = makeConsumer({
    files: { "src/Legacy.tsx": `export default () => <table className="w-full" />\n` },
  });
  withRoot(root, () => {
    const r = run(root);
    const table = r.risks.find((x) => x.id === "bare-table");
    assert.equal(table.confidence, "medium");
    assert.match(table.basis.join(" "), /未接入/);
  });
});

// -------------------------------------------------------------- workflow --

test("prototype 口径不推高层企业件，但形态必备件照报", () => {
  // 实证：同产品的 demo 原型与正式系统在 12 个企业高层件上是 5/12 与 10/12，
  // 那是取向不同不是采用不足。但原型也一样会贴边，safe-area 该报还得报。
  const files = {
    "app/admin/page.tsx": `import { AdminLayout, PageHeader, Table, Pagination, FormDialog, Field } from "@hulianui/ui"
export default () => <AdminLayout><PageHeader /><Table /><Pagination /><FormDialog /><Field /></AdminLayout>\n`,
    "app/m/home/page.tsx": `import { TabBar } from "@hulianui/ui"\nexport default TabBar\n`,
  };
  const build = makeConsumer({ files });
  const proto = makeConsumer({ files });
  try {
    const b = run(build);
    const p = run(proto, { workflow: "prototype" });
    assert.ok(p.opportunities.length < b.opportunities.length, "原型口径下机会点应当收窄");
    assert.ok(!p.opportunities.some((o) => o.from.startsWith("surface:")), "不再按 surface 推企业件");
    assert.ok(p.opportunities.some((o) => o.slug === "safe-area"), "形态必备件不因原型而豁免");
    assert.ok(!p.plan.some((s) => s.title.includes("高层业务组件")), "计划里不再有补齐高层件那一步");
  } finally {
    rmSync(build, { recursive: true, force: true });
    rmSync(proto, { recursive: true, force: true });
  }
});

test("项目自述像原型时给提示，但不自动切换口径", () => {
  const root = makeConsumer({
    files: {
      "CLAUDE.md": "本仓库是纯前端 demo 原型，用于需求回看，不接后端。\n",
      "app/admin/page.tsx": `import { AdminLayout } from "@hulianui/ui"\nexport default AdminLayout\n`,
    },
  });
  withRoot(root, () => {
    const r = run(root);
    assert.equal(r.scene.prototypeHint, "CLAUDE.md");
    assert.equal(r.scene.workflow, "build", "只提示，不静默改口径 —— 猜错会把正式系统的真缺口一并压掉");
    assert.match(renderAudit(r), /workflow="prototype"/, "提示里要给出具体怎么改");
  });
});

// ----------------------------------------------------------- 版本与基线 --

test("版本落后如实报出并把升级排进计划第一步", () => {
  const root = makeConsumer({ declared: "^0.5.0", installed: "0.5.0" });
  withRoot(root, () => {
    const r = run(root);
    assert.equal(r.context.behind, true);
    assert.match(r.plan[0].title, /升级/);
  });
});

test("本地源码接入不算落后", () => {
  const root = makeConsumer({ declared: "link:../hulian/packages/ui", installed: "0.5.0" });
  withRoot(root, () => {
    assert.equal(run(root).context.behind, false);
  });
});

test("ratchet 只拦新增，存量债务不阻断", () => {
  const previous = { version: 1, highLevelScore: "3/12", components: ["button"], risks: { "bare-table": 5 } };
  const unchanged = diffBaseline(previous, { ...previous });
  assert.deepEqual(unchanged.ratchetBroken, [], "存量 5 处裸 table 不该破线");

  const worse = diffBaseline(previous, { ...previous, risks: { "bare-table": 6 } });
  assert.deepEqual(worse.ratchetBroken, ["bare-table 新增 1 处"]);

  const better = diffBaseline(previous, { ...previous, risks: { "bare-table": 2 } });
  assert.deepEqual(better.ratchetBroken, [], "债务下降不该报破线");
  assert.equal(better.riskDelta["bare-table"], -3);
});

test("基线快照不含项目源码", () => {
  const root = makeConsumer({
    files: { "src/Secret.tsx": `import { Button } from "@hulianui/ui"\nconst TOKEN = "sk-live-do-not-leak"\n` },
  });
  withRoot(root, () => {
    const snapshot = JSON.stringify(run(root).baseline.snapshot);
    assert.ok(!snapshot.includes("sk-live-do-not-leak"), "基线要提交进仓库，绝不能夹带源码内容");
    assert.ok(!snapshot.includes("Secret.tsx"), "连文件名都不必带");
  });
});

// ----------------------------------------------------------- 边界与输出 --

test("不读 node_modules 与构建产物", () => {
  const root = makeConsumer({
    files: {
      "src/App.tsx": `import { Button } from "@hulianui/ui"\nexport default Button\n`,
      "dist/bundle.js": `<table>`.repeat(50),
      ".next/chunk.js": `<table>`.repeat(50),
    },
  });
  write(root, "node_modules/some-lib/index.js", `<table>`.repeat(50));
  withRoot(root, () => {
    const r = run(root);
    assert.deepEqual(r.risks, [], "构建产物与依赖里的内容不该进入体检结论");
    assert.ok(r.scanned.files < 10);
  });
});

test("输出是建议不是 error，每条都带置信度", () => {
  const root = makeConsumer({
    files: { "src/App.tsx": `import { Button } from "@hulianui/ui"\nexport default () => <table />\n` },
  });
  withRoot(root, () => {
    const r = run(root);
    assert.ok(!("errors" in r), "audit 不产生 error —— 可静态证明的错误归 guard");
    for (const risk of r.risks) assert.ok(["high", "medium", "low"].includes(risk.confidence));
    for (const o of r.opportunities) assert.ok(["high", "medium", "low"].includes(o.confidence));
    assert.match(renderAudit(r), /带置信度的建议/, "渲染文本必须自陈性质，否则会被当成门禁");
  });
});

test("空项目不炸，且说清是判不出而非没问题", () => {
  const root = makeConsumer();
  withRoot(root, () => {
    const r = run(root);
    assert.equal(r.scene.surface, null);
    assert.match(renderAudit(r), /判不出/);
  });
});
