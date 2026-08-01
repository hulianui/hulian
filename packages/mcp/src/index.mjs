#!/usr/bin/env node
// 瑚琏 Hulian MCP server
//
// 存在的理由：AI 在写业务时对这个库只有两种消费方式 —— 整吞 1.1M 的 llms-full.txt
// （吃掉大量 context），或者凭印象猜。猜的代价是实测过的：
//   toast.success(...)        真签名是 toast({ title, tone })
//   <Badge variant="...">     Badge 没有 variant，该用 Tag
//   <Heading size="md">       没有 md 这一档
//   fill={var(--primary)}     必须 var(--color-primary)，否则不解析
// 这个 server 把「有什么 / 怎么用 / 不许怎么用」变成四个可按需调用的 tool。
//
// 用法（Claude Code / Cursor 的 mcpServers 配置）：
//   { "hulianui": { "command": "npx", "args": ["-y", "@hulianui/mcp"] } }
// 在瑚琏 monorepo 里开发时加 env，改完源码即刻生效、零网络：
//   { "env": { "HULIAN_UI_ROOT": "/path/to/hulian/packages/ui" } }

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import { loadRegistry, loadItem, loadDoc, loadConventions, localSlugs, source } from "./data.mjs";

const PKG = "@hulianui/ui";

// ------------------------------------------------------------------ utils --

const text = (s) => ({ content: [{ type: "text", text: s }] });
const fail = (s) => ({ content: [{ type: "text", text: s }], isError: true });

/** 编辑距离。前缀/包含匹配救不了拼写错误（buton→button 就一个字母之差），而拼错正是最常见的情形。 */
function editDistance(a, b) {
  if (a === b) return 0;
  if (!a.length || !b.length) return Math.max(a.length, b.length);
  let prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    const cur = [i];
    for (let j = 1; j <= b.length; j++) {
      cur[j] = Math.min(
        prev[j] + 1,
        cur[j - 1] + 1,
        prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1),
      );
    }
    prev = cur;
  }
  return prev[b.length];
}

/** 名字打错时给出最接近的候选，而不是干巴巴一句 not found（AI 会据此自我纠正）。 */
function suggest(name, names) {
  const n = String(name).toLowerCase().replace(/[^a-z0-9]/g, "");
  if (!n) return [];
  // 容忍的编辑距离随词长放宽：短词只容 1 个字母，长词按 1/4 长度
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
      if (d <= tolerance) score = 50 - d; // 拼写错误
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

// ------------------------------------------------------------------ tools --

const TOOLS = [
  {
    name: "list_components",
    description:
      "列出瑚琏 @hulianui/ui 里可用的积木。写任何 UI 之前先调这个，不要凭印象猜组件名或 props。" +
      "kind 可选 component / block（可直接落盘的区块） / page（整页模板） / lib，" +
      "不传则只列组件。query 按名称与描述模糊筛选，category 按分类筛选。",
    inputSchema: {
      type: "object",
      properties: {
        kind: { type: "string", enum: ["component", "block", "page", "lib", "all"], description: "积木粒度，默认 component" },
        query: { type: "string", description: "关键词，模糊匹配名称与描述（如「表格」「拖拽」「图表」）" },
        category: { type: "string", description: "分类 key（如 layout / form / data-display / ai）" },
        limit: { type: "number", description: "返回上限，默认 60" },
      },
    },
  },
  {
    name: "get_component_doc",
    description:
      "取单个组件的完整用法文档：Props / Events / Slots / 可运行示例 / 禁忌坑 / 相关件。" +
      "在写下第一行使用该组件的代码之前调用它 —— 这是避免猜错 props 签名的唯一可靠手段。",
    inputSchema: {
      type: "object",
      properties: { name: { type: "string", description: "组件 slug（如 pro-table）或显示名（如 ProTable）" } },
      required: ["name"],
    },
  },
  {
    name: "install_block",
    description:
      "取区块 / 页面 / 组件的可注入源码，用于「把这块积木放进我的项目」。" +
      "区块与页面是自包含的（只从 @hulianui/ui 根 barrel 导入），拿到即可落盘改业务字段。" +
      "组件通常不需要注入 —— 直接 npm import 即可，只有要魔改组件本身时才注入。",
    inputSchema: {
      type: "object",
      properties: {
        name: { type: "string", description: "item 名（区块如 block-pricing-table，页面如 page-pricing，组件如 button）" },
        includeSource: { type: "boolean", description: "是否返回完整源码，默认 true。false 时只返回安装命令与元信息" },
      },
      required: ["name"],
    },
  },
  {
    name: "get_conventions",
    description:
      "取瑚琏的**强制使用约束**：必须被哪些 Provider 包裹、哪些 prop 只接受 token、" +
      "哪些写法被禁止、哪些是易混淆的兄弟件。" +
      "开始一个新页面/新功能前必调一次；这些约束违反后往往在运行时才报错，或者根本不报错只是变丑。",
    inputSchema: {
      type: "object",
      properties: {
        scope: { type: "string", description: "可选，限定到某个组件名，只返回与它相关的约束" },
      },
    },
  },
];

// ---------------------------------------------------------------- handlers --

async function listComponents({ kind = "component", query, category, limit = 60 }) {
  const reg = await loadRegistry();
  let items = reg.items.filter((i) => (kind === "all" ? true : KIND_OF(i) === kind));
  if (category) items = items.filter((i) => (i.categories || []).includes(category));
  if (query) {
    const q = query.toLowerCase();
    items = items.filter(
      (i) =>
        i.name.toLowerCase().includes(q) ||
        (i.title || "").toLowerCase().includes(q) ||
        (i.description || "").toLowerCase().includes(q),
    );
  }
  const total = items.length;
  const shown = items.slice(0, limit);
  const lines = shown.map((i) => {
    const imp = i.meta?.import ? ` | ${i.meta.import}` : "";
    return `- ${i.name}${i.title && i.title !== i.name ? ` (${i.title})` : ""}: ${i.description}${imp}`;
  });
  const head =
    `瑚琏 ${kind} 共 ${total} 个` +
    (total > shown.length ? `，下面是前 ${shown.length} 个（用 query/category 收窄）` : "") +
    // 逐条后面都带真实 import 行（见上面的 i.meta.import）；库里目前没有子路径入口，
    // 但这句仍以「按每条的 import 为准」收尾 —— 将来再挂子路径时不必回来改文案。
    `。从根 barrel 导入：import { X } from "${PKG}"，以每条后面的 import 为准。`;
  return text([head, "", ...lines].join("\n"));
}

async function getComponentDoc({ name }) {
  const reg = await loadRegistry();
  const all = reg.items.filter((i) => i.type === "registry:ui");
  const hit =
    all.find((i) => i.name === name) ||
    all.find((i) => (i.title || "").toLowerCase() === String(name).toLowerCase()) ||
    all.find((i) => i.name === String(name).replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase());
  if (!hit) {
    const cands = suggest(name, all.map((i) => i.name).concat(localSlugs() || []));
    return fail(
      `没有名为 "${name}" 的组件。` +
        (cands.length ? `是不是想找：${cands.join(" / ")}？` : "用 list_components 看有哪些。"),
    );
  }
  const doc = await loadDoc(hit.name);
  if (!doc) return fail(`组件 ${hit.name} 存在，但取不到文档正文（数据源 ${source}）。`);
  const header = [
    `<!-- ${hit.name} · 导入：${hit.meta?.import ?? `import { ... } from "${PKG}"`} -->`,
    hit.dependencies?.length ? `<!-- 额外 npm 依赖：${hit.dependencies.join(", ")} -->` : "",
  ]
    .filter(Boolean)
    .join("\n");
  return text(`${header}\n\n${doc}`);
}

async function installBlock({ name, includeSource = true }) {
  let item;
  try {
    item = await loadItem(name);
  } catch {
    const reg = await loadRegistry();
    const cands = suggest(name, reg.items.map((i) => i.name));
    return fail(
      `registry 里没有 "${name}"。` + (cands.length ? `是不是：${cands.join(" / ")}？` : "用 list_components 查。"),
    );
  }
  const kind = KIND_OF(item);
  const cmd = `npx shadcn@latest add https://hulianui.haloritual.com/r/${item.name}.json`;
  const head = [
    `# ${item.title || item.name}（${kind}）`,
    item.description ? `\n${item.description}` : "",
    "",
    `安装命令：\`${cmd}\``,
    item.dependencies?.length ? `npm 依赖：${item.dependencies.join(", ")}` : "",
    kind === "component"
      ? `\n⚠️ 组件一般**不需要注入源码** —— 直接 \`${item.meta?.import ?? `import { ... } from "${PKG}"`}\` 即可。只有要魔改组件本身时才注入。`
      : `\n这是自包含积木：只从 "${PKG}" 根 barrel 导入，落盘后改业务字段即可。`,
  ]
    .filter(Boolean)
    .join("\n");

  if (!includeSource) return text(head);
  const files = (item.files || []).map((f) => `\n## ${f.target || f.path}\n\n\`\`\`tsx\n${f.content}\n\`\`\``);
  return text(`${head}\n${files.join("\n")}`);
}

async function getConventions({ scope }) {
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
  if (!c) {
    return text(
      `${scope} 没有专属约束，遵守全局约束即可（不带 scope 再调一次可看全局）。`,
    );
  }
  out.push(`# ${scope} 的硬约束\n`);
  for (const r of c.rules || []) out.push(rule(r));
  return text(out.join("\n"));
}

const HANDLERS = {
  list_components: listComponents,
  get_component_doc: getComponentDoc,
  install_block: installBlock,
  get_conventions: getConventions,
};

// ------------------------------------------------------------------- boot --

const server = new Server(
  { name: "hulianui", version: "0.1.0" },
  { capabilities: { tools: {} } },
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools: TOOLS }));

server.setRequestHandler(CallToolRequestSchema, async (req) => {
  const fn = HANDLERS[req.params.name];
  if (!fn) return fail(`未知 tool：${req.params.name}`);
  try {
    return await fn(req.params.arguments || {});
  } catch (e) {
    return fail(`${req.params.name} 执行失败（数据源 ${source}）：${e.message}`);
  }
});

const transport = new StdioServerTransport();
await server.connect(transport);
console.error(`[hulianui-mcp] ready · 数据源 ${source}`);
