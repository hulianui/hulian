# 客服中心 Demo 实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在 `apps/www/app/demos/customer-service/` 建一个完整 helpdesk 后台 demo，以实时三栏会话工作台为旗舰，100% 由 `@hulianui/ui` 搭建，并为坐席台品类增强组件库（ChatMessage 已读回执）。

**Architecture:** route group `(app)` 套 `AdminLayout` 外壳（照 crm-shell 受控绑 Next 路由）；登录页在 group 外。会话工作台三栏由 `@hulianui/ui` 的 Conversation/ChatMessage/PromptInput/TypingDots 等拼成，实时感由纯前端 `useReducer` + 定时器引擎驱动。数据全静态 mock。

**Tech Stack:** Next.js 15 App Router · React · TypeScript · `@hulianui/ui` · lucide-react

---

## 文件结构

**组件库增强（`packages/ui`）：**
- Modify `src/chat-message/chat-message.types.ts` — 加 `status` prop
- Modify `src/chat-message/chat-message.tsx` — 渲染已读回执
- Modify `src/chat-message/chat-message.test.tsx` — status 测试
- Modify `src/chat-message/chat-message.showcase.tsx` — status 态展示
- Modify `src/_icons/index.ts`（如缺）— Check / CheckCheck 图标

**Demo（`apps/www/app/demos/customer-service/`）：**
- `_data/types.ts` `conversations.ts` `customers.ts` `tickets.ts` `knowledge.ts` `metrics.ts`
- `_components/nav-config.tsx` `cs-shell.tsx`
- `_components/workbench/use-live-conversations.ts`（reducer + 定时器引擎，纯逻辑部分可测）
- `_components/workbench/conversation-list.tsx` `chat-thread.tsx` `customer-panel.tsx` `workbench.tsx`
- `(app)/layout.tsx` `(app)/page.tsx`（工作台）
- `(app)/tickets/page.tsx` `(app)/tickets/[id]/page.tsx`
- `(app)/knowledge/page.tsx` `(app)/analytics/page.tsx` `(app)/settings/page.tsx`
- `login/page.tsx`
- Modify `apps/www/app/demos/lib/demos.ts` — 登记

---

## Task 1: ChatMessage 已读回执（组件库增强 · TDD）

**Files:**
- Modify: `packages/ui/src/chat-message/chat-message.types.ts`
- Modify: `packages/ui/src/chat-message/chat-message.tsx`
- Test: `packages/ui/src/chat-message/chat-message.test.tsx`
- Modify: `packages/ui/src/chat-message/chat-message.showcase.tsx`

- [ ] **Step 1: 读现有 types + 主体**，确认 `ChatMessageProps` 字段与 `_icons` 是否有 Check/CheckCheck。
- [ ] **Step 2: 写失败测试**（追加到 chat-message.test.tsx）

```tsx
it("status=read 在 user 气泡渲双勾回执(role=img aria-label 含已读)", () => {
  const { getByLabelText } = render(<ChatMessage role="user" status="read">在</ChatMessage>);
  expect(getByLabelText("已读")).toBeTruthy();
});
it("status 在 assistant 气泡不渲染回执", () => {
  const { queryByLabelText } = render(<ChatMessage role="assistant" status="read">在</ChatMessage>);
  expect(queryByLabelText("已读")).toBeNull();
});
it("status=sending 渲染发送中回执", () => {
  const { getByLabelText } = render(<ChatMessage role="user" status="sending">在</ChatMessage>);
  expect(getByLabelText("发送中")).toBeTruthy();
});
```

- [ ] **Step 3: 跑测试确认失败** `pnpm --filter @hulianui/ui test chat-message`，预期 FAIL（status 未实现）。
- [ ] **Step 4: types 加字段**

```ts
// chat-message.types.ts，ChatMessageProps 内
/** 已读回执（仅 role=user 右气泡渲染）。 */
status?: "sending" | "sent" | "read";
```

- [ ] **Step 5: 主体渲染回执**。在 chat-message.tsx：
  - 解构出 `status`；
  - 仅 `isUser && status` 时，在气泡 meta 行（name/timestamp 那行，或气泡下方）渲染一个 receipt：
    - `sending` → `aria-label="发送中"`，转圈/单灰勾；
    - `sent` → `aria-label="已送达"`，单勾 `Check`；
    - `read` → `aria-label="已读"`，双蓝勾 `CheckCheck`（text-primary）。
  - 若 `_icons` 缺 Check/CheckCheck，先在 `_icons` 补（参照库内其它图标定义方式）。

- [ ] **Step 6: 跑测试确认通过** `pnpm --filter @hulianui/ui test chat-message`，预期 PASS。
- [ ] **Step 7: showcase 加 status 态**（在 states 数组追加一个「坐席发送·已读」示例，并给 controls 加 status select）。
- [ ] **Step 8: 提交** `git commit -m "feat(ui): ChatMessage 加已读回执 status —— 坐席台进线/已读观感"`

---

## Task 2: 数据层 `_data/`

**Files:** Create `apps/www/app/demos/customer-service/_data/{types,conversations,customers,tickets,knowledge,metrics}.ts`

- [ ] **Step 1: types.ts** —— 定义类型（无 any）：

```ts
export type ConversationStatus = "waiting" | "active" | "closed";
export type MessageAuthor = "customer" | "agent" | "system";
export interface Message { id: string; author: MessageAuthor; text: string; at: string; status?: "sending" | "sent" | "read"; }
export interface Customer { id: string; name: string; avatar?: string; level: "普通" | "银卡" | "金卡" | "黑卡"; phone: string; region: string; since: string; totalSpend: number; tags: string[]; }
export interface Conversation { id: string; customerId: string; status: ConversationStatus; channel: "网页" | "App" | "微信" | "电话"; unread: number; lastAt: string; messages: Message[]; queued: Message[]; }
export interface Ticket { id: string; subject: string; customerName: string; priority: "低" | "中" | "高" | "紧急"; status: "待处理" | "处理中" | "待回复" | "已解决"; assignee: string; channel: string; createdAt: string; updatedAt: string; description: string; timeline: { at: string; actor: string; text: string }[]; }
export interface KnowledgeArticle { id: string; title: string; category: string; excerpt: string; body: string; views: number; updatedAt: string; }
export interface Metric { label: string; value: string; delta?: number; hint?: string; }
```

- [ ] **Step 2: customers.ts** —— 6 个客户（含 avatar pravatar、等级、标签）。
- [ ] **Step 3: conversations.ts** —— 6~8 个会话，关联 customerId；`messages` 是已展示历史，`queued` 是供实时引擎逐条投递的客户后续消息；含 waiting/active/closed 三种态。
- [ ] **Step 4: tickets.ts** —— 8~10 条工单（覆盖各优先级/状态），每条带 description + timeline。
- [ ] **Step 5: knowledge.ts** —— 6 篇知识库文章（markdown body）。
- [ ] **Step 6: metrics.ts** —— 看板指标卡 + 趋势序列（会话量按小时、CSAT、响应时长、渠道分布）供 Chart 用。
- [ ] **Step 7: 提交** `git commit -m "feat(demo): 客服中心 mock 数据层(会话/客户/工单/知识库/指标)"`

---

## Task 3: 外壳 + 导航 + 登记

**Files:** Create `_components/nav-config.tsx` `_components/cs-shell.tsx` `(app)/layout.tsx` `login/page.tsx`; Modify `demos/lib/demos.ts`

- [ ] **Step 1: nav-config.tsx** —— 照 crm 复刻，CS_ROOT=`/demos/customer-service`。菜单分组：工作台（会话工作台→根）/ 服务（工单 `/tickets`、知识库 `/knowledge`）/ 分析（数据看板 `/analytics`）/ 系统（设置 `/settings`）。含 selectedKeyFor / breadcrumbFor（覆盖 `/tickets/[id]`→追加「工单详情」）/ labelOf / titleFor。
- [ ] **Step 2: cs-shell.tsx** —— 照 crm-shell 复刻 AdminLayout 受控绑路由；品牌「瑚琏客服」；HeaderExtra 含主题切换 + 通知铃（红点）+ 坐席 User。
- [ ] **Step 3: (app)/layout.tsx** —— `h-dvh` 包 `<CsShell>`。
- [ ] **Step 4: login/page.tsx** —— 照 crm/login 用 LoginForm，提交后 `router.push(CS_ROOT)`。
- [ ] **Step 5: demos.ts 追加** customer-service 条目（见 spec §7）。
- [ ] **Step 6: 提交** `git commit -m "feat(demo): 客服中心外壳+导航+登录+清单登记"`

---

## Task 4: 实时引擎 `use-live-conversations.ts`

**Files:** Create `_components/workbench/use-live-conversations.ts`; Test `_components/workbench/use-live-conversations.test.ts`（仅测 reducer 纯函数）

- [ ] **Step 1: 设计 state/action**

```ts
// State: { conversations, activeId, typingById }
// Actions: SELECT(id) | DELIVER_QUEUED(convId) | SET_TYPING(convId,bool)
//        | SEND(convId,text) | RECEIPT(convId,msgId,status) | INCOMING(convId)
```

- [ ] **Step 2: 写 reducer 失败测试**

```ts
it("SEND 追加坐席消息(status=sending)并清未读", () => {
  const s = reducer(initial, { type: "SEND", convId: "c1", text: "您好", msgId: "m9", at: "10:00" });
  const c = s.conversations.find(c => c.id === "c1")!;
  expect(c.messages.at(-1)).toMatchObject({ author: "agent", status: "sending" });
});
it("RECEIPT 更新指定坐席消息 status", () => {
  const sent = reducer(initial, { type: "SEND", convId: "c1", text: "x", msgId: "m9", at: "1" });
  const read = reducer(sent, { type: "RECEIPT", convId: "c1", msgId: "m9", status: "read" });
  expect(read.conversations.find(c=>c.id==="c1")!.messages.find(m=>m.id==="m9")!.status).toBe("read");
});
it("SELECT 把该会话未读清零", () => {
  const s = reducer(initial, { type: "SELECT", id: "c1" });
  expect(s.conversations.find(c=>c.id==="c1")!.unread).toBe(0);
  expect(s.activeId).toBe("c1");
});
it("DELIVER_QUEUED 从 queued 取一条进 messages 并加未读(非 active 时)", () => {
  const s = reducer(initial, { type: "DELIVER_QUEUED", convId: "c2" });
  const c = s.conversations.find(c=>c.id==="c2")!;
  expect(c.messages.at(-1)!.author).toBe("customer");
});
```

- [ ] **Step 3: 跑测试确认失败** `pnpm --filter www test use-live-conversations`（或 www 的 vitest），预期 FAIL。
- [ ] **Step 4: 实现 reducer**（纯函数，不可变更新）+ `useLiveConversations()` hook：
  - hook 内 `useReducer(reducer, seed)`；
  - 定时器：每 ~12s `INCOMING`（随机挑一个 waiting 会话置顶高亮）；选中会话后偶发 `SET_TYPING(true)` → 延时 `DELIVER_QUEUED` + `SET_TYPING(false)`；`SEND` 后 `setTimeout` 链 `RECEIPT sent`→`read`；
  - 所有定时器 `useEffect` 清理；
  - 暴露 `{ conversations, active, typing, select, send }`。
- [ ] **Step 5: 跑测试确认通过**，预期 PASS。
- [ ] **Step 6: 提交** `git commit -m "feat(demo): 客服会话实时引擎(reducer+定时器·进线/typing/已读)"`

---

## Task 5: 三栏工作台组件

**Files:** Create `_components/workbench/{conversation-list,chat-thread,customer-panel,workbench}.tsx`; `(app)/page.tsx`

- [ ] **Step 1: conversation-list.tsx** —— 顶部 `Segmented`（全部/待接入/我的）；列表每项 Avatar + 名 + 末条预览 + 时间 + 未读 `Badge` + 状态点；选中高亮；点击 `onSelect(id)`。全部用 `@hulianui/ui`。
- [ ] **Step 2: chat-thread.tsx** —— `Conversation` 容器内 map `ChatMessage`（customer→role assistant 左、agent→role user 右 + `status`）；客户 typing 时尾部 `TypingDots`；底部 `PromptSuggestions`（快捷回复）+ `PromptInput`（回车/点发 → `onSend(text)`）。
- [ ] **Step 3: customer-panel.tsx** —— Avatar + 等级 `Tag` + `Descriptions`（手机/地区/注册/消费）+ 历史工单 `Timeline`。
- [ ] **Step 4: workbench.tsx** —— `"use client"`；调 `useLiveConversations()`；三栏 grid 布局（`grid-cols-[280px_1fr_320px]`，`h-full`，中栏内部滚动）；接线三个子组件。
- [ ] **Step 5: (app)/page.tsx** —— 渲染 `<Workbench/>`，外层撑满 AdminLayout content 高度。
- [ ] **Step 6: 提交** `git commit -m "feat(demo): 客服三栏会话工作台(列表/对话流/客户档案)"`

---

## Task 6: 工单 / 知识库 / 看板 / 设置 页

**Files:** Create `(app)/tickets/page.tsx` `(app)/tickets/[id]/page.tsx` `(app)/knowledge/page.tsx` `(app)/analytics/page.tsx` `(app)/settings/page.tsx`

- [ ] **Step 1: tickets/page.tsx** —— `ProTable`：列（工单号/主题/客户/优先级 Tag/状态 Tag/受理人/更新时间/操作）；查询区（主题搜索 + 状态/优先级 Select）；行点击跳 `/tickets/[id]`。
- [ ] **Step 2: tickets/[id]/page.tsx** —— `Descriptions` 概要 + 优先级/状态 `Tag` + `Timeline` 处理进展 + 回复区（Textarea + Button）。
- [ ] **Step 3: knowledge/page.tsx** —— 顶部搜索 `Input` + 分类 `Segmented`；`Card` 网格列出文章；点击展开/抽屉用 `Markdown` 渲染 body；空态 `Empty`。
- [ ] **Step 4: analytics/page.tsx** —— 顶部 `Stat`/`Statistic` 指标卡行（会话量/平均响应/CSAT/解决率）；`Chart` 折线（会话量趋势）+ 饼/柱（渠道分布）；`Progress` CSAT 条。
- [ ] **Step 5: settings/page.tsx** —— `ProForm`/`Field`：坐席资料（Input）+ 自动回复（Switch）+ 接待上限（NumberField/Slider）+ 工作时段（Segmented/Select）+ 保存 Button。
- [ ] **Step 6: 提交** `git commit -m "feat(demo): 客服工单/知识库/数据看板/设置页"`

---

## Task 7: 验收

- [ ] **Step 1: 组件库** `pnpm --filter @hulianui/ui test` + `pnpm --filter @hulianui/ui build` 全绿。
- [ ] **Step 2: www 类型/构建** `pnpm --filter www build`（关注 customer-service 全路由编译通过、无类型错误）。
- [ ] **Step 3: dogfood 自检** `grep -rnE "<(button|input|table|select)[ >]" apps/www/app/demos/customer-service`，确认无裸 HTML 控件（应均来自 `@hulianui/ui`；语义化容器如 div/span/section 允许）。
- [ ] **Step 4: 起 dev 实机观感**（`pnpm --filter www dev`）：工作台三栏、进线高亮、typing、已读回执、各页可达。
- [ ] **Step 5: 收尾提交**（如有微调）。

---

## Self-Review 结论

- **Spec 覆盖**：§2 路由 → Task 3/5/6；§3 工作台+实时 → Task 4/5；§4 组件增强 → Task 1；§5 数据 → Task 2；§6 外壳 → Task 3；§7 登记 → Task 3；§8 验收 → Task 7。无遗漏。
- **类型一致**：Message.status 枚举（sending/sent/read）与 ChatMessage.status（Task 1）、reducer RECEIPT（Task 4）三处一致。
- **无占位**：各步含实际代码/命令。
