#!/usr/bin/env node
// 瑚琏 Hulian MCP server
//
// 存在的理由：AI 在写业务时对这个库只有两种消费方式 —— 整吞 1.1M 的 llms-full.txt
// （吃掉大量 context），或者凭印象猜。猜的代价是实测过的：
//   toast.success(...)        真签名是 toast({ title, tone })
//   <Badge variant="...">     Badge 没有 variant，该用 Tag
//   <Heading size="md">       没有 md 这一档
//   fill={var(--primary)}     必须 var(--color-primary)，否则不解析
//
// 八个 tool 覆盖一条完整链路：
//   认项目 inspect_project → 选积木 recommend_ui / list_components →
//   查用法 get_component_doc / get_conventions / get_setup_guide →
//   落地 install_block → 验收 validate_hulian_usage
//
// 用法（Claude Code / Cursor 的 mcpServers 配置）：
//   { "hulianui": { "command": "npx", "args": ["-y", "@hulianui/mcp"] } }
// 在瑚琏 monorepo 里开发时加 env，改完源码即刻生效、零网络：
//   { "env": { "HULIAN_UI_ROOT": "/path/to/hulian/packages/ui" } }

import { createRequire } from "node:module";
import { resolve } from "node:path";

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  GetPromptRequestSchema,
  ListPromptsRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

import {
  itemUrlOf,
  loadConventions,
  loadDoc,
  loadItem,
  loadRegistry,
  localSlugs,
  source,
  sourceInfo,
  sourceLine,
} from "./data.mjs";
import {
  composeProfile,
  listModifiers,
  listSurfaces,
  listWorkflows,
} from "./profiles.mjs";
import { inspectProject, installedVersion, renderProject } from "./project.mjs";
import { rank } from "./search.mjs";
import { SETUP_TARGETS, setupGuide } from "./setup.mjs";
import { guardVersion, renderValidation, validateUsage } from "./validate.mjs";

const PKG = "@hulianui/ui";
const VERSION = createRequire(import.meta.url)("../package.json").version;

// ------------------------------------------------------------------ utils --

const text = (body, structured) => ({
  content: [{ type: "text", text: `${body}\n\n---\n${sourceLine()}` }],
  ...(structured ? { structuredContent: { ...structured, source: sourceInfo() } } : {}),
});
/** isError 只用于「工具没能完成工作」：参数错、读不到文件、数据源坏了。业务代码违规不算。 */
const fail = (body) => ({ content: [{ type: "text", text: body }], isError: true });

/** 编辑距离。前缀/包含匹配救不了拼写错误（buton→button 就一个字母之差），而拼错正是最常见的情形。 */
function editDistance(a, b) {
  if (a === b) return 0;
  if (!a.length || !b.length) return Math.max(a.length, b.length);
  let prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    const cur = [i];
    for (let j = 1; j <= b.length; j++) {
      cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    }
    prev = cur;
  }
  return prev[b.length];
}

/** 名字打错时给出最接近的候选，而不是干巴巴一句 not found（AI 会据此自我纠正）。 */
function suggest(name, names) {
  const n = String(name).toLowerCase().replace(/[^a-z0-9]/g, "");
  if (!n) return [];
  const tolerance = Math.max(1, Math.floor(n.length / 4));
  const scored = [];
  for (const c of new Set(names)) {
    const k = c.toLowerCase().replace(/[^a-z0-9]/g, "");
    let score = 0;
    if (k === n) score = 100;
    else if (k.startsWith(n) || n.startsWith(k)) score = 80;
    else if (k.includes(n) || n.includes(k)) score = 60;
    else {
      const d = editDistance(n, k);
      if (d <= tolerance) score = 50 - d;
    }
    if (score > 0) scored.push({ c, score });
  }
  return scored
    .sort((a, b) => b.score - a.score || a.c.length - b.c.length)
    .slice(0, 5)
    .map((x) => x.c);
}

const KIND_OF = (item) =>
  item.type === "registry:block"
    ? item.name.startsWith("page-")
      ? "page"
      : "block"
    : item.type === "registry:lib"
      ? "lib"
      : "component";

/** 长 exports 会把清单撑爆（password-generator 有 19 个），列表里折叠，详情里给全。 */
function importLine(item) {
  const raw = item.meta?.import;
  if (!raw) return "";
  const exported = item.meta?.exports ?? [];
  if (exported.length <= 4) return raw;
  const entry = raw.match(/from\s+"([^"]+)"/)?.[1] ?? PKG;
  return `import { ${exported.slice(0, 3).join(", ")}, …+${exported.length - 3} } from "${entry}"`;
}

const briefLine = (item) =>
  `- ${item.name}${item.title && item.title !== item.name ? ` (${item.title})` : ""}: ${
    item.description ?? ""
  }${importLine(item) ? ` | ${importLine(item)}` : ""}`;

const compact = (item, extra = {}) => ({
  name: item.name,
  kind: KIND_OF(item),
  title: item.title ?? null,
  description: item.description ?? null,
  categories: item.categories ?? [],
  import: item.meta?.import ?? null,
  exports: item.meta?.exports ?? [],
  ...extra,
});

/** registry 里真实存在的分类。schema 里写死过 `form`，而真 key 是 `forms` —— 前者永远返回 0。 */
async function categoryKeys() {
  const reg = await loadRegistry();
  const keys = new Set();
  for (const item of reg.items) for (const category of item.categories ?? []) keys.add(category);
  return [...keys].sort();
}

// ------------------------------------------------------------------ tools --

const KIND_ENUM = ["component", "block", "page", "lib", "all"];
const DOC_SECTIONS = ["when", "import", "props", "events", "slots", "examples", "pitfalls", "related"];

const READ_ONLY = {
  readOnlyHint: true,
  destructiveHint: false,
  idempotentHint: true,
  openWorldHint: false,
};
/** 远程数据源意味着结果取决于外部服务，openWorld 得如实标出来。 */
const REMOTE_AWARE = { ...READ_ONLY, openWorldHint: source.startsWith("remote:") };

async function buildTools() {
  const categories = await categoryKeys().catch(() => []);
  return [
    {
      name: "inspect_project",
      title: "探测消费项目",
      description:
        "读消费项目的已知配置文件，返回框架 / 包管理器 / 瑚琏包实装版本 / components.json / " +
        "ThemeProvider 与 token CSS 等接入状态，以及针对这个项目的导入策略建议。" +
        "开工前先调它一次，别再靠 grep package.json 倒推。只读，不改任何文件，不读 .env。",
      inputSchema: {
        type: "object",
        properties: {
          projectRoot: {
            type: "string",
            description: "项目根目录绝对路径。不传则优先用 MCP Roots，最后才退到 server 进程的 cwd（会在响应里标明来源）",
          },
        },
      },
      outputSchema: {
        type: "object",
        properties: {
          projectRoot: { type: "string" },
          projectRootSource: { type: "string", enum: ["argument", "mcp-roots", "cwd-fallback"] },
          packageManager: { type: ["string", "null"] },
          framework: { type: "object" },
          packages: { type: "object" },
          setup: { type: "object" },
          importStrategy: { type: "object" },
          warnings: { type: "array", items: { type: "string" } },
        },
        required: ["projectRoot", "projectRootSource", "framework", "packages", "setup", "warnings"],
      },
      annotations: READ_ONLY,
    },
    {
      name: "recommend_ui",
      title: "按任务推荐积木",
      description:
        "用一句业务需求（如「用户管理列表页：查询、分页表格、批量操作、新增编辑弹窗」）换回" +
        "排好序的**页面 → 区块 → 组件**组合。选型从这里开始：先看有没有现成整页/区块可用，" +
        "再决定要不要自己拼组件。",
      inputSchema: {
        type: "object",
        properties: {
          task: { type: "string", description: "要做的东西，用自然语言描述，越具体越好" },
          limit: { type: "number", description: "每档返回条数，默认 5" },
        },
        required: ["task"],
      },
      outputSchema: {
        type: "object",
        properties: {
          task: { type: "string" },
          pages: { type: "array", items: { type: "object" } },
          blocks: { type: "array", items: { type: "object" } },
          components: { type: "array", items: { type: "object" } },
        },
        required: ["task", "pages", "blocks", "components"],
      },
      annotations: REMOTE_AWARE,
    },
    {
      name: "list_components",
      title: "浏览 / 搜索积木",
      description:
        "列出或搜索瑚琏 @hulianui/ui 里的积木。kind 可选 component / block（可直接落盘的区块）/ " +
        "page（整页模板）/ lib / all，不传只列组件。query 会分词后按 name/title/description/" +
        "category/group/tags/exports 打分排序；结果多时用 limit + offset 翻页，不要一次拉全库。",
      inputSchema: {
        type: "object",
        properties: {
          kind: { type: "string", enum: KIND_ENUM, description: "积木粒度，默认 component" },
          query: { type: "string", description: "关键词，中英皆可（「弹窗」也能找到 dialog）" },
          category: {
            type: "string",
            description: `分类 key（由 registry 真实分类枚举得到）`,
            ...(categories.length ? { enum: categories } : {}),
          },
          limit: { type: "number", description: "返回上限，默认 30，最大 100" },
          offset: { type: "number", description: "跳过前 N 条，用于翻页，默认 0" },
        },
      },
      outputSchema: {
        type: "object",
        properties: {
          total: { type: "number" },
          offset: { type: "number" },
          limit: { type: "number" },
          degraded: { type: "boolean", description: "true 表示指定 kind 内零命中，返回的是跨 kind 的弱相关结果" },
          items: { type: "array", items: { type: "object" } },
        },
        required: ["total", "offset", "limit", "items"],
      },
      annotations: REMOTE_AWARE,
    },
    {
      name: "get_component_doc",
      title: "取组件用法文档",
      description:
        "取组件的用法文档：Props / Events / Slots / 可运行示例 / 禁忌坑 / 相关件。" +
        "在写下第一行使用该组件的代码之前调用它 —— 这是避免猜错 props 签名的唯一可靠手段。" +
        "支持一次传多个组件（names），也支持只取需要的章节（sections）以省 context。",
      inputSchema: {
        type: "object",
        properties: {
          name: { type: "string", description: "组件 slug（如 pro-table）或显示名（如 ProTable）" },
          names: {
            type: "array",
            items: { type: "string" },
            description: "一次取多个组件（最多 6 个），用于多组件选型，省掉 N 次往返",
          },
          sections: {
            type: "array",
            items: { type: "string", enum: DOC_SECTIONS },
            description: "只取指定章节，默认全文。props/pitfalls 通常就够写对代码",
          },
        },
      },
      annotations: REMOTE_AWARE,
    },
    {
      name: "get_conventions",
      title: "取使用约束",
      description:
        "取瑚琏的**强制使用约束**：必须被哪些 Provider 包裹、哪些 prop 只接受 token、" +
        "哪些写法被禁止、哪些是易混淆的兄弟件。开始一个新页面/新功能前必调一次；" +
        "这些约束违反后往往在运行时才报错，或者根本不报错只是变丑。可执行的那部分由 " +
        "validate_hulian_usage 真正检查。",
      inputSchema: {
        type: "object",
        properties: {
          scope: { type: "string", description: "可选，限定到某个组件名，只返回与它相关的约束" },
        },
      },
      annotations: REMOTE_AWARE,
    },
    {
      name: "get_setup_guide",
      title: "取消费方接入指南",
      description:
        "取接入约束：安装与 peer、token CSS 与 Tailwind @source、根 barrel vs 子路径、" +
        "Next 的 transpilePackages/optimizePackageImports、Vite 软链预构建插件、Vitest 预设。" +
        "配合 inspect_project 的 warnings 使用：缺哪项取哪片。",
      inputSchema: {
        type: "object",
        properties: {
          target: {
            type: "string",
            enum: [...SETUP_TARGETS, "all"],
            description: "要取哪一片，默认全部",
          },
        },
      },
      annotations: READ_ONLY,
    },
    {
      name: "get_agent_profile",
      title: "取场景 profile（组件语言 + 约束 + 步骤）",
      description:
        "按场景取「该用什么组件语言、受什么约束、按什么步骤走」。三维正交：" +
        "surface 决定组件语言（admin-console / config-tool / ai-product / content-brand / desktop-shell）、" +
        "modifiers 决定约束与预算且可组合（mobile / dashboard / data-dense / marketing / high-performance）、" +
        "workflow 决定步骤（prototype / build / audit / dogfood / migrate）。" +
        "不传参数则列出全部可选值与判定信号。" +
        "componentRoles 取自 12 个真实消费项目的扫描，不是凭印象列的；" +
        "拿到候选后仍须用 get_component_doc 查真实 props，本 tool 不代替文档。",
      inputSchema: {
        type: "object",
        properties: {
          surface: {
            type: "string",
            enum: listSurfaces().map((s) => s.id),
            description: "页面形态，决定组件语言",
          },
          modifiers: {
            type: "array",
            items: { type: "string", enum: listModifiers().map((m) => m.id) },
            description: "可组合的修饰维度，如移动端 AI 产品 = ai-product + [mobile]",
          },
          workflow: {
            type: "string",
            enum: listWorkflows().map((w) => w.id),
            description: "任务性质，决定步骤。原型阶段选 prototype，不会被要求用全套企业件",
          },
        },
      },
      annotations: READ_ONLY,
    },
    {
      name: "install_block",
      title: "取区块 / 页面源码与安装命令",
      description:
        "取区块 / 页面 / 组件的可注入源码，用于「把这块积木放进我的项目」。" +
        "区块只从 @hulianui/ui 根 barrel 导入；页面会递归安装它组合的区块。" +
        "组件通常不需要注入 —— 直接 npm import 即可，只有要魔改组件本身时才注入。",
      inputSchema: {
        type: "object",
        properties: {
          name: { type: "string", description: "item 名（区块如 block-pricing-table，页面如 page-pricing，组件如 button）" },
          includeSource: { type: "boolean", description: "是否返回完整源码，默认 true。false 时只返回安装命令与元信息" },
        },
        required: ["name"],
      },
      annotations: REMOTE_AWARE,
    },
    {
      name: "validate_hulian_usage",
      title: "校验瑚琏用法（guard）",
      description:
        "对刚写完的文件跑 @hulianui/guard 的可执行门禁，返回带 ruleId / file / line / column 的" +
        "结构化诊断。**改完瑚琏相关代码必须调一次**：typecheck 查不出 style 覆盖、" +
        "toast.success、颜色 token 缺前缀、私有深导入这些约束。" +
        "代码违规时返回 ok:false（这不是工具失败）；它也不改你的文件，修完再调一次复验。",
      inputSchema: {
        type: "object",
        properties: {
          files: {
            type: "array",
            items: { type: "string" },
            description: "要检查的文件路径（相对 projectRoot 或绝对路径）",
          },
          code: { type: "string", description: "还没落盘的源码，可在写文件前先验" },
          filePath: { type: "string", description: "配合 code 使用，决定按 tsx/ts 哪种语法解析" },
          projectRoot: { type: "string", description: "相对路径的基准目录，默认 server 进程 cwd" },
        },
      },
      outputSchema: {
        type: "object",
        properties: {
          ok: { type: "boolean" },
          summary: { type: "object" },
          diagnostics: { type: "array", items: { type: "object" } },
          checked: { type: "array", items: { type: "string" } },
          skipped: { type: "array", items: { type: "object" } },
          versions: { type: "object" },
        },
        required: ["ok", "summary", "diagnostics"],
      },
      annotations: READ_ONLY,
    },
  ];
}

// ---------------------------------------------------------------- handlers --

const clamp = (value, fallback, max) => {
  const number = Number(value);
  if (!Number.isFinite(number) || number < 0) return fallback;
  return Math.min(Math.floor(number), max);
};

async function listComponents({ kind = "component", query, category, limit, offset } = {}) {
  if (!KIND_ENUM.includes(kind)) return fail(`kind 只能是 ${KIND_ENUM.join(" / ")}，收到 "${kind}"`);
  const take = clamp(limit, 30, 100);
  const skip = clamp(offset, 0, 100000);

  const reg = await loadRegistry();
  const inKind = (item) => (kind === "all" ? true : KIND_OF(item) === kind);

  if (category) {
    const keys = await categoryKeys();
    if (!keys.includes(category)) {
      const near = suggest(category, keys);
      return fail(
        `没有分类 "${category}"。` +
          (near.length ? `是不是：${near.join(" / ")}？` : "") +
          `\n全部分类：${keys.join(" / ")}`,
      );
    }
  }

  const base = reg.items.filter(
    (item) => inKind(item) && (!category || (item.categories ?? []).includes(category)),
  );

  if (!query) {
    const shown = base.slice(skip, skip + take);
    return text(
      renderList({
        header: `瑚琏 ${kind} 共 ${base.length} 个`,
        total: base.length,
        skip,
        take,
        shown,
      }),
      { total: base.length, offset: skip, limit: take, degraded: false, items: shown.map((i) => compact(i)) },
    );
  }

  let { results, primaryCount } = rank(base, query);
  let degraded = false;
  let note = "";

  // 零结果**不等于**不存在。先跨 kind 再找一轮，再把弱相关也交出去 ——
  // #36 里模型正是因为一次 0 命中就断言「没有可复用的页面或区块」，
  // 而 page-admin-list / block-data-table 一直躺在 registry 里。
  if (!results.length && kind !== "all") {
    const wider = rank(reg.items, query);
    if (wider.results.length) {
      results = wider.results;
      primaryCount = wider.primaryCount;
      degraded = true;
      note = `在 ${kind} 里没有命中，下面是跨全部粒度的结果（kind 见每条前缀）。`;
    }
  }
  if (!results.length) {
    return text(
      `「${query}」在 ${kind} 里没有命中，跨粒度也没有。可以：\n` +
        `- 换更短的词（「表格」而不是「可编辑的数据表格组件」）\n` +
        `- 用 recommend_ui 传整句任务描述\n` +
        `- 不带 query 按 category 浏览`,
      { total: 0, offset: skip, limit: take, degraded: true, items: [] },
    );
  }

  const full = results.filter((entry) => entry.coverage >= primaryCount && primaryCount > 0);
  const partial = results.filter((entry) => !(entry.coverage >= primaryCount && primaryCount > 0));
  const ordered = [...full, ...partial];
  const shown = ordered.slice(skip, skip + take);
  const lines = shown.map((entry) => {
    const prefix = degraded || kind === "all" ? `[${KIND_OF(entry.item)}] ` : "";
    const weak = full.length && entry.coverage < primaryCount ? " ← 可能相关" : "";
    return `${prefix}${briefLine(entry.item)}${weak}`;
  });

  const header =
    `「${query}」在 ${kind} 里命中 ${ordered.length} 条` +
    (full.length ? `（其中 ${full.length} 条覆盖全部关键词）` : "（均为部分匹配，按相关度排序）");

  return text(
    [
      header,
      note,
      "",
      ...lines,
      "",
      ordered.length > skip + shown.length
        ? `还有 ${ordered.length - skip - shown.length} 条，用 offset=${skip + take} 继续翻。`
        : "",
      `以每条后面的 import 为准；折叠成 …+N 的用 get_component_doc 取完整导出。`,
    ]
      .filter(Boolean)
      .join("\n"),
    {
      total: ordered.length,
      offset: skip,
      limit: take,
      degraded,
      items: shown.map((entry) =>
        compact(entry.item, { score: entry.score, coverage: entry.coverage, matched: entry.matched }),
      ),
    },
  );
}

function renderList({ header, total, skip, take, shown }) {
  const more = total > skip + shown.length;
  return [
    `${header}${more ? `，下面是第 ${skip + 1}–${skip + shown.length} 条` : ""}。` +
      `从根 barrel 导入：import { X } from "${PKG}"，以每条后面的 import 为准；` +
      `只用少数几个组件时也可以走子路径 ${PKG}/<slug>。`,
    "",
    ...shown.map(briefLine),
    more ? `\n还有 ${total - skip - shown.length} 条，用 offset=${skip + take} 继续翻。` : "",
  ]
    .filter(Boolean)
    .join("\n");
}

async function recommendUi({ task, limit } = {}) {
  if (!task || !String(task).trim()) return fail("recommend_ui 需要 task：一句话说清要做什么。");
  const take = clamp(limit, 5, 20);
  const reg = await loadRegistry();
  const { results } = rank(reg.items, task);
  if (!results.length) {
    return text(
      `「${task}」没有直接命中。换更短的关键词，或用 list_components 按 category 浏览。`,
      { task, pages: [], blocks: [], components: [] },
    );
  }
  const byKind = (kind, count) =>
    results.filter((entry) => KIND_OF(entry.item) === kind).slice(0, count);

  const pages = byKind("page", Math.min(take, 5));
  const blocks = byKind("block", take);
  const components = byKind("component", take + 3);

  const section = (title, entries, hint) =>
    entries.length
      ? [`## ${title}`, "", ...entries.map((entry) => `${briefLine(entry.item)}`), "", hint, ""]
      : [];

  const body = [
    `# 「${task}」的选型建议`,
    "",
    "按「先整页 → 再区块 → 最后自己拼组件」的顺序看，能省掉大量重复搭建。",
    "",
    ...section(
      "整页模板（page）",
      pages,
      "→ `install_block({ name })` 取源码；页面会递归带出它组合的区块。",
    ),
    ...section(
      "区块（block）",
      blocks,
      "→ `install_block({ name })` 直接落盘；区块只从根 barrel 导入，自包含。",
    ),
    ...section(
      "组件（component）",
      components,
      "→ 直接 npm import；写代码前先 `get_component_doc({ names: [...] })` 对 props。",
    ),
    "下一步：选定后调 get_conventions 拿硬约束，写完调 validate_hulian_usage 复验。",
  ];

  return text(body.join("\n"), {
    task,
    pages: pages.map((entry) => compact(entry.item, { score: entry.score })),
    blocks: blocks.map((entry) => compact(entry.item, { score: entry.score })),
    components: components.map((entry) => compact(entry.item, { score: entry.score })),
  });
}

const SECTION_TITLES = {
  when: "何时用",
  import: "导入",
  props: "Props",
  events: "Events",
  slots: "Slots",
  examples: "示例",
  pitfalls: "禁忌 / 坑",
  related: "相关",
};

/** 按 H2 切文档；只取需要的章节能把一次 doc 调用从几千 token 压到几百。 */
function sliceSections(doc, sections) {
  if (!sections?.length) return doc;
  const wanted = new Set(
    sections.map((key) => SECTION_TITLES[key]).filter(Boolean),
  );
  if (!wanted.size) return doc;
  const lines = doc.split("\n");
  const head = [];
  const out = [];
  let keeping = null;
  for (const line of lines) {
    const heading = line.match(/^##\s+(.+?)\s*$/);
    if (heading) {
      keeping = wanted.has(heading[1]) ? heading[1] : null;
      if (keeping) out.push(line);
      continue;
    }
    if (keeping) out.push(line);
    else if (!out.length && line.startsWith("#")) head.push(line);
  }
  return out.length ? [...head, "", ...out].join("\n") : doc;
}

async function getComponentDoc({ name, names, sections } = {}) {
  const wanted = (Array.isArray(names) && names.length ? names : name ? [name] : []).slice(0, 6);
  if (!wanted.length) return fail("get_component_doc 需要 name（或 names 数组）。");
  if (sections && !Array.isArray(sections)) return fail("sections 必须是数组。");

  const reg = await loadRegistry();
  const all = reg.items.filter((item) => item.type === "registry:ui");
  const parts = [];
  const missing = [];

  for (const query of wanted) {
    const slug = String(query)
      .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
      .toLowerCase();
    const hit =
      all.find((item) => item.name === query) ||
      all.find((item) => (item.title || "").toLowerCase() === String(query).toLowerCase()) ||
      all.find((item) => item.name === slug);
    if (!hit) {
      missing.push(query);
      continue;
    }
    const doc = await loadDoc(hit.name);
    if (!doc) {
      missing.push(`${query}（存在但取不到正文）`);
      continue;
    }
    const header = [
      `<!-- ${hit.name} · 导入：${hit.meta?.import ?? `import { ... } from "${PKG}"`} -->`,
      hit.dependencies?.length ? `<!-- 额外 npm 依赖：${hit.dependencies.join(", ")} -->` : "",
    ]
      .filter(Boolean)
      .join("\n");
    parts.push(`${header}\n\n${sliceSections(doc, sections)}`);
  }

  if (!parts.length) {
    const cands = suggest(wanted[0], all.map((item) => item.name).concat(localSlugs() || []));
    return fail(
      `没有名为 "${wanted.join(" / ")}" 的组件。` +
        (cands.length ? `是不是想找：${cands.join(" / ")}？` : "用 list_components 看有哪些。"),
    );
  }
  const tail = missing.length ? `\n\n> 未取到：${missing.join(" / ")}` : "";
  return text(parts.join("\n\n<!-- ──────────────────────────── -->\n\n") + tail);
}

async function installBlock({ name, includeSource = true } = {}) {
  if (!name) return fail("install_block 需要 name。");
  const reg = await loadRegistry();
  let item;
  try {
    item = await loadItem(name);
  } catch (error) {
    const cands = suggest(name, reg.items.map((i) => i.name));
    return fail(
      `registry 里没有 "${name}"（${error.message}）。` +
        (cands.length ? `是不是：${cands.join(" / ")}？` : "用 list_components 查。"),
    );
  }
  const kind = KIND_OF(item);
  const url = itemUrlOf(reg, item.name);
  // 本地数据源 + 没配 registry URL = 拿不出同源端点。此时给命令等于让人装回线上旧内容，
  // 所以只给「怎么落盘」的实话，宁可少一条可复制的命令。
  const cmd = url
    ? `安装命令：\`npx shadcn@latest add ${url}\``
    : `⚠️ 没有同源的安装端点：源码来自本地工作区（${source}），而线上 /r/${item.name}.json 是**已发布**版本，` +
      `两者未必一致。请直接把下面的文件按 target 路径落盘；` +
      `想用 \`npx shadcn add\` 就先发布，或起一个本地 registry 并设 HULIAN_REGISTRY_URL 指向它。`;
  const recursive = (item.registryDependencies || []).map((dependency) =>
    dependency.replace(/\.json$/, "").split("/").pop(),
  );
  const installation = item.meta?.installation;
  const targets = (item.files || []).map((file) => file.target || file.path).filter(Boolean);
  const head = [
    `# ${item.title || item.name}（${kind}）`,
    item.description ? `\n${item.description}` : "",
    "",
    cmd,
    item.dependencies?.length ? `npm 依赖：${item.dependencies.join(", ")}` : "",
    recursive.length
      ? `需要递归安装的区块：${recursive.join(", ")}${
          url ? "" : "（本地模式没有同源端点，这些区块也要一并手工落盘）"
        }`
      : "",
    installation?.providers?.length ? `需要 Provider：${installation.providers.join(", ")}` : "",
    installation?.replace?.length ? `必须替换：${installation.replace.join(", ")}` : "",
    installation?.slots?.length ? `可替换插槽：${installation.slots.join(", ")}` : "",
    kind === "component"
      ? `\n⚠️ 组件一般**不需要注入源码** —— 直接 \`${item.meta?.import ?? `import { ... } from "${PKG}"`}\` 即可。只有要魔改组件本身时才注入。`
      : recursive.length
        ? url
          ? `\n这是组合页面；shadcn 会先递归安装上面的区块，再写入页面源码。`
          : `\n这是组合页面：先分别 install_block 取上面每个区块的源码落盘，再写入本页源码。`
        : `\n这是自包含积木：只从 "${PKG}" 根 barrel 导入。`,
    kind !== "component" && targets.length
      ? `安装后必须验收：\`validate_hulian_usage({ files: ${JSON.stringify(targets)} })\`` +
        `（等价 CLI：\`npx -y @hulianui/guard ${targets.join(" ")}\`）`
      : "",
  ]
    .filter(Boolean)
    .join("\n");

  if (!includeSource) {
    return text(
      url ? head : `${head}\n\n没有同源端点时请用 includeSource: true 取源码 —— 否则这次调用给不出可落地的东西。`,
    );
  }
  const files = (item.files || []).map((f) => `\n## ${f.target || f.path}\n\n\`\`\`tsx\n${f.content}\n\`\`\``);
  return text(`${head}\n${files.join("\n")}`);
}

async function getConventions({ scope } = {}) {
  let conv;
  try {
    conv = await loadConventions();
  } catch (e) {
    return fail(`取不到约束数据（数据源 ${source}）：${e.message}`);
  }
  const out = [];
  // 组件级 rule 是从 md 的「禁忌 / 坑」原样提取的，本身就带 markdown 强调；
  // 再包一层会渲染成 `****文字**`。只给纯文本的手写 global rule 加粗。
  const rule = (r) => {
    const body = r.rule.includes("**") ? r.rule : `**${r.rule}**`;
    return (
      `- ${body}` +
      (r.why ? `\n  - 为什么：${r.why}` : "") +
      (r.instead ? `\n  - 该怎么做：${r.instead}` : "") +
      (r.wrong ? `\n  - ❌ \`${r.wrong}\`` : "") +
      (r.right ? `\n  - ✅ \`${r.right}\`` : "")
    );
  };

  if (conv.version === "2") {
    const executable = conv.executableRules || [];
    const advisories = conv.advisories || [];
    if (!scope) {
      out.push("# 瑚琏使用约束\n");
      out.push("## 可执行门禁（@hulianui/guard）\n");
      for (const item of executable) {
        out.push(
          `- **[${item.severity}] ${item.id}**：${item.message}` +
            (item.instead ? `\n  - 该怎么做：${item.instead}` : ""),
        );
      }
      out.push(
        `\n改完代码调 \`validate_hulian_usage({ files: [...] })\` 直接验（等价 CLI：\`npx -y @hulianui/guard <files...>\`）。` +
          `以上 ${executable.length} 条可由 AST 稳定检查。`,
      );
      const globalAdvisories = advisories.filter((item) => item.scope === "global");
      out.push("\n## 建议（需要业务判断，不冒充硬门禁）\n");
      for (const item of globalAdvisories) out.push(rule(item));
      if (conv.confusables?.length) {
        out.push("\n## 易混淆的兄弟件（选错不会报错，只是不对）\n");
        for (const c of conv.confusables) {
          out.push(`- 要「${c.when}」→ 用 **${c.pick}**，不是 ${c.notThis}。${c.why ? `（${c.why}）` : ""}`);
        }
      }
      const scopes = new Set(advisories.map((item) => item.scope).filter((value) => value && value !== "global"));
      out.push(`\n## 组件建议索引\n\n${scopes.size} 个组件有专属建议；传 scope 可按组件取回。`);
      return text(out.join("\n"));
    }

    const key = String(scope).replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase();
    const scoped = advisories.filter((item) => item.scope === key || item.scope === scope);
    if (!scoped.length) {
      return text(`${scope} 没有专属建议；仍需遵守不带 scope 时返回的可执行门禁与全局建议。`);
    }
    out.push(`# ${scope} 的使用建议\n`);
    for (const item of scoped) out.push(rule(item));
    return text(out.join("\n"));
  }

  // v1 兼容分支：线上旧 conventions 在滚动发布期间仍可读一个版本。
  if (!scope) {
    out.push("# 瑚琏使用约束（违反后多数在运行时才报错，或根本不报错只是变丑）\n");
    for (const g of conv.global || []) out.push(rule(g));
    if (conv.confusables?.length) {
      out.push("\n## 易混淆的兄弟件（选错不会报错，只是不对）\n");
      for (const c of conv.confusables) {
        out.push(`- 要「${c.when}」→ 用 **${c.pick}**，不是 ${c.notThis}。${c.why ? `（${c.why}）` : ""}`);
      }
    }
    const compKeys = Object.keys(conv.components || {});
    if (compKeys.length) {
      out.push(`\n## 组件级约束\n\n以下 ${compKeys.length} 个组件有各自的硬约束，用 scope 参数取：${compKeys.join(" / ")}`);
    }
    return text(out.join("\n"));
  }

  const key = String(scope).replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase();
  const c = (conv.components || {})[key] || (conv.components || {})[scope];
  if (!c) return text(`${scope} 没有专属约束，遵守全局约束即可（不带 scope 再调一次可看全局）。`);
  out.push(`# ${scope} 的硬约束\n`);
  for (const r of c.rules || []) out.push(rule(r));
  return text(out.join("\n"));
}

async function getSetupGuide({ target } = {}) {
  const guide = setupGuide(target);
  if (!guide.ok) return fail(guide.text);
  return text(guide.text);
}

/** 没传任何维度时，列出可选值与判定信号，让模型自己对号入座。 */
function renderProfileCatalog() {
  const lines = ["瑚琏场景 profile · 三维正交（surface 组件语言 / modifiers 约束 / workflow 步骤）", ""];
  lines.push("## surface —— 决定用什么组件语言");
  for (const s of listSurfaces()) {
    lines.push(`\n### ${s.id}`, s.intent);
    if (s.maturity) lines.push(`⚠️ ${s.maturity}`);
    if (s.signals?.length) lines.push(`判定信号：${s.signals.join("；")}`);
    lines.push(`实证来源：${(s.evidence ?? []).join("、") || "—"}`);
  }
  lines.push("", "## modifiers —— 可组合，决定约束与预算");
  for (const m of listModifiers())
    lines.push(`- **${m.id}**：${m.intent}${m.signals?.length ? `（信号：${m.signals.join("；")}）` : ""}`);
  lines.push("", "## workflow —— 决定步骤");
  for (const w of listWorkflows()) lines.push(`- **${w.id}**：${w.intent}`);
  lines.push(
    "",
    "带上维度再调一次即可拿到具体的组件候选、约束与验证清单。",
    "例：{ surface: \"ai-product\", modifiers: [\"mobile\"], workflow: \"build\" }",
  );
  return lines.join("\n");
}

function renderComposedProfile(c) {
  const lines = [];
  const title = [
    c.surface ? `surface: ${c.surface.id}` : null,
    c.modifiers.length ? `modifiers: ${c.modifiers.map((m) => m.id).join(" + ")}` : null,
    c.workflow ? `workflow: ${c.workflow.id}` : null,
  ].filter(Boolean);
  lines.push(`# ${title.join(" · ") || "未指定维度"}`);
  if (c.unknown.length) lines.push(`\n⚠️ 无法识别：${c.unknown.join("、")}（已忽略）`);
  if (c.surface?.maturity) lines.push(`\n⚠️ ${c.surface.maturity}`);

  if (c.preferPages.length || c.preferBlocks.length) {
    lines.push("\n## 先看现成的（优先于自己拼组件）");
    if (c.preferPages.length) lines.push(`- 整页：${c.preferPages.join("、")}`);
    if (c.preferBlocks.length) lines.push(`- 区块：${c.preferBlocks.join("、")}`);
    lines.push("用 install_block 落盘，别从低层原语重搭。");
  }

  if (c.surface?.componentRoles) {
    lines.push("\n## 组件语言（按职责）");
    for (const [role, list] of Object.entries(c.surface.componentRoles))
      lines.push(`- **${role}**：${list.join("、")}`);
  }

  const modComps = c.modifiers.flatMap((m) => [
    ...(m.require ?? []).map((s) => `${s}（${m.id} 必需）`),
    ...(m.consider ?? []).map((s) => `${s}（${m.id} 备选）`),
  ]);
  if (modComps.length) lines.push("\n## 修饰维度追加", `- ${modComps.join("\n- ")}`);

  if (c.constraints.length) lines.push("\n## 约束", `- ${c.constraints.join("\n- ")}`);
  if (c.steps.length) lines.push("\n## 步骤", c.steps.map((s, i) => `${i + 1}. ${s}`).join("\n"));
  if (c.verification.length) lines.push("\n## 完成前要验", `- ${c.verification.join("\n- ")}`);

  lines.push(
    "",
    "---",
    "以上是**候选与约束**，不是 props 真源：用到的每个组件在写第一行代码前仍须 get_component_doc。",
  );
  return lines.join("\n");
}

async function getAgentProfile({ surface, modifiers, workflow } = {}) {
  if (!surface && !workflow && !(modifiers?.length)) return text(renderProfileCatalog());
  const composed = composeProfile({ surface, modifiers: modifiers ?? [], workflow });
  return {
    content: [{ type: "text", text: renderComposedProfile(composed) }],
    structuredContent: {
      surface: composed.surface?.id ?? null,
      modifiers: composed.modifiers.map((m) => m.id),
      workflow: composed.workflow?.id ?? null,
      unknown: composed.unknown,
      components: composed.components,
      preferPages: composed.preferPages,
      preferBlocks: composed.preferBlocks,
      constraints: composed.constraints,
      steps: composed.steps,
      verification: composed.verification,
    },
  };
}

/** 客户端声明了 roots 能力才去要；没有就安静退回 cwd（并在响应里标明来源）。 */
async function clientRoots(server) {
  try {
    if (!server.getClientCapabilities()?.roots) return [];
    const result = await server.listRoots();
    return result?.roots ?? [];
  } catch {
    return [];
  }
}

async function inspectProjectTool(args = {}, server) {
  const roots = await clientRoots(server);
  let info;
  try {
    info = inspectProject({ explicit: args.projectRoot, roots });
  } catch (error) {
    return fail(`inspect_project 失败：${error.message}`);
  }
  return {
    content: [{ type: "text", text: renderProject(info) }],
    structuredContent: info,
  };
}

async function validateTool(args = {}) {
  const result = validateUsage(args);
  if (result.invalid) return fail(result.invalid);
  // 「一个文件都没检查成」是工具没能完成工作，必须 isError —— 不能渲染成一句「通过」。
  if (result.unusable) return fail(`validate_hulian_usage 未能检查任何文件：${result.unusable}`);

  // 三个版本是三件事，别混成一个 ui：
  //   guard      门禁本身的版本
  //   registry   本 server 数据源的版本（主动加载，不靠调用顺序碰运气）
  //   consumerUi 消费项目里**实装**的 @hulianui/ui —— 与 registry 不一致才是真正要警觉的漂移
  await loadRegistry().catch(() => null);
  const consumerRoot = args.projectRoot ? resolve(args.projectRoot) : process.cwd();
  const versions = {
    guard: guardVersion(),
    registry: sourceInfo().version,
    consumerUi: installedVersion(consumerRoot, PKG)?.version ?? null,
  };
  return {
    content: [{ type: "text", text: renderValidation(result, { versions }) }],
    structuredContent: { ...result, versions },
    // 刻意不置 isError：代码违规是**结论**，不是工具故障。
  };
}

const HANDLERS = {
  inspect_project: inspectProjectTool,
  recommend_ui: recommendUi,
  list_components: listComponents,
  get_component_doc: getComponentDoc,
  get_conventions: getConventions,
  get_setup_guide: getSetupGuide,
  get_agent_profile: getAgentProfile,
  install_block: installBlock,
  validate_hulian_usage: validateTool,
};

// ----------------------------------------------------------------- prompts --

const WORKFLOW = `瑚琏 @hulianui/ui 工作流（按顺序，不要跳步）：

1. inspect_project —— 先认项目：框架、实装版本、ThemeProvider / token CSS 是否就位。
2. get_agent_profile —— 再认场景：这个页面该用什么组件语言、受什么约束、按什么步骤走。
   不传参先看目录对号入座；中后台别套营销特效，原型阶段选 workflow=prototype。
3. recommend_ui（整段任务描述）—— 先看有没有现成 page / block，再决定自己拼组件。
4. list_components —— 需要按关键词补齐候选时用；结果多就 limit + offset 翻页，别整吞。
5. get_component_doc —— **用到的每个组件在写第一行代码前必须查**，props 不许猜。
   一次可传多个 names；只要 props / pitfalls 时传 sections 省 context。
6. get_conventions —— 新页面 / 新功能开工前取一次硬约束。
7. get_setup_guide —— inspect_project 报了接入缺口时按 target 取对应片段。
8. install_block —— 落盘区块 / 页面源码。
9. validate_hulian_usage —— **改完瑚琏相关代码必须调**，对变更文件跑一次，修完复验。

硬规则：
- 不猜组件名与 props；不确定就查，查不到就说查不到。
- 同样参数的 tool 不要重复调用。
- guard 通过 ≠ 页面对了：typecheck、单测、交互 / a11y、真实视觉都由别处保证，
  本 server 不冒充它们（有 Storybook MCP 或浏览器 E2E 的项目请照常跑）。
- 组件缺能力时回库补组件，不要在业务里用 style= 或局部 CSS 打补丁。`;

const PROMPTS = [
  {
    name: "hulianui_expert",
    title: "瑚琏用法专家",
    description: "以瑚琏组件库专家身份工作：先查后写、按约束落地、写完用 guard 验收。",
    arguments: [{ name: "task", description: "要完成的事情", required: false }],
    render: (args) =>
      `${WORKFLOW}\n\n${args?.task ? `本次任务：${args.task}` : "等待用户给出任务后按上面的顺序开始。"}`,
  },
  {
    name: "hulianui_page_builder",
    title: "瑚琏整页搭建",
    description: "从一句需求搭出整页：优先复用 page / block，再补组件，最后 guard 验收。",
    arguments: [{ name: "page", description: "要搭的页面，如「用户管理列表页」", required: true }],
    render: (args) =>
      `${WORKFLOW}\n\n要搭的页面：${args?.page ?? "(未指定)"}\n\n` +
      `额外要求：\n` +
      `- 第 2 步必须先跑 recommend_ui，把命中的 page / block 列给用户，再动手写代码。\n` +
      `- 复用整页模板时，用 install_block 取源码并按 installation.replace 里的项逐条替换（mock 数据、文案、事件）。\n` +
      `- 交付前对所有新增 / 修改的文件跑 validate_hulian_usage，并把结果如实回报。`,
  },
];

// ------------------------------------------------------------------- boot --

const server = new Server(
  { name: "hulianui", version: VERSION },
  {
    capabilities: { tools: {}, prompts: {} },
    instructions:
      `瑚琏 Hulian（@hulianui/ui）组件库的官方 MCP。写任何用到本库的 UI 之前先用这里的 tool 查，` +
      `不要凭印象猜组件名或 props。\n\n${WORKFLOW}`,
  },
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools: await buildTools() }));

server.setRequestHandler(ListPromptsRequestSchema, async () => ({
  prompts: PROMPTS.map(({ render: _render, ...rest }) => rest),
}));

server.setRequestHandler(GetPromptRequestSchema, async (req) => {
  const prompt = PROMPTS.find((item) => item.name === req.params.name);
  if (!prompt) throw new Error(`未知 prompt：${req.params.name}`);
  return {
    description: prompt.description,
    messages: [
      { role: "user", content: { type: "text", text: prompt.render(req.params.arguments) } },
    ],
  };
});

server.setRequestHandler(CallToolRequestSchema, async (req) => {
  const fn = HANDLERS[req.params.name];
  if (!fn) return fail(`未知 tool：${req.params.name}`);
  try {
    return await fn(req.params.arguments || {}, server);
  } catch (e) {
    return fail(`${req.params.name} 执行失败（数据源 ${source}）：${e.message}`);
  }
});

const transport = new StdioServerTransport();
await server.connect(transport);
console.error(`[hulianui-mcp] v${VERSION} ready · 数据源 ${source}`);
