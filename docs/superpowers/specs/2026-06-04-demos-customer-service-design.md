# 客服中心 Demo —— 设计 spec

> 2026-06-04 · 内置 demo 项目之一（与 `crm`、`ai-chat` 并列），落点 `apps/www/app/demos/customer-service/`。
> **硬约束：100% 由 `@hulianui/ui` 搭建。缺组件 / 组件不够好用 → 去 `packages/ui` 造或优化，不在 demo 里手搓。**

## 1. 目标与定位

做一个**完整 helpdesk（客服中心）后台**示例，以**人工坐席的实时会话工作台**为旗舰，倒逼组件库在「实时对话 / 坐席台」这个品类上补齐能力。

和已有 demo 的区别：
- `crm` = 中后台表格/看板（管理视角）
- `ai-chat` = AI 助手单线对话（AI 视角）
- `customer-service` = **多会话并发 + 人工坐席 + 实时进线**（客服视角），三栏工作台是 CRM/ai-chat 都没有的形态

## 2. 范围（路由）

route group `(app)` 套 `AdminLayout` 外壳；`login` 在 group 外（无外壳）。根 `/demos/customer-service`。

| 路由 | 页面 | 核心组件 | 实现深度 |
|------|------|----------|----------|
| `/`（根） | **会话工作台（三栏旗舰）** | Conversation/ChatMessage/PromptInput/TypingDots/PromptSuggestions + Avatar/Badge/Tag/Descriptions/Timeline | 旗舰·实时·精雕 |
| `/tickets` | 工单列表 | ProTable（查询区+工具栏+分页） | 做实 |
| `/tickets/[id]` | 工单详情 | Descriptions/Timeline/Tag/Comment/Result | 做实 |
| `/knowledge` | 知识库 | List/Card/Markdown/Input(搜索)/Empty | 做实 |
| `/analytics` | 数据看板 | Stat/Statistic/Chart/Progress | 做实 |
| `/settings` | 设置 | ProForm/Field/Switch/Segmented/Select | 做实 |
| `/login` | 登录页 | LoginForm | 复用 crm 模式 |

## 3. 旗舰：会话工作台（三栏）

```
┌──────────────┬────────────────────────────┬──────────────┐
│ 会话列表      │  对话流                     │ 客户档案     │
│ [全部|待接入] │  ┌─顶部: 客户名+状态+操作─┐  │ 头像/姓名    │
│ ● 张姐 ·2    │  │ 客户气泡(左/surface)    │  │ 标签/等级    │
│ ● 王先生·1   │  │      坐席气泡(右/primary)│  │ 联系方式     │
│ ○ 李娜       │  │ TypingDots「正在输入」  │  │ ─Descriptions│
│ ...          │  └────────────────────────┘  │ 历史工单     │
│              │  [快捷回复 chips]            │ ─Timeline    │
│              │  [PromptInput 输入框][发送]  │              │
└──────────────┴────────────────────────────┴──────────────┘
```

**三栏组成**（demo `_components/workbench/`，全部由 `@hulianui/ui` 拼）：
- **会话列表 `conversation-list.tsx`**：每项 = Avatar + 客户名 + 末条消息预览 + 时间 + 未读 Badge + 状态点（在线/待接入/已结束）。顶部 Segmented 切「全部 / 待接入 / 我的」。
- **对话流 `chat-thread.tsx`**：用 `Conversation` 容器 + `ChatMessage`。客户=role `assistant`（左/surface），坐席=role `user`（右/primary）。客户输入中显 `TypingDots`。底部 `PromptSuggestions`（快捷回复）+ `PromptInput`。
- **客户档案 `customer-panel.tsx`**：Avatar + 等级 Tag + `Descriptions`（手机/地区/注册时长/累计消费）+ `Timeline`（历史工单/互动）。

### 实时引擎 `use-live-conversations.ts`（client hook）

纯前端 mock，`setInterval`/`setTimeout` 驱动，无后端：
1. **进线**：每 ~12s 有概率把一个「待接入」会话推到列表顶、高亮 + 红点未读。
2. **客户 typing**：坐席选中会话后，客户偶发进入 `typing` 态（显 TypingDots），延时后落一条新客户消息。
3. **已读回执**：坐席发送 → 消息 `status` 由 `sending`→`sent`→（延时）`read`。
4. 状态机用 `useReducer`（参照已有 ai-chat 的 reducer 风格）；所有定时器在 unmount 清理。

> 实时只为「活起来」的观感，不追求真实协议。`Math.random` 仅用于进线/typing 概率。

## 4. 对 `@hulianui/ui` 的增强（dogfood 产出）

按「缺了就造、不够好用就优化」逐项落到 `packages/ui`，每个带 showcase + test：

1. **`ChatMessage` 增 `status` 已读回执**（必做）
   - 新增 prop `status?: "sending" | "sent" | "read"`；仅右对齐（role=user）气泡渲染。
   - 视觉：`sending`=单灰勾/转圈、`sent`=单勾、`read`=双蓝勾（用 `_icons` 的 Check / CheckCheck，缺则补图标）。
   - 不破坏现有 API（status 默认 undefined → 不渲染）。
2. **会话列表项**：先在 demo `_components` 内用 List/Avatar/Badge 组合实现；若收敛得干净且通用，再评估提升为 `@hulianui/ui` 的 `ConversationItem` 原语（不强求，避免为单 demo 过度抽象）。
3. 其余缺口（满意度评分展示、坐席状态切换器等）优先用现有组件（Statistic/Progress/Segmented/Switch）组合；确为通用且现有组件别扭时才下沉组件库。

> 原则：**清晰可复用的增强才下沉组件库**（如 ChatMessage.status）；单 demo 专用编排留在 demo `_components`。不为凑数硬造组件。

## 5. 数据层 `_data/`

全部内置静态 mock（参照 crm `_data/` 风格，类型集中 `types.ts`）：
- `types.ts` — Conversation / Message / Customer / Ticket / KnowledgeArticle / Metric / Agent
- `conversations.ts` — 6~8 个会话，各带一段消息历史 + 待投递队列（供实时引擎消费）
- `customers.ts` — 客户档案（与会话关联）
- `tickets.ts` — 工单列表 + 详情
- `knowledge.ts` — 知识库文章（markdown 正文）
- `metrics.ts` — 看板指标（会话量/响应时长/CSAT 满意度/趋势序列）

## 6. 外壳与导航

照 crm 复刻 `cs-shell.tsx` + `nav-config.tsx`：
- 侧栏分组：**工作台**（会话工作台）/ **服务**（工单、知识库）/ **分析**（数据看板）/ **系统**（设置）
- 顶栏：主题切换 + 通知铃（带未读小红点）+ 坐席 User（在线状态切换）
- 多页签 + 面包屑，受控 API 绑 Next 路由（同 crm-shell 模式）
- 品牌：「瑚琏客服」

## 7. 登记

`apps/www/app/demos/lib/demos.ts` 追加一条：
```ts
{ slug: "customer-service", title: "客服中心", description: "实时会话工作台 + 工单 + 知识库 + 数据看板 —— 100% 由 @hulianui/ui 搭建的坐席台示例。", href: "/demos/customer-service", category: "中后台", status: "wip", tags: ["实时会话", "ProTable", "Timeline", "Chart"] }
```

## 8. 验收

- `pnpm --filter @hulianui/ui build` + `pnpm --filter @hulianui/ui test`（组件增强的 showcase/test 通过）
- `pnpm --filter www build`（demo 全路由可构建，类型通过）
- 工作台三栏在桌面宽度正常；实时进线/typing/已读回执观感成立
- 全程零手搓基础组件（grep demo 目录无裸 `<button`/`<input` 等，UI 元素均来自 `@hulianui/ui`）

## 9. 不做（YAGNI）

- 不做真实 WebSocket / 后端（纯 mock 定时器）
- 不做移动端两栏自适应（工作台聚焦桌面坐席台；其余页随 AdminLayout 自然响应）
- 不做鉴权（login 页仅形态展示，同 crm）
- 不做知识库富文本编辑（只读渲染 markdown）
