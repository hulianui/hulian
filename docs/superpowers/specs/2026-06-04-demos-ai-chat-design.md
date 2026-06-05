# 内置 Demo 项目 · 首发 AI 对话工具 — 设计

> 日期：2026-06-04 · 状态：已与用户确认，待写实现计划
> 核心约束：**100% 用 `@hulianui/ui` 搭建**。撞到组件缺口/不满足 → 就地扩库或加新组件，禁止在页面手搓本应是组件的 UI。

## 1. 目标

在文档站 `apps/www` 新增「内置 Demo 项目」区，证明瑚琏组件能拼出**真实可用的产品**，而不仅是组件孤岛。首发一个 demo：**AI 对话工具**，可交互、走真流式。Demo 区设计为可增长（未来加 dashboard 等）。

## 2. 信息架构 / 路由

与 `/components`、`/theme` 平级新增 `/demos` 区：

| 文件 | 职责 |
|---|---|
| `apps/www/lib/demos.ts` | Demo 元数据 SSoT（纯数据，零 `@hulianui/ui` import，仿 `manifest.ts`）：`{ slug, title, tagline, desc, icon, tags, status, href }[]` |
| `apps/www/app/demos/layout.tsx` | 区级外壳：返回首页链接 + wordmark + `AnimatedThemeToggler`，复用 `/components` 的壳模式 |
| `apps/www/app/demos/page.tsx` | **画廊索引**：读 `demos.ts`，`BentoGrid`/`Card` 渲染 demo 卡片 + 「更多 demo·敬请期待」占位卡 |
| `apps/www/app/demos/ai-chat/page.tsx` | **AI 对话详情页**（具名路由文件夹，非 `[slug]` 动态注册——demo 是定制重页面而非数据驱动文档；URL 仍是 `/demos/ai-chat`） |

**决策：具名路由文件夹 vs `[slug]` 动态注册** → 选具名文件夹。理由：每个 demo 是 bespoke 客户端重组件，动态注册要维护 slug→component 映射表且把所有 demo 打进一个 bundle，得不偿失。`demos.ts` 只存元数据用于画廊卡片，`href` 直指具名路由。

## 3. 首页改动（图中红框）

Hero 的 CTA `Stack` 行新增第三个按钮：

```tsx
<Button variant="ghost" render={<Link href="/demos" />} className="group h-11 px-5">
  看示例 <ArrowRight ... />
</Button>
```

与「浏览 N 个组件」「主题 Token」并排。**Hero 不改两栏布局，最小侵入。** 可选：在分类导航或底部加一行「示例项目」入口，但 MVP 只动 CTA 行。

## 4. AI 对话工具页（核心）

### 4.1 布局（用 hulian 原语拼真实产品壳）

```
┌─────────────────────────────────────────────┐
│ 顶栏: 标题 + 模型 Select + 新建对话 Button       │
├──────────┬──────────────────────────────────┤
│ 会话列表  │  对话主区                          │
│ rail     │  ┌────────────────────────────┐   │
│ (List +  │  │ Conversation (autoScroll)  │   │
│ Avatar)  │  │  · ChatMessage user        │   │
│          │  │  · ThinkingBlock           │   │
│ 移动端折叠 │  │  · ToolCall                │   │
│          │  │  · ChatMessage assistant   │   │
│          │  │    (StreamingText/Prose +  │   │
│          │  │     Citation + Actions)    │   │
│          │  └────────────────────────────┘   │
│          │  PromptInput (loading/onStop)     │
└──────────┴──────────────────────────────────┘
```

- 左侧 rail：`List` + `Avatar` + `Button`，静态假会话数据（≥3 条），点击切换高亮（纯前端状态，不做多会话持久化）。移动端用 `Drawer` 或断点折叠。
- 主区顶部：`Stack` 标题栏 + `Select`（模型选择，假选项 GPT-4o / Claude / …，仅 UI）。

### 4.2 对话区组件映射（100% hulian）

| 区域 | 组件 |
|---|---|
| 空状态（首条消息前） | `Empty` + `PromptSuggestions`（4 个启动 prompt） |
| 消息流容器 | `Conversation`（`autoScroll`，给定 `h-[...]` 独立滚动区） |
| 单条消息气泡 | `ChatMessage`（user/assistant 双向 + `Avatar`） |
| 推理过程 | `ThinkingBlock`（可折叠，流式追加） |
| 工具调用 | `ToolCall`（假工具：查天气 / 搜索 / 计算器） |
| 流式正文 | `StreamingText`（流式中逐字+光标；`done` 后切 `Prose` 渲染 markdown — 消费侧组合，非缺口） |
| 引用来源 | `Citation` |
| 等待态（请求已发、首 token 未到） | `TypingDots` |
| 消息操作 | `MessageActions`（复制 / 赞 / 踩 / 重新生成） |
| 输入框 | `PromptInput`（`actions` 槽放附件按钮 + 模型快捷） |

### 4.3 数据流（真流式 · 走 MSW）

**Mock 端**（`@hulianui/mocks`，workspace 基建包，非 UI 库）：
- 新增 `POST /api/chat` handler，返回 chunked `ReadableStream`（SSE 风格 `data: {json}\n\n`）。
- 把一段**预设脚本**编码成有序事件流：
  `thinking`（增量）→ `tool_call` → `tool_result` → `text`（逐 token）→ `citation` → `done`。
- 每个 chunk 间 `delay()` 模拟真实节奏（思考慢、吐字快）。
- 按请求里用户消息的关键词匹配 2-3 套预设回答（天气 / 写代码 / 解释概念 / 兜底），点 `PromptSuggestions` 或自由输入都能触发。

**页面端**（`demos/ai-chat/page.tsx`，client component）：
- `fetch("/api/chat", {signal})` + `response.body.getReader()` 逐 chunk 解析事件，驱动一个对话状态机：
  ```
  idle → sending(TypingDots) → thinking(ThinkingBlock追加)
       → tool(ToolCall) → streaming(StreamingText追加) → done(Prose+Actions)
  ```
- `PromptInput` 的 `loading` 绑生成中、`onStop` 接 `AbortController.abort()` 实现「停止生成」。
- 消息列表存在 `useReducer`/`useState`，每条 assistant 消息含 `{ thinking, toolCalls, text, citations, status }`。

> 注：`Date.now()/Math.random()` 的限制只针对 Workflow 脚本，不影响 app 运行时代码，页面里用定时器/随机均可。

## 5. 库改动（按需 · 目前预判为零）

现有 11 个 AI 组件 + 布局原语足够拼出全页。**实现中若撞到真实缺口**，就地扩 `packages/ui` 并补 showcase，而非在页面手搓。预判风险点（实现时验证）：
- `StreamingText` 注释已说 markdown 外包 `Prose` → 流式中 `StreamingText`、`done` 后 `Prose`，属消费侧组合，**非缺口**。
- `ChatMessage` 是否支持 assistant 侧塞任意 children（ThinkingBlock/ToolCall/Actions）→ 实现前先读其 API；若只接 `content` 字符串则需扩 children 槽（**潜在库改动**）。
- `ToolCall` 是否支持 pending→success 状态切换（流式中工具先 pending 后 result）→ 实现前读 API；不支持则扩。
- 左侧会话 rail 若发现是通用模式，可考虑后续抽 `ChatSidebar`，但 MVP 用 `List` 拼，不预先抽象（YAGNI）。

## 6. 范围红线（YAGNI）

- 只做 AI 对话一个 demo，画廊放占位卡。
- 会话 rail 静态假数据，不做多会话持久化 / 切换重放。
- 不接真实 LLM，全程 MSW 脚本。
- 不做登录 / 设置 / 历史搜索等外围。

## 7. 验收

- 首页红框处出现「看示例 →」，点击进 `/demos` 画廊。
- `/demos` 画廊展示 AI 对话卡片 + 占位卡。
- `/demos/ai-chat` 可输入发送，依次看到 TypingDots → ThinkingBlock → ToolCall → StreamingText 逐字 → Citation → MessageActions，全程组件来自 `@hulianui/ui`。
- 「停止生成」可中断流。
- 明暗主题切换无异常，移动端 rail 折叠可用。
- 任何手搓的本应是组件的 UI = 不合格，需回填为 hulian 组件。
