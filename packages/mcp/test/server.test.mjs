// 端到端跑真实的 MCP server：起子进程、走 stdio JSON-RPC、验每个 tool 的真实返回。
// 不 mock 任何东西 —— server 的价值就在于「AI 拿到的是真数据」，mock 掉就什么都没验。

import { test } from "node:test";
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import {
  mkdirSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  rmSync,
  symlinkSync,
  utimesSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const ENTRY = join(HERE, "..", "src", "index.mjs");
const UI_ROOT = join(HERE, "..", "..", "ui");

/**
 * 起一个 server，走完整 MCP 握手（initialize → notifications/initialized），
 * 再发业务请求，按 id 收齐后返回。
 *
 * 注意握手是两步：只发 initialize 不发 initialized 通知，SDK 不会开始处理业务请求。
 * 响应也要按 id 认领 —— initialize 自己会占一条，不能按条数计。
 *
 * roots：传了就声明 roots 能力，并在 server 反向请求 roots/list 时如实作答 ——
 * inspect_project 的「优先用 Roots」这条路必须被真的走一遍，光看 fallback 不算数。
 */
function rpc(requests, { roots = null, cwd, env } = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [ENTRY], {
      cwd,
      env: { ...process.env, HULIAN_UI_ROOT: UI_ROOT, ...env },
      stdio: ["pipe", "pipe", "pipe"],
    });
    const wanted = new Set(requests.map((r) => r.id));
    const byId = new Map();
    let buf = "";
    const timer = setTimeout(() => {
      child.kill();
      reject(new Error(`超时，缺 id：${[...wanted].filter((i) => !byId.has(i)).join(",")}`));
    }, 60000);

    const send = (o) => child.stdin.write(JSON.stringify(o) + "\n");

    child.stdout.on("data", (d) => {
      buf += d.toString();
      let i;
      while ((i = buf.indexOf("\n")) >= 0) {
        const line = buf.slice(0, i).trim();
        buf = buf.slice(i + 1);
        if (!line) continue;
        let msg;
        try {
          msg = JSON.parse(line);
        } catch {
          continue; // 非 JSON 行（server 的 ready 日志走 stderr，这里是保险）
        }
        if (msg.method === "roots/list") {
          send({ jsonrpc: "2.0", id: msg.id, result: { roots: roots ?? [] } });
          continue;
        }
        if (wanted.has(msg.id)) byId.set(msg.id, msg);
        if (byId.size === wanted.size) {
          clearTimeout(timer);
          child.kill();
          resolve(requests.map((r) => byId.get(r.id)));
        }
      }
    });
    child.on("error", reject);

    send({
      jsonrpc: "2.0",
      id: 0,
      method: "initialize",
      params: {
        protocolVersion: "2024-11-05",
        capabilities: roots ? { roots: {} } : {},
        clientInfo: { name: "t", version: "0" },
      },
    });
    send({ jsonrpc: "2.0", method: "notifications/initialized" });
    for (const r of requests) send(r);
  });
}

const call = (id, name, args = {}) => ({
  jsonrpc: "2.0",
  id,
  method: "tools/call",
  params: { name, arguments: args },
});

const bodyOf = (res) => res.result?.content?.[0]?.text ?? "";
const dataOf = (res) => res.result?.structuredContent ?? null;

// --------------------------------------------------------------- fixtures --

const write = (root, rel, content) => {
  const path = join(root, rel);
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, content);
};

/** 消费项目 fixture：一个装好的 Next 项目 / 一个软链的 Vite 项目（缺几项接入）。 */
function makeProject(kind) {
  const root = mkdtempSync(join(tmpdir(), `hulian-${kind}-`));
  write(
    root,
    "node_modules/@hulianui/ui/package.json",
    JSON.stringify({ name: "@hulianui/ui", version: "0.15.1" }),
  );
  // @source 指向的 src/ 必须真的存在：inspect_project 现在会解析路径而不只是文本匹配，
  // fixture 也得忠实反映「装好了」这件事（hulianui/hulian#66）。
  write(root, "node_modules/@hulianui/ui/src/button/button.tsx", "export const Button = () => null\n");
  if (kind === "next") {
    write(root, "pnpm-lock.yaml", "lockfileVersion: '9.0'\n");
    write(
      root,
      "package.json",
      JSON.stringify({
        name: "next-fixture",
        dependencies: {
          next: "16.2.0",
          react: "19.0.0",
          "@base-ui/react": "1.0.0",
          "@hulianui/ui": "^0.15.1",
          "@hulianui/tokens": "^0.3.0",
        },
      }),
    );
    write(
      root,
      "node_modules/@hulianui/tokens/package.json",
      JSON.stringify({ name: "@hulianui/tokens", version: "0.3.0" }),
    );
    write(
      root,
      "next.config.mjs",
      `export default {
  transpilePackages: ["@hulianui/ui"],
  experimental: { optimizePackageImports: ["@hulianui/ui"] },
}\n`,
    );
    write(root, "components.json", JSON.stringify({ aliases: { components: "@/components" } }));
    write(
      root,
      "app/layout.tsx",
      // ConfigProvider 是「接好了」的一部分：漏了组件内置文案静默回退 zh-CN（hulianui/hulian#164）
      `import { ThemeProvider, ConfigProvider, enUS } from "@hulianui/ui"
export default function Layout({ children }) {
  return <html><body><ThemeProvider><ConfigProvider locale={enUS}>{children}</ConfigProvider></ThemeProvider></body></html>
}\n`,
    );
    write(
      root,
      "app/globals.css",
      `@import "@hulianui/tokens/tokens.css";
@import "@hulianui/tokens/preset.css";
@source "../node_modules/@hulianui/ui/src/**/*.{ts,tsx}";\n`,
    );
    return root;
  }
  // vite：软链消费、没加 vite 插件、没引 token CSS、入口里没有 ThemeProvider
  write(root, "yarn.lock", "");
  write(
    root,
    "package.json",
    JSON.stringify({
      name: "vite-fixture",
      dependencies: { react: "19.0.0", "@hulianui/ui": "link:../hulian/packages/ui" },
      devDependencies: { vite: "7.3.6" },
    }),
  );
  write(root, "vite.config.ts", `export default { plugins: [] }\n`);
  write(root, "src/main.tsx", `import App from "./App"\nexport default App\n`);
  write(root, "src/index.css", `@import "tailwindcss";\n`);
  return root;
}

// ------------------------------------------------------------------ tools --

test("tools/list 暴露完整链路的十个 tool，且都带 title 与只读标注", async () => {
  const [list] = await rpc([{ jsonrpc: "2.0", id: 1, method: "tools/list" }]);
  const tools = list.result?.tools ?? [];
  assert.deepEqual(
    tools.map((t) => t.name).sort(),
    [
      "audit_hulian_adoption",
      "get_agent_profile",
      "get_component_doc",
      "get_conventions",
      "get_setup_guide",
      "insp" + "ect_project",
      "install_block",
      "list_components",
      "recommend_ui",
      "validate_hulian_usage",
    ].sort(),
  );
  for (const tool of tools) {
    assert.ok(tool.title, `${tool.name} 缺 title`);
    assert.equal(tool.annotations?.readOnlyHint, true, `${tool.name} 应声明只读`);
    assert.equal(tool.annotations?.destructiveHint, false, `${tool.name} 不该是破坏性的`);
    assert.equal(tool.annotations?.idempotentHint, true, `${tool.name} 应声明幂等`);
    assert.equal(typeof tool.annotations?.openWorldHint, "boolean", `${tool.name} 缺 openWorldHint`);
  }
  const category = tools.find((t) => t.name === "list_components").inputSchema.properties.category;
  assert.ok(Array.isArray(category.enum), "category 应由真实分类枚举生成");
  assert.ok(category.enum.includes("forms"), "真分类是 forms");
  assert.ok(!category.enum.includes("form"), "form 不是真分类，不该出现在 schema 里");
});

test("get_agent_profile 不传维度给目录，传了给可执行的组件语言与约束", async () => {
  const [catalog, composed, unknown] = await rpc([
    call(1, "get_agent_profile"),
    call(2, "get_agent_profile", {
      surface: "ai-product",
      modifiers: ["mobile"],
      workflow: "build",
    }),
    call(3, "get_agent_profile", { surface: "no-such-surface" }),
  ]);

  // 空调用 = 目录，让模型对号入座
  const catalogText = bodyOf(catalog);
  for (const id of ["admin-console", "config-tool", "ai-product", "content-brand", "desktop-shell"])
    assert.ok(catalogText.includes(id), `目录应列出 surface ${id}`);
  assert.ok(catalogText.includes("prototype"), "目录应列出 workflow prototype");

  // 组合调用 = 三个维度叠加后的具体建议
  const data = dataOf(composed);
  assert.equal(data.surface, "ai-product");
  assert.deepEqual(data.modifiers, ["mobile"]);
  assert.ok(data.components.includes("prompt-input"), "surface 的组件要在");
  assert.ok(data.components.includes("safe-area"), "modifier 追加的组件也要在");
  assert.ok(data.preferPages.includes("page-ai-chat"), "应先给现成整页");
  assert.ok(data.steps.length > 0, "workflow 应给出步骤");
  assert.ok(
    data.verification.some((v) => v.includes("390px")),
    "mobile 的验证项应合并进来",
  );
  assert.ok(
    bodyOf(composed).includes("get_component_doc"),
    "必须提醒仍要查 props 真源，本 tool 不代替文档",
  );

  // 未知维度不静默吞掉，也不当成工具故障
  assert.notEqual(unknown.result?.isError, true, "参数认不出不该报成工具坏了");
  assert.ok(dataOf(unknown).unknown.length === 1, "未识别的维度要如实回报");
});

test("list_components 能按关键词找到组件，并带出导入语句", async () => {
  const [res] = await rpc([call(2, "list_components", { query: "表格" })]);
  const body = bodyOf(res);
  assert.match(body, /pro-table/, "应能搜到 ProTable");
  assert.match(body, /import \{[^}]*\} from "@hulianui\/ui"/, "应带出根 barrel 导入语句");
});

test("list_components 能列出区块（此前只活在文档站里）", async () => {
  const [res] = await rpc([call(3, "list_components", { kind: "block", limit: 5 })]);
  assert.match(bodyOf(res), /block-/, "区块 item 名以 block- 开头");
});

test("多关键词首轮就命中现成页面与区块（#36 的两条假阴性）", async () => {
  const [page, block] = await rpc([
    call(4, "list_components", { kind: "page", query: "用户 管理 列表" }),
    call(5, "list_components", { kind: "block", query: "用户 查询 表格 表单 弹窗" }),
  ]);
  assert.match(bodyOf(page), /page-admin-list/, "「用户 管理 列表」必须命中中后台列表页");
  assert.match(bodyOf(block), /block-data-table/, "「查询 表格」必须命中数据表格区块");
  assert.equal(dataOf(page).items[0].name, "page-admin-list", "最相关的应排第一");
});

test("recommend_ui 一次给出 page → block → component 的完整选型", async () => {
  const [res] = await rpc([
    call(6, "recommend_ui", {
      task: "用户管理列表页：页头、查询、分页表格、批量操作、新增编辑弹窗、删除确认",
    }),
  ]);
  const data = dataOf(res);
  assert.ok(
    data.pages.some((item) => item.name === "page-admin-list"),
    "应推荐 page-admin-list",
  );
  assert.ok(
    data.blocks.some((item) => item.name === "block-data-table"),
    "应推荐 block-data-table",
  );
  assert.ok(data.components.length > 0, "应给出组件级候选");
  assert.match(bodyOf(res), /install_block/, "应指出下一步怎么落地");
});

test("recommend_ui 带 surface 时：关键词没命中的场景常用件也会被补进来", async () => {
  // 「做个页面」这种描述几乎搜不到 page-ai-chat；但既然场景是 ai-product，
  // 它就该出现在候选里 —— 搜不到不等于库里没有，这正是选型退化的起点。
  const [plain, scoped] = await rpc([
    call(60, "recommend_ui", { task: "做个页面" }),
    call(61, "recommend_ui", {
      task: "做个页面",
      surface: "ai-product",
      modifiers: ["mobile"],
      workflow: "build",
    }),
  ]);

  const scopedData = dataOf(scoped);
  assert.equal(scopedData.profile.surface, "ai-product");
  assert.deepEqual(scopedData.profile.modifiers, ["mobile"]);

  const aiChat = scopedData.pages.find((p) => p.name === "page-ai-chat");
  assert.ok(aiChat, "ai-product 场景应给出 page-ai-chat");

  const plainHasAiChat = dataOf(plain).pages.some((p) => p.name === "page-ai-chat");
  if (!plainHasAiChat) {
    assert.equal(aiChat.viaProfile, true, "关键词没命中而被 profile 补入时要如实标记");
    assert.match(bodyOf(scoped), /关键词未命中/, "正文要说明这是按场景补入的，不冒充搜到了");
  }

  // 约束与验证随场景一起给出
  assert.ok(scopedData.constraints.length > 0, "应附带本场景约束");
  assert.ok(
    scopedData.verification.some((v) => v.includes("390px")),
    "mobile modifier 的验证项应合并进来",
  );
  assert.ok(
    scopedData.components.some((c) => c.name === "safe-area"),
    "mobile 必需件应进入组件候选，不能被候选条数挤出去",
  );
  assert.match(bodyOf(scoped), /本形态必需/, "必需件要在正文里标出来");

  // 不带场景时保持原样，向后兼容
  assert.equal(dataOf(plain).profile, null);
  assert.deepEqual(dataOf(plain).constraints, []);
});

test("category 用真实枚举：form 报错并指向 forms", async () => {
  const [wrong, right] = await rpc([
    call(7, "list_components", { category: "form" }),
    call(8, "list_components", { category: "forms", limit: 5 }),
  ]);
  assert.equal(wrong.result?.isError, true, "不存在的分类是参数错误");
  assert.match(bodyOf(wrong), /forms/, "应提示真实分类名");
  assert.ok(dataOf(right).total > 10, "forms 分类下应有大量组件");
});

test("limit + offset 真的翻页，两页不重叠", async () => {
  const [first, second] = await rpc([
    call(9, "list_components", { limit: 5, offset: 0 }),
    call(10, "list_components", { limit: 5, offset: 5 }),
  ]);
  const a = dataOf(first).items.map((item) => item.name);
  const b = dataOf(second).items.map((item) => item.name);
  assert.equal(a.length, 5);
  assert.equal(b.length, 5);
  assert.equal(a.filter((name) => b.includes(name)).length, 0, "两页不该重叠");
  assert.equal(dataOf(first).total, dataOf(second).total);
});

test("指定 kind 内零命中会跨粒度降级，而不是宣告不存在", async () => {
  const [res] = await rpc([call(11, "list_components", { kind: "page", query: "拖拽排序" })]);
  const data = dataOf(res);
  assert.notEqual(res.result?.isError, true, "没搜到不是工具错误");
  if (data.items.length) {
    assert.equal(data.degraded, true, "跨粒度结果必须标记 degraded");
    assert.match(bodyOf(res), /\[(component|block|lib|page)\]/, "降级结果应标出每条的粒度");
  } else {
    assert.match(bodyOf(res), /recommend_ui/, "彻底没有时也要给下一步，而不是空手而归");
  }
});

test("get_component_doc 返回真实 Props 文档", async () => {
  const [res] = await rpc([call(12, "get_component_doc", { name: "button" })]);
  const body = bodyOf(res);
  assert.match(body, /## Props/, "应含 Props 章节");
  assert.match(body, /@hulianui\/ui/, "应含导入信息");
});

test("get_component_doc 接受显示名（ProTable → pro-table）", async () => {
  const [res] = await rpc([call(13, "get_component_doc", { name: "ProTable" })]);
  assert.match(bodyOf(res), /## Props/);
});

test("get_component_doc 支持批量与按章节裁剪", async () => {
  const [batch, sliced] = await rpc([
    call(14, "get_component_doc", { names: ["button", "tag"] }),
    call(15, "get_component_doc", { name: "button", sections: ["props"] }),
  ]);
  const body = bodyOf(batch);
  assert.match(body, /<!-- button ·/);
  assert.match(body, /<!-- tag ·/);
  const only = bodyOf(sliced);
  assert.match(only, /## Props/);
  // 同 format=json：Slots 跟着 props 走（#150）。
  assert.match(only, /## Slots/, "要 props 时应一并给出 Slots");
  assert.doesNotMatch(only, /## 示例/, "裁剪后不该带上没要的章节");
  assert.ok(only.length < body.length, "裁剪应真的省 context");
});

test("名字打错时给出候选，而不是干巴巴的 not found", async () => {
  const [res] = await rpc([call(16, "get_component_doc", { name: "buton" })]);
  assert.equal(res.result?.isError, true);
  assert.match(bodyOf(res), /button/, "应提示最接近的候选");
});

test("get_conventions 返回全局铁律与易混淆件", async () => {
  const [res] = await rpc([call(17, "get_conventions")]);
  const body = bodyOf(res);
  assert.match(body, /--color-/, "应含色彩 token 前缀约束");
  assert.match(body, /ThemeProvider/, "应含 ThemeProvider 挂载约束");
  assert.match(body, /Tag/, "应含 Badge↔Tag 易混淆提示");
  assert.match(body, /可执行门禁/, "应明确哪些规则由 guard 执行");
  assert.match(body, /validate_hulian_usage/, "应指向可直接调用的验证 tool");
});

test("get_conventions 带 scope 返回该组件的硬约束", async () => {
  const [res] = await rpc([call(18, "get_conventions", { scope: "AdminLayout" })]);
  assert.match(bodyOf(res), /fitViewport/, "AdminLayout 的约束应含 fitViewport");
});

test("conventions 不再把公开子路径当成禁忌", async () => {
  const [res] = await rpc([call(19, "get_conventions")]);
  const body = bodyOf(res);
  assert.match(body, /@hulianui\/ui\/tag|子路径/, "子路径是官方入口，应如实说明");
  assert.doesNotMatch(body, /没有例外入口/, "这句与 package exports 矛盾，应已删除");
});

test("get_setup_guide 按 target 给出可直接抄的接入配置", async () => {
  const [next, vitest, bad] = await rpc([
    call(20, "get_setup_guide", { target: "next" }),
    call(21, "get_setup_guide", { target: "vitest" }),
    call(22, "get_setup_guide", { target: "svelte" }),
  ]);
  assert.match(bodyOf(next), /transpilePackages/);
  assert.match(bodyOf(next), /optimizePackageImports/);
  assert.match(bodyOf(vitest), /withHulian/);
  assert.equal(bad.result?.isError, true, "未知 target 是参数错误");
});

test("install_block 返回自包含区块的可注入源码", async () => {
  const [res] = await rpc([call(23, "install_block", { name: "block-pricing-table" })]);
  const body = bodyOf(res);
  assert.match(body, /@hulianui\/ui/, "区块源码应从根 barrel 导入");
  assert.match(body, /```tsx/, "应内联源码");
});

test("install_block 对组件提示优先用 npm import 而非注入源码", async () => {
  const [res] = await rpc([call(24, "install_block", { name: "button", includeSource: false })]);
  assert.match(bodyOf(res), /不需要.{0,2}注入源码/, "组件应引导走 npm import 而非注入");
});

test("install_block 对页面返回递归依赖、接入清单与可直接调用的验收", async () => {
  const [res] = await rpc([call(25, "install_block", { name: "page-landing", includeSource: false })]);
  const body = bodyOf(res);
  assert.match(body, /需要递归安装的区块/);
  assert.match(body, /需要 Provider：ThemeProvider/);
  assert.match(body, /可替换插槽：.*hero/);
  assert.match(body, /validate_hulian_usage/, "验收应是一次 tool 调用，而不是让模型自己拼 shell");
});

test("每个响应都带数据源与 registry 版本，漂移可见", async () => {
  const [res] = await rpc([call(26, "list_components", { limit: 1 })]);
  const body = bodyOf(res);
  assert.match(body, /数据源 local:/, "本地模式应如实标出");
  assert.match(body, /registry v\d+\.\d+\.\d+/, "应带 registry 版本");
  assert.equal(dataOf(res).source.mode, "local");
  assert.ok(dataOf(res).source.version, "structuredContent 里也要有版本");
});

// ------------------------------------------------------------ 项目与验证 --

test("inspect_project 认出装好的 Next 项目", async () => {
  const root = makeProject("next");
  try {
    const [res] = await rpc([call(27, "inspect_project", { projectRoot: root })]);
    const info = dataOf(res);
    assert.equal(info.projectRootSource, "argument");
    assert.equal(info.framework.name, "next");
    assert.equal(info.packageManager, "pnpm");
    assert.equal(info.packages["@hulianui/ui"].installed, "0.15.1");
    assert.equal(info.setup.themeProvider, "detected");
    assert.equal(info.setup.tokensCss, "detected");
    assert.equal(info.setup.tailwindSource, "detected");
    assert.equal(info.setup.transpilePackages, "detected");
    assert.equal(info.setup.optimizePackageImports, "detected");
    assert.equal(info.componentsJson.file, "components.json");
    assert.deepEqual(info.warnings, [], "接好的项目不该有告警");
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("inspect_project 指出 Vite 软链项目的接入缺口", async () => {
  const root = makeProject("vite");
  try {
    const [res] = await rpc([call(28, "inspect_project", { projectRoot: root })]);
    const info = dataOf(res);
    assert.equal(info.framework.name, "vite");
    assert.equal(info.packageManager, "yarn");
    assert.equal(info.setup.tokensCss, "not-found");
    assert.equal(info.setup.themeProvider, "not-found");
    assert.equal(info.setup.configProvider, "not-found");
    const warnings = info.warnings.join("\n");
    assert.match(warnings, /tokens/, "缺 token CSS 要报");
    assert.match(warnings, /ThemeProvider/, "缺 Provider 要报");
    assert.match(warnings, /@base-ui\/react/, "缺 peer 要报");
    // #164：漏 ConfigProvider 页面看起来完全正常，只有读屏用户撞得到 —— 必须报，但措辞是建议
    assert.match(warnings, /建议：.*ConfigProvider/, "缺 ConfigProvider 要报，且是建议不是 error");
    assert.match(warnings, /zh-CN/, "要说清回退成什么");
    assert.match(bodyOf(res), /ConfigProvider not-found/, "接入状态一行里也要能看到");
    assert.match(bodyOf(res), /not-found.*不等于不存在|不等于不存在/, "必须说明未检测≠不存在");
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("inspect_project 优先用 MCP Roots，没有才退 cwd 并标明来源", async () => {
  const root = makeProject("next");
  try {
    const [viaRoots] = await rpc([call(29, "inspect_project", {})], {
      roots: [{ uri: `file://${root}`, name: "fixture" }],
    });
    assert.equal(dataOf(viaRoots).projectRootSource, "mcp-roots");
    assert.equal(dataOf(viaRoots).framework.name, "next");

    const [viaCwd] = await rpc([call(30, "inspect_project", {})], { cwd: root });
    assert.equal(dataOf(viaCwd).projectRootSource, "cwd-fallback");
    assert.match(dataOf(viaCwd).warnings.join("\n"), /cwd/, "兜底必须写进 warnings");
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

/**
 * pnpm 的真实布局：`node_modules/<pkg>` 是指向 `.pnpm/` store 的**软链**。
 * 这不是联调，是它默认的隔离方案 —— 用 isSymbolicLink 判 linked 会在这里恒为 true（#45）。
 */
function makePnpmProject({ declared = "^0.16.0", installed = "0.16.0" } = {}) {
  const root = mkdtempSync(join(tmpdir(), "hulian-pnpm-"));
  const store = join("node_modules", ".pnpm", `@hulianui+ui@${installed}`, "node_modules", "@hulianui", "ui");
  write(root, join(store, "package.json"), JSON.stringify({ name: "@hulianui/ui", version: installed }));
  // 同上：@source 指向的 src/ 要真的存在（软链过去也能解析到）。
  write(root, join(store, "src", "button", "button.tsx"), "export const Button = () => null\n");
  mkdirSync(join(root, "node_modules", "@hulianui"), { recursive: true });
  symlinkSync(join(root, store), join(root, "node_modules", "@hulianui", "ui"));
  write(root, "pnpm-lock.yaml", "lockfileVersion: '9.0'\n");
  write(
    root,
    "package.json",
    JSON.stringify({
      name: "pnpm-fixture",
      dependencies: { next: "16.2.0", react: "19.0.0", "@base-ui/react": "1.0.0", "@hulianui/ui": declared },
    }),
  );
  return root;
}

test("pnpm store 的软链不算本地接入 —— 版本漂移门禁必须照常跑（#45）", async () => {
  // 声明 ^0.14.0 却实装 0.16.0：0.x 下 minor 就是破坏性版本线，这必须报出来
  const root = makePnpmProject({ declared: "^0.14.0", installed: "0.16.0" });
  try {
    const [res] = await rpc([call(60, "inspect_project", { projectRoot: root })]);
    const info = dataOf(res);
    const ui = info.packages["@hulianui/ui"];
    assert.equal(ui.installed, "0.16.0");
    assert.equal(ui.linked, false, "pnpm store 软链不是本地接入");
    assert.equal(ui.linkKind, null);
    assert.match(
      info.warnings.join("\n"),
      /声明 \^0\.14\.0 但实装 0\.16\.0/,
      "linked 恒 true 时这条门禁被静默跳过，正是 #45 最要紧的影响",
    );
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("0.x 版本一致时不误报漂移（^0.16.0 + 0.16.0）", async () => {
  const root = makePnpmProject({ declared: "^0.16.0", installed: "0.16.0" });
  try {
    const [res] = await rpc([call(61, "inspect_project", { projectRoot: root })]);
    const warnings = dataOf(res).warnings.join("\n");
    assert.doesNotMatch(warnings, /实装/, "版本对得上就不该有漂移警告");
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("link: 声明才算本地源码接入，并如实标出 linkKind（#45）", async () => {
  const root = makeProject("vite"); // 该 fixture 声明的就是 link:../hulian/packages/ui
  try {
    const [res] = await rpc([call(62, "inspect_project", { projectRoot: root })]);
    const ui = dataOf(res).packages["@hulianui/ui"];
    assert.equal(ui.linked, true);
    assert.equal(ui.linkKind, "local-link");
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("全局样式表跟着入口 import 走，src/styles.css 也能命中（#46）", async () => {
  const root = makePnpmProject();
  try {
    // 入口 import 的是一个既不在固定候选列表里、名字也不常规的样式表
    write(root, "src/main.tsx", `import "./theme/app-styles.css"\nexport default null\n`);
    write(
      root,
      "src/theme/app-styles.css",
      `@import "@hulianui/tokens/tokens.css";\n@source "../../node_modules/@hulianui/ui/src/**/*.{ts,tsx}";\n`,
    );
    const [res] = await rpc([call(63, "inspect_project", { projectRoot: root })]);
    const info = dataOf(res);
    assert.equal(info.setup.tokensCss, "detected");
    assert.equal(info.setup.tailwindSource, "detected");
    assert.ok(
      info.setup.scannedCssFiles.includes("src/theme/app-styles.css"),
      `扫描过的样式表应含入口推出来的那份，实际：${JSON.stringify(info.setup.scannedCssFiles)}`,
    );
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("一个样式表都找不到时说清是「探测不到」而非「你没接」（#46）", async () => {
  const root = makePnpmProject();
  try {
    const [res] = await rpc([call(64, "inspect_project", { projectRoot: root })]);
    const info = dataOf(res);
    assert.equal(info.setup.tokensCss, "unknown");
    assert.deepEqual(info.setup.scannedCssFiles, []);
    assert.match(info.warnings.join("\n"), /探测不到/, "unknown 的含义必须写进 warnings，否则模型读反");
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("audit_hulian_adoption 走真实协议返回结构化体检，且不置 isError", async () => {
  const root = makePnpmProject();
  try {
    write(
      root,
      "app/admin/users/page.tsx",
      `import { AdminLayout, PageHeader, Table, Pagination } from "@hulianui/ui"
export default () => <AdminLayout><PageHeader /><Table /><Pagination /><table /></AdminLayout>\n`,
    );
    const [res] = await rpc([call(70, "audit_hulian_adoption", { projectRoot: root })]);
    const data = dataOf(res);
    assert.notEqual(res.result?.isError, true, "采用不足是结论不是工具故障，不能置 isError");
    assert.equal(data.scene.surface.id, "admin-console");
    assert.ok(data.usage.highLevel.score, "要给出主指标（高层业务组件采用度）");
    assert.ok(
      data.opportunities.some((o) => o.slug === "pro-table"),
      "同组用了 Table/Pagination 却缺 ProTable，该报机会点",
    );
    assert.ok(data.risks.some((r) => r.id === "bare-table" && r.confidence === "high"));
    assert.match(bodyOf(res), /带置信度的建议/, "渲染文本必须自陈是建议而非门禁");
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("audit_hulian_adoption 拒绝未知 surface / workflow，不静默忽略", async () => {
  const root = makePnpmProject();
  try {
    const [res] = await rpc([
      call(71, "audit_hulian_adoption", { projectRoot: root, surface: "not-a-surface" }),
    ]);
    // MCP SDK 会按 inputSchema 的 enum 拦下；无论谁拦，都不能当成"没传"继续跑
    const body = bodyOf(res);
    assert.ok(
      res.result?.isError === true || /not-a-surface/.test(body),
      `未知 surface 应被拒绝或明确报出，实际：${body.slice(0, 200)}`,
    );
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("validate_hulian_usage 对合规代码返回 ok:true", async () => {
  const [res] = await rpc([
    call(31, "validate_hulian_usage", {
      code: `import { Button } from "@hulianui/ui"\nexport const A = () => <Button>ok</Button>\n`,
      filePath: "a.tsx",
    }),
  ]);
  assert.equal(dataOf(res).ok, true);
  assert.notEqual(res.result?.isError, true);
  assert.match(bodyOf(res), /guard 通过/);
});

test("违规代码返回结构化诊断，且不误用 isError", async () => {
  const [res] = await rpc([
    call(32, "validate_hulian_usage", {
      code: `import { Button, toast } from "@hulianui/ui"
export function A() {
  toast.success("saved")
  return <Button style={{ color: "red" }}>x</Button>
}\n`,
      filePath: "bad.tsx",
    }),
  ]);
  const data = dataOf(res);
  assert.equal(data.ok, false, "业务代码违规 → ok:false");
  assert.notEqual(res.result?.isError, true, "isError 只留给工具自身失败");
  const ruleIds = data.diagnostics.map((item) => item.ruleId);
  assert.ok(ruleIds.includes("toast-object-signature"), "应抓到 toast 成员调用");
  assert.ok(ruleIds.includes("no-style-override"), "应抓到 style 覆盖");
  for (const item of data.diagnostics) {
    assert.equal(typeof item.line, "number");
    assert.equal(typeof item.column, "number");
    assert.equal(typeof item.file, "string");
    assert.ok(item.severity);
  }
  assert.ok(data.versions.guard, "应带 guard 版本");
});

test("公开子路径导入不再被判违规，真私有路径仍然拦", async () => {
  const [ok, bad] = await rpc([
    call(33, "validate_hulian_usage", {
      code: `import { Tag } from "@hulianui/ui/tag"\nimport { withHulian } from "@hulianui/ui/vitest-preset"\nexport const A = withHulian\n`,
      filePath: "ok.ts",
    }),
    call(34, "validate_hulian_usage", {
      code: `import { X } from "@hulianui/ui/src/internal"\nexport const A = X\n`,
      filePath: "bad.ts",
    }),
  ]);
  assert.equal(dataOf(ok).ok, true, "package exports 里的子路径是公开入口");
  assert.equal(dataOf(bad).ok, false, "exports 之外的路径仍要拦");
});

test("多文件检查：单个文件读不到不影响其余诊断", async () => {
  const root = mkdtempSync(join(tmpdir(), "hulian-validate-"));
  try {
    write(root, "good.tsx", `import { Button } from "@hulianui/ui"\nexport const A = () => <Button/>\n`);
    write(root, "bad.tsx", `import { toast } from "@hulianui/ui"\nexport const B = () => toast.success("x")\n`);
    const [res] = await rpc([
      call(35, "validate_hulian_usage", {
        projectRoot: root,
        files: ["good.tsx", "bad.tsx", "missing.tsx", "notes.md"],
      }),
    ]);
    const data = dataOf(res);
    assert.equal(data.summary.files, 2, "两个可读文件都要检查");
    assert.equal(data.summary.skipped, 2, "缺失文件与非源码各记一条 skipped");
    assert.equal(data.ok, false);
    assert.ok(data.diagnostics.some((item) => item.file === "bad.tsx"));
    assert.notEqual(res.result?.isError, true);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("参数缺失才是工具失败", async () => {
  const [res] = await rpc([call(36, "validate_hulian_usage", {})]);
  assert.equal(res.result?.isError, true);
});

test("prompts 把推荐工作流固化下来", async () => {
  const [list, get] = await rpc([
    { jsonrpc: "2.0", id: 37, method: "prompts/list" },
    {
      jsonrpc: "2.0",
      id: 38,
      method: "prompts/get",
      params: { name: "hulianui_page_builder", arguments: { page: "用户管理列表页" } },
    },
  ]);
  assert.deepEqual(
    (list.result?.prompts ?? []).map((p) => p.name).sort(),
    ["hulianui_expert", "hulianui_page_builder"],
  );
  const message = get.result?.messages?.[0]?.content?.text ?? "";
  assert.match(message, /inspect_project/);
  assert.match(message, /recommend_ui/);
  assert.match(message, /validate_hulian_usage/);
  assert.match(message, /用户管理列表页/);
});

test("本地模式缺产物时明确报错，不静默混用线上数据", async () => {
  const empty = mkdtempSync(join(tmpdir(), "hulian-no-artifacts-"));
  try {
    const [strict, opted] = await rpc(
      [call(39, "list_components", { limit: 1 }), call(40, "get_conventions", {})],
      { env: { HULIAN_UI_ROOT: empty } },
    );
    assert.equal(strict.result?.isError, true, "缺 registry 产物必须报错");
    assert.match(bodyOf(strict), /本地模式/);
    assert.match(bodyOf(strict), /llms-registry|docs:all/, "要说清怎么补");
    assert.equal(opted.result?.isError, true);
  } finally {
    rmSync(empty, { recursive: true, force: true });
  }
});

test("基准任务：用户管理列表页的选型 4 次调用内闭环", async () => {
  // #36 的验收标准之一：这条链路此前退化成 29 次 tool call，且最终得出「没有可复用的页面」。
  const [recommend, docs, conventions, install] = await rpc([
    call(41, "recommend_ui", {
      task: "用户管理列表页：页头、查询、分页表格、批量操作、新增编辑弹窗、删除确认",
    }),
    call(42, "get_component_doc", {
      names: ["pro-table", "form-dialog", "page-header"],
      sections: ["props", "pitfalls"],
    }),
    call(43, "get_conventions", {}),
    call(44, "install_block", { name: "page-admin-list", includeSource: false }),
  ]);

  const picks = dataOf(recommend);
  assert.ok(picks.pages.some((item) => item.name === "page-admin-list"));
  assert.ok(picks.blocks.some((item) => item.name === "block-data-table"));

  const body = bodyOf(docs);
  for (const slug of ["pro-table", "form-dialog", "page-header"]) {
    assert.match(body, new RegExp(`<!-- ${slug} ·`), `${slug} 的文档应在同一次返回里`);
  }
  assert.match(bodyOf(conventions), /可执行门禁/);
  assert.match(bodyOf(install), /需要递归安装的区块/);
  assert.match(bodyOf(install), /validate_hulian_usage/);
});

test("两个工具都不碰消费项目的文件", async () => {
  const root = makeProject("next");
  const snapshot = () => {
    const entries = [];
    const walk = (dir, rel = "") => {
      for (const entry of readdirSync(dir, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
        const next = join(dir, entry.name);
        const path = rel ? `${rel}/${entry.name}` : entry.name;
        if (entry.isDirectory()) walk(next, path);
        else entries.push(`${path}:${readFileSync(next, "utf8").length}`);
      }
    };
    walk(root);
    return entries.join("\n");
  };
  const before = snapshot();
  try {
    await rpc([
      call(45, "inspect_project", { projectRoot: root }),
      call(46, "validate_hulian_usage", { projectRoot: root, files: ["app/layout.tsx"] }),
    ]);
    assert.equal(snapshot(), before, "inspect_project / validate_hulian_usage 都是只读的");
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

// ------------------------------------------------------- 同源安装 / 版本 --

/** 一个内容与线上**故意不同**的本地 registry：用来证明本地源码不会配上线上安装命令。 */
function makeLocalRegistry() {
  const root = mkdtempSync(join(tmpdir(), "hulian-local-registry-"));
  const item = {
    name: "block-local-only",
    type: "registry:block",
    title: "只存在于本地的区块",
    description: "线上 registry 里没有这一份",
    categories: ["application"],
    dependencies: [],
    registryDependencies: [],
    files: [
      {
        path: "components/hulianui/blocks/local-only.tsx",
        type: "registry:block",
        target: "components/hulianui/blocks/local-only.tsx",
        content: 'export const MARKER = "LOCAL_ONLY_NOT_PUBLISHED"\n',
      },
    ],
    meta: { kind: "block", installation: { providers: [], replace: [], slots: [] } },
  };
  write(root, "packages/ui/conventions.json", JSON.stringify({ version: "2", executableRules: [], advisories: [] }));
  write(
    root,
    "apps/www/public/registry.json",
    JSON.stringify({
      name: "hulianui",
      version: "9.9.9-local",
      itemUrl: "https://hulianui.haloritual.com/r/{name}.json",
      items: [{ ...item, files: item.files.map(({ content: _c, ...rest }) => rest) }],
    }),
  );
  write(root, "apps/www/public/r/block-local-only.json", JSON.stringify(item));
  return root;
}

test("本地源码不会配上线上安装命令（内容不同也不会误导）", async () => {
  const root = makeLocalRegistry();
  try {
    const [res] = await rpc([call(47, "install_block", { name: "block-local-only" })], {
      env: { HULIAN_UI_ROOT: join(root, "packages", "ui") },
    });
    const body = bodyOf(res);
    assert.match(body, /LOCAL_ONLY_NOT_PUBLISHED/, "应返回本地那一份源码");
    assert.doesNotMatch(
      body,
      /npx shadcn@latest add https:\/\/hulianui\.haloritual\.com/,
      "本地源码 + 线上端点是跨源的，不能给这条命令",
    );
    assert.match(body, /不是同一来源|没有同源的安装端点/, "必须说清为什么没有命令");
    assert.match(body, /registry v9\.9\.9-local/, "数据源版本应如实回报");
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("本地模式版本以源码为准，产物落后一版时显式告警（#47 #48）", async () => {
  const root = makeLocalRegistry();
  try {
    // 发版 commit 只动 package.json，不重跑生成脚本 —— 于是本地产物必然落后一版
    write(root, "packages/ui/package.json", JSON.stringify({ name: "@hulianui/ui", version: "9.9.10-source" }));
    const [res] = await rpc([call(65, "install_block", { name: "block-local-only", includeSource: false })], {
      env: { HULIAN_UI_ROOT: join(root, "packages", "ui") },
    });
    const body = bodyOf(res);
    assert.match(body, /registry v9\.9\.10-source/, "版本戳取源码真源，不取生成物 —— 否则报出假 skew");
    assert.match(body, /产物已陈旧/, "陈旧必须说出来，不能静默");
    assert.match(body, /9\.9\.9-local/, "要把产物那一版也报出来，方便判断差多远");
    assert.match(body, /pnpm llms-registry/, "告警要直接给修复命令");
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("版本号相同但组件文档改过，同样算产物陈旧（mtime 判据，#48）", async () => {
  const root = makeLocalRegistry();
  try {
    // 与产物同版：版本号比对对「同版本内改文档」是瞎的，只有 mtime 能挡
    write(root, "packages/ui/package.json", JSON.stringify({ name: "@hulianui/ui", version: "9.9.9-local" }));
    write(root, "packages/ui/src/button/button.md", "# Button\n\n| onQueryChange | 新加的 |\n");
    const future = Date.now() / 1000 + 600;
    utimesSync(join(root, "packages", "ui", "src", "button", "button.md"), future, future);

    const [res] = await rpc([call(66, "install_block", { name: "block-local-only", includeSource: false })], {
      env: { HULIAN_UI_ROOT: join(root, "packages", "ui") },
    });
    const body = bodyOf(res);
    assert.match(body, /产物已陈旧/);
    assert.match(body, /button\.md 比产物新/, "要指出是哪个文件比产物新");
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("产物与源码同步时不打陈旧告警", async () => {
  const root = makeLocalRegistry();
  try {
    write(root, "packages/ui/package.json", JSON.stringify({ name: "@hulianui/ui", version: "9.9.9-local" }));
    const [res] = await rpc([call(67, "install_block", { name: "block-local-only", includeSource: false })], {
      env: { HULIAN_UI_ROOT: join(root, "packages", "ui") },
    });
    assert.doesNotMatch(bodyOf(res), /产物已陈旧/, "同步状态下不能有噪音告警");
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("显式配了 registry URL 才给安装命令，且用的就是那个 base", async () => {
  const root = makeLocalRegistry();
  try {
    const [res] = await rpc([call(48, "install_block", { name: "block-local-only", includeSource: false })], {
      env: {
        HULIAN_UI_ROOT: join(root, "packages", "ui"),
        HULIAN_REGISTRY_URL: "http://127.0.0.1:4499",
      },
    });
    const body = bodyOf(res);
    assert.match(body, /npx shadcn@latest add http:\/\/127\.0\.0\.1:4499\/r\/block-local-only\.json/);
    assert.doesNotMatch(body, /hulianui\.haloritual\.com/);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("唯一的文件不存在时是工具失败，绝不能显示通过", async () => {
  const [res] = await rpc([
    call(49, "validate_hulian_usage", { files: ["definitely-missing.tsx"] }),
  ]);
  assert.equal(res.result?.isError, true, "0 个文件被检查 = 工具没能完成工作");
  const body = bodyOf(res);
  assert.doesNotMatch(body, /通过/, "不能出现任何「通过」字样");
  assert.match(body, /definitely-missing\.tsx/);
  assert.match(body, /文件不存在/);
});

test("部分文件未检查时标 partial，且不算通过", async () => {
  const root = mkdtempSync(join(tmpdir(), "hulian-partial-"));
  try {
    write(root, "good.tsx", `import { Button } from "@hulianui/ui"\nexport const A = () => <Button/>\n`);
    const [res] = await rpc([
      call(50, "validate_hulian_usage", { projectRoot: root, files: ["good.tsx", "missing.tsx"] }),
    ]);
    const data = dataOf(res);
    assert.equal(data.partial, true);
    assert.equal(data.ok, false, "已检查的干净，但漏了一个 —— 不能算通过");
    assert.equal(data.summary.errors, 0, "并不是代码有违规");
    assert.notEqual(res.result?.isError, true, "还有文件检查成了，不是工具失败");
    assert.match(bodyOf(res), /部分完成/);
    assert.doesNotMatch(bodyOf(res), /✅/);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("versions 区分 guard / registry / 消费方实装版本，首轮调用就齐", async () => {
  const root = makeProject("next");
  try {
    const [res] = await rpc([
      call(51, "validate_hulian_usage", { projectRoot: root, files: ["app/layout.tsx"] }),
    ]);
    const versions = dataOf(res).versions;
    assert.ok(versions.guard, "guard 版本");
    assert.match(versions.registry ?? "", /^\d+\.\d+\.\d+$/, "registry 版本不能因为调用顺序而是 null");
    assert.equal(versions.consumerUi, "0.15.1", "消费方实装版本来自 projectRoot/node_modules");
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("monorepo 根：交出子项目候选而不是断言「没装瑚琏」", async () => {
  const root = mkdtempSync(join(tmpdir(), "hulian-monorepo-"));
  try {
    // 仓库根连 package.json 都没有，前端在 web/ —— 5069tk 的真实形状
    write(
      root,
      "web/package.json",
      JSON.stringify({
        name: "web",
        dependencies: { next: "16.2.0", "@hulianui/ui": "^0.15.1" },
      }),
    );
    write(
      root,
      "web/node_modules/@hulianui/ui/package.json",
      JSON.stringify({ name: "@hulianui/ui", version: "0.15.1" }),
    );
    const [res] = await rpc([call(52, "inspect_project", { projectRoot: root })]);
    const info = dataOf(res);
    assert.equal(info.suggestedProjectRoot, join(root, "web"));
    assert.deepEqual(
      info.workspaceCandidates.map((entry) => [entry.path, entry.framework, entry.hulianUi]),
      [["web", "next", "0.15.1"]],
    );
    const warnings = info.warnings.join("\n");
    assert.match(warnings, /monorepo 根/);
    assert.match(warnings, /web/);
    assert.doesNotMatch(warnings, /ThemeProvider/, "根目录不该抱怨缺 Provider —— 那是子项目的事");
    assert.doesNotMatch(warnings, /tokens/, "同上：噪音会盖住真正该说的那句");
    assert.match(bodyOf(res), /未替你切换/, "必须说明没有自动切换");
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("workspace 声明优先于目录名猜测", async () => {
  const root = mkdtempSync(join(tmpdir(), "hulian-workspaces-"));
  try {
    write(root, "package.json", JSON.stringify({ name: "root", private: true }));
    write(root, "pnpm-workspace.yaml", "packages:\n  - apps/*\n  - packages/*\n");
    write(
      root,
      "apps/dashboard/package.json",
      JSON.stringify({ name: "dashboard", dependencies: { vite: "7.3.6", "@hulianui/ui": "^0.15.1" } }),
    );
    write(root, "packages/utils/package.json", JSON.stringify({ name: "utils" }));
    const [res] = await rpc([call(53, "inspect_project", { projectRoot: root })]);
    const info = dataOf(res);
    assert.equal(info.suggestedProjectRoot, join(root, "apps/dashboard"));
    assert.deepEqual(
      info.workspaceCandidates.map((entry) => entry.path).sort(),
      ["apps/dashboard", "packages/utils"],
    );
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("@source 路径指不到实处 → invalid + warning，而不是误报 detected（#66）", async () => {
  const root = makeProject("next");
  try {
    // pnpm workspace 的经典错法：包实际在 <app>/node_modules，CSS 却按仓库根数了层级。
    write(
      root,
      "app/globals.css",
      `@import "@hulianui/tokens/tokens.css";\n@source "../../../node_modules/@hulianui/ui/src/**/*.{ts,tsx}";\n`,
    );
    const [res] = await rpc([call(91, "inspect_project", { projectRoot: root })]);
    const info = dataOf(res);
    assert.equal(info.setup.tailwindSource, "invalid");
    // 解析后的候选路径要回报出去，便于消费方对比 workspace 与单包安装的差异
    assert.ok(Array.isArray(info.setup.tailwindSourceTargets));
    assert.equal(info.setup.tailwindSourceTargets.length, 1);
    assert.equal(info.setup.tailwindSourceTargets[0].exists, false);
    assert.ok(
      info.warnings.some((w) => w.includes("解析后的目标不存在")),
      `应给出 warning，实际：${JSON.stringify(info.warnings)}`,
    );
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("@source 指对了仍是 detected（不因新校验误伤）", async () => {
  const root = makeProject("next");
  try {
    const [res] = await rpc([call(92, "inspect_project", { projectRoot: root })]);
    const info = dataOf(res);
    assert.equal(info.setup.tailwindSource, "detected");
    assert.equal(info.setup.tailwindSourceTargets[0].exists, true);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

/**
 * pnpm **workspace 子项目**的真实布局（#68）：前端在 `apps/web`，但它的
 * `node_modules/@hulianui/ui` 指向的是**仓库根**的 `node_modules/.pnpm/…`。
 * 只拿 `apps/web/node_modules` 当逃逸基准，普通 registry 包就会被判成 local-link ——
 * #45 的单包 fixture 里 `.pnpm` 恰好同级，所以这个缺陷当时没被测出来。
 */
function makePnpmWorkspaceProject({ declared = "0.18.0", installed = "0.18.0" } = {}) {
  const root = mkdtempSync(join(tmpdir(), "hulian-pnpm-ws-"));
  const app = join(root, "apps", "web");
  // store 在仓库根，不在 apps/web
  const store = join(
    "node_modules",
    ".pnpm",
    `@hulianui+ui@${installed}_react@19.0.0`,
    "node_modules",
    "@hulianui",
    "ui",
  );
  write(root, join(store, "package.json"), JSON.stringify({ name: "@hulianui/ui", version: installed }));
  write(root, join(store, "src", "button", "button.tsx"), "export const Button = () => null\n");
  // apps/web/node_modules/@hulianui/ui → 仓库根 .pnpm store
  mkdirSync(join(app, "node_modules", "@hulianui"), { recursive: true });
  symlinkSync(join(root, store), join(app, "node_modules", "@hulianui", "ui"));

  write(root, "pnpm-workspace.yaml", "packages:\n  - apps/*\n  - packages/*\n");
  write(root, "pnpm-lock.yaml", "lockfileVersion: '9.0'\n");
  write(root, "package.json", JSON.stringify({ name: "ws-root", private: true }));
  write(
    join(app),
    "package.json",
    JSON.stringify({
      name: "web",
      dependencies: {
        next: "16.2.0",
        react: "19.0.0",
        "@base-ui/react": "1.0.0",
        "@hulianui/ui": declared,
      },
    }),
  );
  return { root, app };
}

test("workspace 子项目里的 registry 包不算本地接入（#68）", async () => {
  const { root, app } = makePnpmWorkspaceProject();
  try {
    const [res] = await rpc([call(63, "inspect_project", { projectRoot: app })]);
    const ui = dataOf(res).packages["@hulianui/ui"];
    assert.equal(ui.installed, "0.18.0");
    assert.equal(ui.linked, false, "指向仓库根 .pnpm store 的普通安装不是本地源码接入");
    assert.equal(ui.linkKind, null);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("workspace 子项目下版本漂移门禁仍然照常跑（#68 的真正影响）", async () => {
  // linked 恒 true 时这条门禁被静默跳过 —— 与 #45 同一个后果，只是换了个布局触发
  const { root, app } = makePnpmWorkspaceProject({ declared: "^0.14.0", installed: "0.18.0" });
  try {
    const [res] = await rpc([call(64, "inspect_project", { projectRoot: app })]);
    assert.match(dataOf(res).warnings.join("\n"), /声明 \^0\.14\.0 但实装 0\.18\.0/);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("workspace 子项目里显式 link: 仍如实标为本地接入（#68 不能把判据放宽过头）", async () => {
  const { root, app } = makePnpmWorkspaceProject({ declared: "link:../../packages/ui" });
  try {
    const [res] = await rpc([call(65, "inspect_project", { projectRoot: app })]);
    const ui = dataOf(res).packages["@hulianui/ui"];
    assert.equal(ui.linked, true);
    assert.equal(ui.linkKind, "local-link");
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("workspace: 声明照旧标为 workspace（#68）", async () => {
  const { root, app } = makePnpmWorkspaceProject({ declared: "workspace:*" });
  try {
    const [res] = await rpc([call(66, "inspect_project", { projectRoot: app })]);
    const ui = dataOf(res).packages["@hulianui/ui"];
    assert.equal(ui.linkKind, "workspace");
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

/** 真正的 workspace 内链接（软链指向 packages/ui 源码目录，不在任何 node_modules 里）仍要判本地接入。 */
test("软链指向仓库内源码目录时仍是本地接入（#68 的负向边界）", async () => {
  const root = mkdtempSync(join(tmpdir(), "hulian-ws-src-"));
  try {
    const app = join(root, "apps", "web");
    const pkg = join(root, "packages", "ui");
    write(root, join("packages", "ui", "package.json"), JSON.stringify({ name: "@hulianui/ui", version: "0.18.0" }));
    write(root, join("packages", "ui", "src", "button", "button.tsx"), "export const Button = () => null\n");
    mkdirSync(join(app, "node_modules", "@hulianui"), { recursive: true });
    symlinkSync(pkg, join(app, "node_modules", "@hulianui", "ui"));
    write(root, "pnpm-workspace.yaml", "packages:\n  - apps/*\n  - packages/*\n");
    write(root, "pnpm-lock.yaml", "lockfileVersion: '9.0'\n");
    write(root, "package.json", JSON.stringify({ name: "ws-root", private: true }));
    write(
      app,
      "package.json",
      JSON.stringify({
        name: "web",
        // 声明写的是版本号，但实际链到了仓库内源码——只有路径判据能识别出来
        dependencies: { next: "16.2.0", react: "19.0.0", "@base-ui/react": "1.0.0", "@hulianui/ui": "0.18.0" },
      }),
    );
    const [res] = await rpc([call(67, "inspect_project", { projectRoot: app })]);
    const ui = dataOf(res).packages["@hulianui/ui"];
    assert.equal(ui.linked, true, "链到 packages/ui 源码目录（不在任何 node_modules 内）就是本地接入");
    assert.equal(ui.linkKind, "local-link");
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

// format: "json" —— 受约束生成要的是结构化 props，而不是让每家消费方去解析 markdown 表格
// （hulianui/hulian#102 #103 #104 #105）。
test("get_component_doc format=json 返回结构化 props（带枚举取值与默认值）", async () => {
  const [res] = await rpc([call(60, "get_component_doc", { name: "button", format: "json" })]);
  const payload = dataOf(res);
  const button = payload.components[0];
  assert.equal(button.slug, "button");
  assert.match(button.import, /@hulianui\/ui/);
  const variant = button.props.find((p) => p.name === "variant");
  assert.equal(variant.kind, "enum");
  assert.ok(variant.values.includes("solid"), `枚举取值缺失：${JSON.stringify(variant)}`);
  assert.equal(variant.valueType, "string");
});

test("get_component_doc format=json 用真实导出名也能反查到组件（IPhone → iphone）", async () => {
  const [res] = await rpc([call(61, "get_component_doc", { name: "IPhone", format: "json" })]);
  const payload = dataOf(res);
  assert.equal(payload.components[0].slug, "iphone");
  assert.ok(payload.components[0].exports.includes("IPhone"));
});

test("get_component_doc format=json 支持按 sections 裁剪", async () => {
  const [res, only] = await rpc([
    call(62, "get_component_doc", { name: "button", format: "json", sections: ["props"] }),
    call(64, "get_component_doc", { name: "button", format: "json", sections: ["events"] }),
  ]);
  const component = dataOf(res).components[0];
  assert.ok(Array.isArray(component.props));
  // 要 props 就会带上 slots：`Button.render` 这类字段住在 Slots 里，而它在消费方眼里
  // 就是个 prop（写在 JSX 属性位、进类型检查）。只给 props 会让人得出「Button 没有
  // render」的结论，照着写完才回头翻源码发现有（#150）。
  assert.ok(Array.isArray(component.slots), "要 props 时应一并给出 slots");
  assert.ok(
    component.slots.some((slot) => slot.name === "render"),
    "Button.render 必须能从 props 查询里看到",
  );
  assert.equal(component.events, undefined, "其余没要的章节仍然不该出现");
  // 反向不搭：单独要 events 是明确的窄查询，不该被塞进 slots。
  assert.equal(dataOf(only).components[0].slots, undefined);
});

test("get_component_doc 拒绝未知 format", async () => {
  const [res] = await rpc([call(63, "get_component_doc", { name: "button", format: "yaml" })]);
  assert.match(bodyOf(res), /format/);
});
