# 瀚枢 HanHub 大模型 API 中转网关 demo + 4 新组件 实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement task-by-task. Steps use checkbox (`- [ ]`) syntax.

**Goal:** 建第 12 个内置 demo `/demos/hanhub`（开发者 LLM 网关控制台 8 页），并借此给 `@hulianui/ui` 新增 4 个组件（JsonViewer / SecretField / PricingTable / StatusDot）。

**Architecture:** 组件先行（页面的依赖），每个组件遵循库 5 文件约定 + 双 barrel + manifest + registry 注册，TDD。再搭 8 页 demo（AdminLayout 外壳 + `(app)` 路由组 + 全 mock + `output: export`），100% dogfood，禁 CSS 补丁。

**Tech Stack:** Next.js 16(App Router, output export) · React 19 · @hulianui/ui · vitest · CDP Chrome-for-Testing 实机自证。

**核心目的（goal）：用 demo 驱动 UI 库成长 —— 4 个新组件是这次的主产出，页面是逼真载体。**

---

## 组件注册链（每个新组件都要走完，写进各任务）

1. `packages/ui/src/<slug>/` 5 文件：`<slug>.tsx` `<slug>.types.ts` `<slug>.showcase.tsx` `<slug>.test.tsx` `index.ts`
2. `packages/ui/src/index.ts` 加 `export * from "./<slug>";`（按字母/分组就近插）
3. `packages/ui/src/showcase.ts` 加 `export { <name>Showcase } from "./<slug>/<slug>.showcase";`
4. `apps/www/lib/manifest.ts` 加 `ComponentMeta`（category/group 见 spec §5）
5. `apps/www/lib/registry.tsx` import `<name>Showcase` + map 里加 `"<slug>": <name>Showcase`
6. 跑 `pnpm --filter @hulianui/ui test`（含 manifest.test 校验 category/group 合法）

---

## Task 1: StatusDot 组件（最简，先热身打通注册链）

**Files:**
- Create: `packages/ui/src/status-dot/status-dot.tsx` `.types.ts` `.showcase.tsx` `.test.tsx` `index.ts`
- Modify: `packages/ui/src/index.ts`、`packages/ui/src/showcase.ts`、`apps/www/lib/manifest.ts`、`apps/www/lib/registry.tsx`

**接口契约：**
```ts
export type ChannelStatus = "online" | "degraded" | "offline" | "maintenance";
export interface StatusDotProps extends Omit<HTMLAttributes<HTMLSpanElement>, "color"> {
  status: ChannelStatus;
  pulse?: boolean;          // 默认 online 自动脉冲，可显式覆盖
  label?: ReactNode;        // 状态文字（在线/降级/离线/维护）
  size?: "sm" | "md" | "lg";
  extra?: ReactNode;        // 尾部数值槽（如「128ms」）
}
```
- status→tone 映射：online=success / degraded=warning / offline=danger / maintenance=neutral。
- 内部复用 `Dot`（传 tone + pulse），外层 inline-flex 包 label + extra。
- 默认 `pulse = status === "online"`。

- [ ] **Step 1: 写失败测试** `status-dot.test.tsx`：
```tsx
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { StatusDot } from "./status-dot";

describe("StatusDot", () => {
  it("渲染语义标签", () => {
    render(<StatusDot status="online" label="在线" />);
    expect(screen.getByText("在线")).toBeInTheDocument();
  });
  it("offline 映射 danger 圆点", () => {
    const { container } = render(<StatusDot status="offline" label="离线" />);
    expect(container.querySelector(".bg-danger")).toBeTruthy();
  });
  it("extra 槽渲染数值", () => {
    render(<StatusDot status="degraded" label="降级" extra="128ms" />);
    expect(screen.getByText("128ms")).toBeInTheDocument();
  });
});
```
- [ ] **Step 2: 跑测试看失败** `pnpm --filter @hulianui/ui test status-dot` → FAIL（模块不存在）
- [ ] **Step 3: 实现** `status-dot.types.ts` + `status-dot.tsx`（复用 Dot，映射表），`index.ts` 导出。
- [ ] **Step 4: 跑测试看通过** → PASS
- [ ] **Step 5: showcase**（controls: status select / pulse boolean；states: 四态 + extra 例；renderWithProps + toCode）
- [ ] **Step 6: 注册**（index.ts / showcase.ts / manifest[`status-dot`, data-display/info] / registry.tsx）
- [ ] **Step 7: 跑全量** `pnpm --filter @hulianui/ui test` → 全绿（含 manifest.test）
- [ ] **Step 8: commit** `feat(ui): 新增 StatusDot 健康状态点(语义 tone 封装 Dot)`

## Task 2: SecretField 组件

**Files:** `packages/ui/src/secret-field/` 5 文件 + 4 处注册。

**接口契约：**
```ts
export type MaskStrategy = "full" | "prefix-suffix";
export interface SecretFieldProps {
  value: string;
  revealed?: boolean;                 // 受控；非受控自管
  onRevealedChange?: (v: boolean) => void;
  maskStrategy?: MaskStrategy;        // 默认 "prefix-suffix"
  copyable?: boolean;                 // 默认 true
  onCopy?: (value: string) => void;
  actions?: ReactNode;                // 重置/吊销动作槽
  readOnly?: boolean; size?: "sm" | "md"; className?: string;
}
```
- 纯函数 `maskSecret(value, strategy)`：full → 全 `•`；prefix-suffix → 前 6 + `…` + 后 4（短串退化全掩）。
- UI：等宽展示掩码/原值 + 眼睛 toggle button + 复制 button（调 toast）+ actions 槽。复用 `Button`(variant ghost/icon) + `_icons` 的 Eye/EyeOff/Copy（缺则补 _icons）。

- [ ] **Step 1: 写失败测试**（纯函数 + 交互）：
```tsx
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { SecretField, maskSecret } from "./secret-field";

describe("maskSecret", () => {
  it("prefix-suffix 保留首尾", () => {
    expect(maskSecret("sk-abcdefgh1234wxyz", "prefix-suffix")).toBe("sk-abc…wxyz");
  });
  it("full 全掩", () => {
    expect(maskSecret("sk-abc", "full")).toMatch(/^•+$/);
  });
  it("短串退化全掩", () => {
    expect(maskSecret("sk-1", "prefix-suffix")).toMatch(/^•+$/);
  });
});
describe("SecretField", () => {
  it("点眼睛显形原值", () => {
    render(<SecretField value="sk-abcdefgh1234wxyz" />);
    expect(screen.queryByText("sk-abcdefgh1234wxyz")).toBeNull();
    fireEvent.click(screen.getByLabelText("显示"));
    expect(screen.getByText("sk-abcdefgh1234wxyz")).toBeInTheDocument();
  });
  it("复制回调拿到原值", () => {
    const onCopy = vi.fn();
    render(<SecretField value="sk-xyz" onCopy={onCopy} />);
    fireEvent.click(screen.getByLabelText("复制"));
    expect(onCopy).toHaveBeenCalledWith("sk-xyz");
  });
});
```
- [ ] **Step 2: 跑测试看失败**
- [ ] **Step 3: 实现** types + tsx（导出 `maskSecret` 纯函数 + `SecretField`）。眼睛/复制 button 带 `aria-label="显示"/"隐藏"/"复制"`。
- [ ] **Step 4: 跑测试看通过**
- [ ] **Step 5: showcase**（受控 revealed 状态 + actions 槽例）
- [ ] **Step 6: 注册**（manifest[`secret-field`, forms/advanced]）
- [ ] **Step 7: 全量测试绿**
- [ ] **Step 8: commit** `feat(ui): 新增 SecretField 密钥掩码字段(显形/复制/动作槽)`

## Task 3: PricingTable 组件

**Files:** `packages/ui/src/pricing-table/` 5 文件 + 4 处注册。

**接口契约：**
```ts
export interface PricingColumn {
  key: string; title: ReactNode;
  highlight?: boolean; badge?: ReactNode; header?: ReactNode;
}
export interface PricingRow {
  key: string; label: ReactNode;
  values: Record<string, ReactNode>;   // colKey → cell
}
export interface PricingTableProps {
  columns: PricingColumn[];
  rows: PricingRow[];
  stickyHeader?: boolean;              // 默认 true
  className?: string;
}
```
- 渲染：首列 = 行 label（属性名），其余列 = 各被比项。highlight 列描边 + 顶部 badge。窄屏外层 `ScrollArea` 横滚。
- 不做排序/分页（对比矩阵是静态对照）。

- [ ] **Step 1: 写失败测试**：
```tsx
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { PricingTable } from "./pricing-table";

const columns = [
  { key: "a", title: "GPT-5.5" },
  { key: "b", title: "Claude Opus 4.7", highlight: true, badge: "推荐" },
];
const rows = [
  { key: "in", label: "输入价", values: { a: "$5", b: "$5" } },
  { key: "out", label: "输出价", values: { a: "$30", b: "$25" } },
];

describe("PricingTable", () => {
  it("渲染列标题与单元格", () => {
    render(<PricingTable columns={columns} rows={rows} />);
    expect(screen.getByText("GPT-5.5")).toBeInTheDocument();
    expect(screen.getByText("$25")).toBeInTheDocument();
  });
  it("highlight 列显角标", () => {
    render(<PricingTable columns={columns} rows={rows} />);
    expect(screen.getByText("推荐")).toBeInTheDocument();
  });
  it("行 label 作首列", () => {
    render(<PricingTable columns={columns} rows={rows} />);
    expect(screen.getByText("输入价")).toBeInTheDocument();
  });
});
```
- [ ] **Step 2: 跑测试看失败**
- [ ] **Step 3: 实现** types + tsx（table 结构 + highlight cva + sticky thead + ScrollArea 包裹）
- [ ] **Step 4: 跑测试看通过**
- [ ] **Step 5: showcase**（3 模型 × 5 属性真实定价例 + highlight badge）
- [ ] **Step 6: 注册**（manifest[`pricing-table`, data-display/collection]）
- [ ] **Step 7: 全量测试绿**
- [ ] **Step 8: commit** `feat(ui): 新增 PricingTable 定价对比矩阵(行列转置·列高亮角标)`

## Task 4: JsonViewer 组件（旗舰）

**Files:** `packages/ui/src/json-viewer/` 5 文件 + 4 处注册。

**接口契约：**
```ts
export interface JsonViewerProps {
  data: unknown;
  rootName?: string;
  defaultExpandedDepth?: number;      // 默认 1
  maxAutoExpandKeys?: number;         // 默认 50：超过的对象/数组折叠保护
  onCopyPath?: (path: string) => void;
  className?: string;
}
// 纯函数（可测）：
export function valueType(v: unknown): "object" | "array" | "string" | "number" | "boolean" | "null";
export function jsonPath(parent: string, keyOrIndex: string | number, isIndex: boolean): string;
```
- 递归子组件 `JsonNode`：折叠箭头 + key（着色）+ `:` + 值（按类型着色）；对象/数组折叠态显 `{…} N keys` / `[…] N items`；
  hover 行右侧显复制按钮（复制该节点值 JSON + 复制 path，调 toast + onCopyPath）。
- 着色走语义 token（string=success 系 / number=brand / boolean=warning / null=muted / key=foreground）。
- 深度 ≤ defaultExpandedDepth 初始展开；对象/数组 key 数 > maxAutoExpandKeys 初始折叠。

- [ ] **Step 1: 写失败测试**（纯函数 + 渲染 + 交互）：
```tsx
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { JsonViewer, valueType, jsonPath } from "./json-viewer";

describe("valueType", () => {
  it("区分 null / array / object", () => {
    expect(valueType(null)).toBe("null");
    expect(valueType([1])).toBe("array");
    expect(valueType({})).toBe("object");
  });
});
describe("jsonPath", () => {
  it("对象用点 数组用方括号", () => {
    expect(jsonPath("$", "model", false)).toBe("$.model");
    expect(jsonPath("$.choices", 0, true)).toBe("$.choices[0]");
  });
});
describe("JsonViewer", () => {
  it("默认展开深度 1 显顶层 key", () => {
    render(<JsonViewer data={{ model: "gpt-5.5", usage: { total: 42 } }} />);
    expect(screen.getByText(/model/)).toBeInTheDocument();
  });
  it("折叠态显计数", () => {
    render(<JsonViewer data={{ usage: { a: 1, b: 2 } }} defaultExpandedDepth={0} />);
    expect(screen.getByText(/2 keys/)).toBeInTheDocument();
  });
  it("点箭头展开嵌套", () => {
    render(<JsonViewer data={{ usage: { total: 42 } }} defaultExpandedDepth={1} />);
    fireEvent.click(screen.getByText(/usage/));
    expect(screen.getByText("42")).toBeInTheDocument();
  });
});
```
- [ ] **Step 2: 跑测试看失败**
- [ ] **Step 3: 实现** types + tsx（valueType / jsonPath 纯函数 + JsonNode 递归 + JsonViewer 外壳）
- [ ] **Step 4: 跑测试看通过**
- [ ] **Step 5: showcase**（真实 chat completion response JSON：messages/usage/tool_calls 嵌套）
- [ ] **Step 6: 注册**（manifest[`json-viewer`, data-display/collection]）
- [ ] **Step 7: 全量测试绿**（ui 测试总数应 +若干，全绿）
- [ ] **Step 8: commit** `feat(ui): 新增 JsonViewer 折叠 JSON 树(语法着色/复制路径/懒展开)`

## Task 5: demo 数据层 + _lib 纯函数

**Files:** `apps/www/app/demos/hanhub/_data/{types,providers,keys,logs,channels,usage}.ts`、`_lib/{pricing,code-gen}.ts`、各自 `.test`（pricing/code-gen 放 `apps/www` 测试位或就近 vitest）。

- [ ] **Step 1: types.ts** —— Provider/Model/ApiKey/RequestLog(含完整 req/resp body)/Channel(latency/successRate/weight/priority/probeHistory)/UsagePoint 类型。
- [ ] **Step 2: pricing.ts + 测试** —— `costOf(promptTok,completionTok,model,markup)`、`topupFee(amount)=max(amount*0.055,0.8)`。先写测试断言 `costOf(1_000_000,0,{in:5,out:25},1)===5`、`topupFee(10)===0.8`，再实现。
- [ ] **Step 3: code-gen.ts + 测试** —— `genCurl/genPython/genNode({model,messages,params,baseUrl,apiKey})` 返回字符串；测试断言 curl 含 `-H "Authorization: Bearer sk-…"` 与 model。
- [ ] **Step 4: providers.ts** —— 10+ 模型真实定价（spec §6）+ 厂商 + 能力标。
- [ ] **Step 5: keys/logs/channels/usage.ts** —— mock 列表；logs 每条带真实 chat completion req/resp body。
- [ ] **Step 6: commit** `feat(demos): hanhub mock 数据层 + 计费/代码生成纯函数(带测试)`

## Task 6: AdminLayout 外壳 + 登录页

**Files:** `app/demos/hanhub/(app)/layout.tsx`、`login/page.tsx`、`_components/nav-config.ts`、`_components/shell.tsx`(client)。

- [ ] **Step 1: nav-config.ts** —— 8 页签 + 图标 + 路由。
- [ ] **Step 2: shell.tsx** —— AdminLayout（品牌「瀚枢 HanHub」+ NavMenu 侧栏 + 多页签 keep-alive + 顶栏余额/用户）。
- [ ] **Step 3: layout.tsx** —— server wrapper 套 shell。
- [ ] **Step 4: login/page.tsx** —— 复用 LoginForm（同其它 demo 风格）。
- [ ] **Step 5: commit** `feat(demos): hanhub AdminLayout 外壳 + 登录页`

## Task 7-14: 八个页面（每页一 commit，dogfood 对应新组件）

每页 server page（output export 安全）+ 必要 client 子组件。100% @hulianui/ui，禁 CSS 补丁。完成即 commit。

- [ ] **Task 7 概览** `(app)/page.tsx` —— KPI(Stat/NumberTicker) + 趋势(Chart) + Top模型 + **StatusDot 健康墙** + 最近请求 + 余额 Banner。
- [ ] **Task 8 模型市场** `models/page.tsx` —— 筛选 + 模型卡网格 + **PricingTable 对比矩阵** + 详情 Drawer(code-block SDK 示例)。
- [ ] **Task 9 API密钥** `keys/page.tsx` —— **SecretField** 列表 + 新建 FormDialog + 用量 meter + 启停 Switch。
- [ ] **Task 10 用量日志** `logs/page.tsx` —— ProTable + 行 Drawer(**JsonViewer** req/resp + Descriptions 计费 + Timeline)。
- [ ] **Task 11 Playground** `playground/page.tsx` —— 模型选择 + 参数 Slider + 流式对话(conversation/streaming-text) + 实时花费计 + 「查看为代码」code-block tab。
- [ ] **Task 12 健康探测** `health/page.tsx` —— 渠道 Table + **StatusDot** + 一键测速(use-health-probe + Spin) + 映射/熔断配置 + 探测历史 Timeline。
- [ ] **Task 13 计费充值** `billing/page.tsx` —— 余额(Chart) + 充值 Choicebox(手续费提示) + 配额 meter + 账单 Table。
- [ ] **Task 14 接入设置** `settings/page.tsx` —— 快速接入 code-block tab + 团队 List + Webhook + 默认限速 Form。

## Task 15: 登记 + 实机自证 + 收尾

- [ ] **Step 1:** `apps/www/app/demos/lib/demos.ts` 加 hanhub 条目（category "AI 应用"，tags: JsonViewer/SecretField/PricingTable/StatusDot/健康探测/计费）。
- [ ] **Step 2:** 跑 `node apps/www/scripts/demos-coverage.mjs` 验证 4 新组件点亮计入覆盖率（应上升）。
- [ ] **Step 3:** CDP 隔离 Chrome-for-Testing 实机：8 页 + login 截图 + 关键交互（密钥显形/复制、日志 JsonViewer 展开、Playground 流式+代码、健康一键测速、定价矩阵），**零 console error**。
- [ ] **Step 4:** `pnpm --filter @hulianui/ui test` 全绿 + `pnpm --filter www build`（或 typecheck）通过。
- [ ] **Step 5: commit** `feat(demos): 第12个 demo 瀚枢 HanHub 大模型 API 中转网关(8页·dogfood 4新组件)`。

## 自查（spec 覆盖）

- spec §4 八页 → Task 7-14 ✓；§5 四组件 → Task 1-4 ✓；§6 mock/费用 → Task 5 ✓；§7 验证 → Task 15 ✓。
- 两条主线：健康探测 → Task 1/12；费用 → Task 3/5/10/11/13 ✓。
- 无占位；类型签名跨任务一致（StatusDot.status / maskSecret / valueType / jsonPath / costOf）。
