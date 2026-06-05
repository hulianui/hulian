# Demo 真实化审计报告（2026-06-04）

> 给「另一个会话」执行用。本报告只诊断 + 给可照抄的改造清单，**不在本会话动代码**。
> 验证环境：apps/www dev server（已在跑，端口 5514，Next 16 turbopack 按项目目录去重）。

---

## 0. TL;DR

1. **动画组件没坏**——已实证。误判来源是：dashboard 类 demo 故意不用入场动画 / 或观察端开了 `prefers-reduced-motion`。
2. **真问题**：6 个内置 demo 系统性跳过「真实项目离不开的反馈 / 帮助 / 异步态」组件。它们是**同步 mock + happy-path 的静态展示页**，永远不出现 loading / 空 / 错误 / 确认 / 提示。用户照抄学不到真实交互骨架 → "不像一个项目"。
3. 库里 **187 个组件**，demo 用到 **135 个**（覆盖率不低），但下列**必备件全 demo = 0**：Skeleton、Tooltip、HoverCard、Alert、AlertDialog、Command、Carousel、Combobox、Cascader、Mentions、ContextMenu、Collapsible、Chip。Toast / Spinner / Empty 用得很零散。

---

## 1. 动画：已实证未坏（不要再改组件）

去**实际在跑的 dev server（5514）**抓真实产物：

- 服务的 CSS（`/_next/static/chunks/apps_www_app_globals_*.css`）里 **15 个 `@keyframes hulian-*` 全在**。
- `/demos/website` 页面 HTML 里动画工具类实打实生成：`hulian-marquee`×44、`hulian-orbit`×18、`hulian-aurora`×3、`hulian-shimmer-slide`×3。

机制四层全通：keyframes 加载 ✓ / Tailwind `@source "../../../packages/ui/src/**/*.{ts,tsx}"` 扫到组件源 ✓ / 组件 `[animation:hulian-…]` 引用 ✓ / `@hulianui/tokens` 的 `exports` 直接指向 `src/preset.css` 无陈旧 dist ✓。

**"看不到动画"的两个真实解释（不是 bug）：**
- crm / projects / customer-service / ai-workflow 是中后台 dashboard，**刻意**几乎不用入场动画（企业台要稳）。动画密集的是 `website`。
- 观察端浏览器/系统开了 `prefers-reduced-motion: reduce` → 所有组件的 `motion-reduce:[animation:none]` 全命中 → 连 website 也变死。若在 website 都看不到 Marquee 滚动，基本就是这个。

---

## 2. 真实化缺口：证据

### 2.1 必备组件 × demo 覆盖矩阵（grep 文件级计数）

| 组件 | 库里 | crm | cs | ai-chat | ai-wf | proj | web | 真实角色 |
|---|---|---|---|---|---|---|---|---|
| Skeleton | ✓ | 0 | 0 | 0 | 0 | 0 | 0 | 数据加载占位 |
| Spinner/loading | ✓ | 0 | 1 | 0 | 2 | 0 | 0 | 异步等待 |
| Tooltip | ✓ | 0 | 0 | 0 | 0 | 0 | 0 | 图标钮 / 截断文字帮助 |
| HoverCard | ✓ | 0 | 0 | 0 | 0 | 0 | 0 | 实体悬浮预览 |
| Alert（内联条） | ✓ | 0 | 0 | 0 | 0 | 0 | 0 | 警告 / 错误横幅 |
| AlertDialog | ✓ | 0 | 0 | 0 | 0 | 0 | 0 | 危险操作确认 |
| Popconfirm | ✓ | ✓ | 0 | 0 | 0 | 0 | 0 | 行内删除确认 |
| Command(⌘K) | ✓ | 0 | 0 | 0 | 0 | 0 | 0 | 全局搜索 / 命令面板 |
| Toast | ✓ | ✓ | 4 | 10 | **0** | 3 | 2 | 操作反馈 |
| Empty | ✓ | 2 | 0 | 1 | 0 | 3 | 0 | 列表空态 |
| Carousel/Combobox/Cascader/Mentions/ContextMenu/Collapsible/Chip | ✓ | 0 | 0 | 0 | 0 | 0 | 0 | 各自场景 |

### 2.2 各 demo 交互点扫描（决定改造重点）

| demo | toast | onClick mutation | 危险操作 | 图标钮(疑缺Tooltip) | 已有确认件 |
|---|---|---|---|---|---|
| customer-service | 4 | 11 | 2 | 1 | 0 |
| ai-chat | 10 | 8 | 0 | 1 | 0 |
| **ai-workflow** | **0** | **13** | **2** | 0 | 0 |
| **projects** | 3 | 9 | 2 | **8** | 0 |
| website | 2 | 2 | 0 | 2 | 0 |
| crm | ✓ | — | — | 多 | Popconfirm |

**最痛点**：① ai-workflow 13 个操作零反馈；② projects 8 个图标钮无 Tooltip、删除/作废无确认；③ 全员无异步加载态。

---

## 3. 根因

所有 demo 用 `useState(seed)` 同步注水内存假数据，**瞬间返回**，于是永远不经过：
- **加载态**（Skeleton / Spinner）——没有 async 就没有"加载中"
- **空态**（Empty）——部分有
- **错误态**（Alert / Result）——全无
- **确认**（AlertDialog / Popconfirm）——仅 CRM
- **帮助**（Tooltip / HoverCard）——全无
- **反馈**（Toast）——零散、ai-workflow 完全没有

→ 真实项目 80% 的状态从未被演示。改造的核心不是"多塞几个组件"，而是**把 demo 从同步 happy-path 改成 async-first 的真实交互骨架**。

---

## 4. 共享基建（先建，6 个 demo 共用，避免风格发散）

新建 `apps/www/app/demos/lib/async.ts`：

```ts
"use client";
import { useCallback, useEffect, useState } from "react";

/** demo 用：模拟网络延迟，让 loading/skeleton 等真实态有戏。 */
export const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

/** [min,max] 伪随机延迟。 */
const jitter = (min = 350, max = 800) => min + Math.floor(Math.random() * (max - min));

/** 初始加载态：seed 延迟返回，驱动 Skeleton / ProTable.loading。可选模拟一次失败 + reload 重试。 */
export function useMockData<T>(seed: T, opts?: { delay?: number; failOnce?: boolean }) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const triedRef = useState({ failed: false })[0];
  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    await sleep(opts?.delay ?? jitter());
    if (opts?.failOnce && !triedRef.failed) {
      triedRef.failed = true;
      setError("加载失败，请重试（demo 模拟）");
      setLoading(false);
      return;
    }
    setData(seed);
    setLoading(false);
  }, [seed, opts?.delay, opts?.failOnce, triedRef]);
  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return { data, loading, error, reload: load };
}

/** 提交/动作 pending：包一层延迟 + 自动 try/finally，配 Spinner + disabled。 */
export function usePending() {
  const [pending, setPending] = useState(false);
  const run = useCallback(async (fn: () => void | Promise<void>) => {
    setPending(true);
    try {
      await sleep(jitter(300, 600));
      await fn();
    } finally {
      setPending(false);
    }
  }, []);
  return [pending, run] as const;
}
```

> 注：`Math.random` 在浏览器运行时正常可用（仅 Workflow 脚本沙箱禁用，与此无关）。

---

## 5. 组件 API 速查（已核实，照抄即可）

- **ProTable** 已内置 `loading?: boolean`（`pro-table.types.ts:42`）。list 页只需 `loading={loading}` + 喂 `useMockData` 的数据即可出加载态，无需手搓 Skeleton。
- **Tooltip**（Base UI 桥）：
  ```tsx
  <Tooltip>
    <TooltipTrigger render={<Button variant="ghost" size="iconSm"><Trash2 className="size-3.5" /></Button>} />
    <TooltipContent side="top">删除</TooltipContent>
  </Tooltip>
  ```
  多个共享延迟可包 `<TooltipProvider delay={200}>`。
- **Skeleton**：`<Skeleton className="h-4 w-32" shape="..." />`（`shape` 变体，详看 `skeleton.tsx:19`）。详情页骨架用多个 Skeleton 拼。
- **Spinner**：`<Spinner size="sm" />`，`size: sm|md|lg`，自带 `role=status`。提交钮内：`{pending ? <Spinner size="sm" /> : "保存"}` + `disabled={pending}`。
- **Toast**：`toast({ title, description?, tone: "info"|"danger"|"neutral" })`（现有约定，见 crm/cs）。
- **AlertDialog**：危险且需要"挡一道"的（清空 / 注销 / 批量删除）用 AlertDialog；行内单条删除用已有的 **Popconfirm**（CRM customers 范式）。

---

## 6. 逐 demo 改造清单（可直接派单）

### A. ai-workflow（最优先 · 13 操作 0 反馈）
文件：`_components/canvas/{run-panel,inspector,palette,node-card}.tsx`、`(app)/{templates,gallery,profile}/page.tsx`、`_lib/use-flow-run.ts`
- 运行流水线：ShimmerButton 触发后 → `pending` + Spinner + 禁用；`use-flow-run` 每节点完成/失败 `toast`；整体完成 toast 成功。
- 删除节点 / 清空画布 → AlertDialog 确认 + toast。
- 模板灌入画布、产物下载/删除 → toast 反馈。
- gallery 进入先 `useMockData` → Masonry 上方 Skeleton 占位。
- 画布节点连桩 / 工具栏图标钮 → Tooltip。

### B. projects（次优先 · 8 图标钮 0 Tooltip 0 确认）
文件：`(app)/{tracking,quotes,invoices,checkout,photos}/page.tsx`、`_components/{quote-editor,checkout-cashier,project-detail}.tsx`
- 所有图标钮（8 个：打印 / 预览 / 删除行 / 收银等）→ Tooltip。
- 报价行删除、发票作废、取消收款 → Popconfirm/AlertDialog + toast。
- ProTable 列表（tracking/invoices）→ `useMockData` + `loading`。
- 报价生成器保存 / 生成单据 → `usePending` + Spinner + toast。
- 收银台轮询支付态 → Spinner「等待支付」+ 成功 toast（真实异步感最强的点）。

### C. customer-service（4 toast / 11 操作）
文件：`_components/workbench/*`、`_components/ticket-detail.tsx`、`(app)/{tickets,knowledge,analytics}/page.tsx`
- 会话工作台进线 / 加载历史 → Skeleton + Spinner。
- 工单列表 ProTable → `loading`。
- 转接 / 关闭工单 / 删除知识 → 确认 + toast（补齐到每个 mutation）。
- 坐席头像 / 客户名 → HoverCard 预览资料卡。
- 工具栏图标钮 → Tooltip。

### D. ai-chat（10 toast，已较好 · 补异步 + 帮助）
文件：`page.tsx`、`use-chat-stream.ts`
- 新建会话 / 切换会话加载历史 → Skeleton 气泡。
- 停止生成 / 重新生成 / 复制 → 已有 toast，补 Tooltip 到图标钮（已有 MessageActions）。
- 模型切换下拉可换 Combobox（带搜索）演示。

### E. website（营销页 · 补转化态）
文件：`_components/contact-form.tsx`、`_components/sections/faq.tsx`、`_components/pricing-*.tsx`
- 联系表单提交 → `usePending` + Spinner + 成功 toast / 失败 Alert（演示表单完整态）。
- FAQ 已是 Accordion；定价对比可补 Tooltip 解释每项。
- 顶栏可加 Command ⌘K 站内搜索演示（可选，秀旗舰件）。

### F. crm（最完整 · 补异步 + Tooltip）
文件：`(app)/{customers,opportunities,orders}/page.tsx`、`_components/customer-detail.tsx`
- 三个 ProTable 列表 → `useMockData` + `loading`。
- customers 行内删除钮（纯 Trash2 图标）→ Tooltip「删除」；编辑/查看同理。
- ModalForm 提交 → `usePending` + Spinner + 禁用（现在是同步 setRows）。
- 客户详情头 → HoverCard / Tooltip 补充字段。
- 商机看板卡片 → Tooltip 显示完整金额/负责人。

---

## 7. 验收标准（每个 demo 都要满足）

1. 首次进入列表 / 详情页能看到 **Skeleton / Spinner 加载态**（≥300ms 可见）。
2. **每个**增删改动作都有 toast 反馈（成功 info / 失败 danger）。
3. 危险操作（删除 / 作废 / 清空 / 注销）有 Popconfirm 或 AlertDialog 二次确认。
4. **纯图标按钮**全部有 Tooltip。
5. 列表筛选无结果时显示 Empty；模拟一次加载失败时显示 Alert/Result + 重试。
6. `pnpm --filter @hulianui/ui test` 全绿；6 个 demo 页面 + 子页在 dev server 实机零 console error（用隔离 Chrome-for-Testing，见记忆 [[mcp-browser-busy-launch-isolated-chromium-via-executablepath]]）。

---

## 8. 执行注意

- 共享文件（`demos/lib/*`、`manifest.ts`、`registry.tsx`）当前带其它会话未提交 WIP，落盘用 **hunk 级 `git apply --cached`** 只暂存自己改动（见记忆）。
- 不要为了 demo 好用在 demo 里打 CSS 补丁——撞到组件缺口就去修 `@hulianui/ui` 组件（见记忆 [[fix-component-not-demo-css-patch]]）。
- 验视觉用真实浏览器，别用 headless CLI（apps/www 在 headless 下截图空白，见记忆 [[www-msw-gate-blanks-headless-screenshots]]）。

---

## 9. 净新增发现（第二次审计补充 · 2026-06-04）

第二轮以 `manifest.ts`（用户公开 SSoT）为分母、严格统计**具名 import 命中的 manifest 条目**做覆盖率，补充三个本报告 §2 未覆盖的结论：

### 9.1 覆盖率口径澄清（72% vs 45%）

本报告 §0 说「135/187 覆盖率不低」是按 **demo 里出现的 import 标识符数**计；严格按 **manifest 公开组件条目**（一个 ProTable 不算覆盖了 Table，但 Toast/Notification/Chart/Form 的子件/工厂别名算）只有 **90/187 = 48%**（权威口径见 `scripts/demos-coverage.mjs`，已含别名去重）。两个数字都对，但**面向用户的口径应取严格版**——用户在文档站看到的是 manifest 条目，他想用 `Table`/`DatePicker`/`Tooltip` 时，demo 里有没有真实用例才是他关心的。**对外宣称覆盖率以脚本输出为准（当前 48%），本轮目标拉到 ≥ 60%。**

### 9.2 战略级盲区：整个 mobile 类 0 覆盖 → 没有移动端 demo

`mobile` 分类 7 件（`TabBar` `Fab` `ActionSheet` `Picker` `SwipeAction` `PullToRefresh` `SafeArea`）**全 0**——根因是**根本没有移动端 demo**。这是 demo 矩阵级盲区，比单个组件漏更严重。
→ 建议立**第 7 个 demo：移动端 App**（如「同城服务下单」/「外卖点单」），单独立项 spec，本轮不做但记入 backlog。

### 9.3 设备外壳 mockups 0 覆盖

`Chrome` `Terminal` `iPhone` `Android` `Tablet` `Watch` 全 0。这些正是营销官网「产品多端预览」的天然载体。
→ 并入 website 改造（§6.E）：产品展示区用设备外壳套真实截图，顺带覆盖 mockups 类。

### 9.4 覆盖哲学（用户定调，写入制作要求）

> 「补多了没关系——能把组件塞进真实场景，说明它做对了、有用途。**漏了才是最危险的信号**。」

落地为常驻规范见 `apps/www/app/demos/README.md`（demo 制作要求）+ 覆盖率自检脚本 `apps/www/scripts/demos-coverage.mjs`。

---

## 10. 资源本地化 —— 已完成（2026-06-04 本会话）

第三轮发现 demo 资源全是外链（断网/内网/被墙即碎图，且 picsum 随机图语义错位）。**已修复，勿重做：**

- **门禁加固**：`scripts/demos-coverage.mjs` 新增第二道硬门禁「远程资源外链 = 0」（命中即 exit 1）。识别口径 = 已知占位图服务域名（pravatar/picsum/unsplash/…）+ 带图片/媒体扩展名的 http(s) URL。规范写入 README 铁律四。
- **头像 16 处**（pravatar.cc → 本地）：按 `img` 编号确定性映射到 `public/demo/avatar-{1,2,3,4,12}.jpg`，同 `img#` 同脸（坐席「琏」等同一人到处一致）。涉及 crm/cs/projects/ai-workflow 的 shell + cs `customers.ts`/`metrics.ts`。
- **工作照片 24 张**（picsum.photos → 程序化）：`projects/_data/photos.ts` 新增 `photoArt()`，按 tag 配色（进度=蓝/材料=琥珀/验收=绿/隐患=红）+ 蓝图网格 + 居中文案生成 data-URI SVG，离线零素材、语义贴合。
- 验证：`demos:coverage` 远程外链 0、node exit 0；`Image`/`Avatar` 均裸 `<img src>` 接受 data-URI 与本地路径；typecheck 我方文件零错（仅 `app/theme/doc-kit.tsx` 别的会话 WIP 报错，与此无关）。
