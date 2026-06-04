# 内置 Demo 项目 · AI 对话工具 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在文档站 `apps/www` 新增 `/demos` 区，首发一个可交互、走 MSW 真流式的 AI 对话工具，100% 用 `@hulian/ui` 搭建。

**Architecture:** `demos.ts` 元数据 SSoT → `/demos` 画廊 → `/demos/ai-chat` 详情页。详情页用 dogfood `Layout`（Sider=会话 rail + Content=对话区）搭壳；对话编排靠一个 `useReducer` 状态机消费 MSW `/api/chat` 的 SSE 流，驱动 AI 组件渲染。Mock 端的脚本选择 + SSE 编码抽成纯函数单测。

**Tech Stack:** Next.js App Router · `@hulian/ui`（AI 组件 + Layout/List/Select/Empty/Drawer/Prose）· `@hulian/mocks`（MSW handler + ReadableStream SSE）· Vitest（纯逻辑单测）· lucide-react（app 级图标，www 已用）。

## 硬门禁（每个 UI 任务都适用）

- **100% `@hulian/ui`**：页面里凡是"本应是组件"的东西（按钮/输入/列表项/气泡/选择器/抽屉/空状态…）必须用库组件或布局原语拼，禁止手搓 styled `<div>` 替代组件。
- 撞到**缺口或不顺手** → 停下，先去 `packages/ui` 造/优化组件（含 `*.types.ts` + `index.ts` 导出 + `*.showcase.tsx`），再回页面消费。库改动单独 commit。
- 排版/间距用 `Stack`/`Layout`/Tailwind 工具类是允许的（这就是"用 hulian 布局原语"）。

---

## File Structure

**新建：**
- `apps/www/lib/demos.ts` — demo 元数据 SSoT（纯数据）
- `apps/www/app/demos/layout.tsx` — `/demos` 区级外壳
- `apps/www/app/demos/page.tsx` — 画廊索引
- `apps/www/app/demos/ai-chat/page.tsx` — AI 对话页（client，薄壳，组合下面三件）
- `apps/www/app/demos/ai-chat/chat-types.ts` — 对话域类型 + reducer（纯逻辑）
- `apps/www/app/demos/ai-chat/use-chat-stream.ts` — fetch+SSE 流消费 hook
- `apps/www/app/demos/ai-chat/conversations.ts` — 左侧 rail 静态假会话数据
- `packages/mocks/src/chat-script.ts` — 脚本选择 + SSE 事件序列（纯函数，可单测）
- `packages/mocks/src/chat-script.test.ts` — chat-script 单测

**修改：**
- `apps/www/app/page.tsx` — Hero CTA 行加「看示例 →」按钮（红框处）
- `packages/mocks/src/handlers.ts` — 加 `POST /api/chat` handler
- `packages/mocks/src/index.ts` — 导出 chat-script 类型（供页面复用 SSE 事件类型）

---

## Task 1: demos 元数据 SSoT + 首页 CTA 按钮

**Files:**
- Create: `apps/www/lib/demos.ts`
- Modify: `apps/www/app/page.tsx`（CTA `Stack` 段，约 171-193 行）

- [ ] **Step 1: 写 demos.ts**

```ts
// apps/www/lib/demos.ts
// 内置 Demo 项目元数据 —— 纯数据 SSoT，零 @hulian/ui import，server/client 皆可读。
// 仿 manifest.ts：画廊卡片从此渲染；每个 demo 是具名路由文件夹（非 [slug] 动态注册）。
export type DemoStatus = "live" | "coming-soon";

export interface DemoMeta {
  slug: string;
  title: string;
  tagline: string;          // 一句话定位
  desc: string;             // 卡片副文案
  /** lucide-react 图标名，页面侧映射成组件（保持本文件零 import）。 */
  icon: "bot" | "layout-dashboard" | "table-2";
  tags: string[];
  status: DemoStatus;
  href: string;             // live 指向具名路由；coming-soon 为 ""
}

export const DEMOS: DemoMeta[] = [
  {
    slug: "ai-chat",
    title: "AI 对话工具",
    tagline: "一个能跑的 AI agent 对话产品",
    desc: "会话列表 · 流式回复 · 思考过程 · 工具调用 · 引用来源，全部用瑚琏 AI 组件拼成。",
    icon: "bot",
    tags: ["AI", "流式", "MSW"],
    status: "live",
    href: "/demos/ai-chat",
  },
];

/** 画廊占位卡数量（"敬请期待"）。 */
export const DEMO_COMING_SOON = 2;
```

- [ ] **Step 2: 首页加 CTA 按钮**

在 `apps/www/app/page.tsx` 的 CTA `Stack`（现有「浏览组件」「主题 Token」两个 Button 之后、`</Stack>` 之前）插入第三个按钮：

```tsx
          <Button variant="ghost" render={<Link href="/demos" />} className="group h-11 px-5">
            看示例
            <ArrowRight
              className="size-4 transition-transform group-hover:translate-x-0.5"
              aria-hidden
            />
          </Button>
```

（`Button`/`ArrowRight`/`Link` 页面已 import，无需新增 import。）

- [ ] **Step 3: 构建验证**

Run: `pnpm --filter www build`（或 `pnpm --filter www dev` 后看页面）
Expected: 编译通过，首页 CTA 出现三个按钮。

- [ ] **Step 4: Commit**

```bash
git add apps/www/lib/demos.ts apps/www/app/page.tsx
git commit -m "feat(www): demos 元数据 SSoT + 首页「看示例」CTA"
```

---

## Task 2: MSW `/api/chat` 脚本逻辑（纯函数 + 单测，TDD）

把"按用户消息选脚本"和"脚本→SSE 事件序列"做成纯函数，先测后写。

**Files:**
- Create: `packages/mocks/src/chat-script.ts`
- Test: `packages/mocks/src/chat-script.test.ts`

- [ ] **Step 1: 写失败测试**

```ts
// packages/mocks/src/chat-script.test.ts
import { describe, it, expect } from "vitest";
import { selectScript, scriptToEvents, type ChatEvent } from "./chat-script";

describe("selectScript", () => {
  it("命中天气脚本（含工具调用）", () => {
    const s = selectScript("北京今天天气怎么样");
    expect(s.id).toBe("weather");
    expect(s.tool).toBeDefined();
  });
  it("命中代码脚本（含 markdown 代码块）", () => {
    const s = selectScript("帮我写一个快速排序");
    expect(s.id).toBe("code");
    expect(s.answer).toContain("```");
  });
  it("命中解释脚本（含引用）", () => {
    const s = selectScript("解释一下什么是闭包");
    expect(s.id).toBe("explain");
    expect(s.citations.length).toBeGreaterThan(0);
  });
  it("无关键词走兜底脚本", () => {
    const s = selectScript("随便聊聊");
    expect(s.id).toBe("fallback");
  });
});

describe("scriptToEvents", () => {
  it("事件序列以 thinking 开头、done 结尾，含 text_delta", () => {
    const events = scriptToEvents(selectScript("解释一下闭包"));
    expect(events[0].type).toBe("thinking_delta");
    expect(events.at(-1)!.type).toBe("done");
    expect(events.some((e: ChatEvent) => e.type === "text_delta")).toBe(true);
  });
  it("天气脚本含 tool + tool_result 事件", () => {
    const events = scriptToEvents(selectScript("上海天气"));
    expect(events.some((e) => e.type === "tool")).toBe(true);
    expect(events.some((e) => e.type === "tool_result")).toBe(true);
  });
  it("text_delta 拼接还原完整答案", () => {
    const script = selectScript("写快速排序");
    const events = scriptToEvents(script);
    const text = events.filter((e) => e.type === "text_delta").map((e: any) => e.text).join("");
    expect(text).toBe(script.answer);
  });
});
```

- [ ] **Step 2: 跑测试确认失败**

Run: `pnpm --filter @hulian/mocks test`（若无 test script，用 `pnpm --filter @hulian/mocks exec vitest run chat-script`）
Expected: FAIL —「Cannot find module './chat-script'」。

> 注：若 `@hulian/mocks` 无 vitest 配置，本步附带在 package.json 加 `"test": "vitest run"` 并装 `vitest` devDep（与仓库其他包一致），单独 commit。

- [ ] **Step 3: 写 chat-script.ts**

```ts
// packages/mocks/src/chat-script.ts
// AI 对话 demo 的预设脚本 + SSE 事件序列（纯函数，可单测，无副作用/无定时器）。
// MSW handler 消费 scriptToEvents 的结果，逐个 enqueue 并夹 delay。

export interface ScriptTool {
  name: string;
  input: string;   // JSON 文本
  output: string;  // JSON / 文本
}
export interface ScriptCitation {
  index: number;
  title: string;
  source: string;
  href: string;
}
export interface ChatScript {
  id: "weather" | "code" | "explain" | "fallback";
  thinking: string;          // 推理过程全文
  tool?: ScriptTool;         // 可选工具调用
  answer: string;            // assistant 正文（可含 markdown）
  citations: ScriptCitation[];
}

const SCRIPTS: Record<ChatScript["id"], ChatScript> = {
  weather: {
    id: "weather",
    thinking:
      "用户在问某地天气。我没有实时数据，应调用天气工具查询，再用自然语言总结结果。",
    tool: {
      name: "get_weather",
      input: `{ "city": "北京", "unit": "celsius" }`,
      output: `{ "temp": 21, "condition": "多云转晴", "humidity": "45%", "wind": "微风 2 级" }`,
    },
    answer:
      "北京今天**多云转晴**，气温约 **21°C**，湿度 45%，微风 2 级，体感舒适，适合外出。出门带件薄外套即可。",
    citations: [],
  },
  code: {
    id: "code",
    thinking:
      "用户想要快速排序实现。给出简洁的 JS 版本，并补一句复杂度说明，方便直接复制使用。",
    answer:
      "下面是一个简洁的快速排序实现：\n\n```js\nfunction quickSort(arr) {\n  if (arr.length <= 1) return arr;\n  const [pivot, ...rest] = arr;\n  const left = rest.filter((x) => x < pivot);\n  const right = rest.filter((x) => x >= pivot);\n  return [...quickSort(left), pivot, ...quickSort(right)];\n}\n```\n\n平均时间复杂度 **O(n log n)**，最坏 O(n²)（已近乎有序时）。生产环境建议随机选 pivot 以规避最坏情况。",
    citations: [],
  },
  explain: {
    id: "explain",
    thinking:
      "用户想理解闭包概念。先给一句话定义，再用'函数记住它出生时的作用域'打比方，最后附权威来源。",
    answer:
      "**闭包**是指函数与其定义时所在的词法作用域的组合——即便在该作用域之外执行，函数依然能访问当时的变量。\n\n打个比方：函数像带着一个"背包"出门，背包里装着它出生时能看到的变量，走到哪都能取用。常见于回调、模块私有状态、柯里化等场景。",
    citations: [
      {
        index: 1,
        title: "Closures - MDN Web Docs",
        source: "developer.mozilla.org",
        href: "https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Closures",
      },
    ],
  },
  fallback: {
    id: "fallback",
    thinking: "这是一个开放式问题，没有特定意图。给一个友好、引导性的回复，提示用户可以问什么。",
    answer:
      "我可以帮你查天气、写代码、解释技术概念等等。试试问我「北京今天天气怎么样」「帮我写一个快速排序」或「解释一下什么是闭包」？",
    citations: [],
  },
};

/** 按用户消息关键词选脚本（无命中走 fallback）。 */
export function selectScript(message: string): ChatScript {
  const m = message.toLowerCase();
  if (/天气|气温|下雨|weather/.test(m)) return SCRIPTS.weather;
  if (/代码|快速排序|排序|函数|写一个|code|算法/.test(m)) return SCRIPTS.code;
  if (/解释|什么是|闭包|原理|概念|为什么/.test(m)) return SCRIPTS.explain;
  return SCRIPTS.fallback;
}

// ── SSE 事件协议（页面与 mock 共享） ──
export type ChatEvent =
  | { type: "thinking_delta"; text: string }
  | { type: "thinking_done"; duration: number }
  | { type: "tool"; id: string; name: string; input: string }
  | { type: "tool_result"; id: string; output: string; status: "success" }
  | { type: "text_delta"; text: string }
  | { type: "citation"; index: number; title: string; source: string; href: string }
  | { type: "done" };

/** 把一段中文/英文文本切成"逐字（CJK）/逐词（拉丁）"的增量块，模拟 token 流。 */
function chunk(text: string): string[] {
  // 简化：按字符切，连续 ASCII 词聚成一块，避免英文被拆得太碎。
  const out: string[] = [];
  let buf = "";
  for (const ch of text) {
    if (/[A-Za-z0-9]/.test(ch)) {
      buf += ch;
    } else {
      if (buf) { out.push(buf); buf = ""; }
      out.push(ch);
    }
  }
  if (buf) out.push(buf);
  return out;
}

/** 脚本 → 有序事件序列：thinking → (tool/tool_result)? → text → citation* → done。 */
export function scriptToEvents(script: ChatScript): ChatEvent[] {
  const events: ChatEvent[] = [];
  for (const c of chunk(script.thinking)) events.push({ type: "thinking_delta", text: c });
  events.push({ type: "thinking_done", duration: 3 });
  if (script.tool) {
    const id = `tool_${script.id}`;
    events.push({ type: "tool", id, name: script.tool.name, input: script.tool.input });
    events.push({ type: "tool_result", id, output: script.tool.output, status: "success" });
  }
  for (const c of chunk(script.answer)) events.push({ type: "text_delta", text: c });
  for (const cit of script.citations) events.push({ type: "citation", ...cit });
  events.push({ type: "done" });
  return events;
}
```

- [ ] **Step 4: 跑测试确认通过**

Run: `pnpm --filter @hulian/mocks exec vitest run chat-script`
Expected: PASS（全部用例绿）。

- [ ] **Step 5: Commit**

```bash
git add packages/mocks/src/chat-script.ts packages/mocks/src/chat-script.test.ts packages/mocks/package.json
git commit -m "feat(mocks): AI 对话预设脚本 + SSE 事件序列(纯函数+单测)"
```

---

## Task 3: MSW `/api/chat` handler（流式吐 SSE）

**Files:**
- Modify: `packages/mocks/src/handlers.ts`
- Modify: `packages/mocks/src/index.ts`（导出 `ChatEvent` 类型供页面复用）

- [ ] **Step 1: handler 加 `/api/chat`**

在 `packages/mocks/src/handlers.ts` 顶部 import 后、`handlers` 数组里追加：

```ts
import { selectScript, scriptToEvents } from "./chat-script";

// ...在 handlers 数组里追加：
  http.post("/api/chat", async ({ request }) => {
    const body = (await request.json()) as { message: string };
    const events = scriptToEvents(selectScript(body.message ?? ""));
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        for (const ev of events) {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(ev)}\n\n`));
          // 思考/正文吐字快，工具调用与收尾留出节奏感
          const ms =
            ev.type === "tool" ? 600 :
            ev.type === "tool_result" ? 500 :
            ev.type === "thinking_delta" ? 18 :
            ev.type === "text_delta" ? 22 : 120;
          await delay(ms);
        }
        controller.close();
      },
    });
    return new HttpResponse(stream, {
      headers: { "Content-Type": "text/event-stream", "Cache-Control": "no-cache" },
    });
  }),
```

- [ ] **Step 2: index.ts 导出共享类型**

在 `packages/mocks/src/index.ts` 追加：

```ts
export type { ChatEvent } from "./chat-script";
```

- [ ] **Step 3: 构建验证**

Run: `pnpm --filter @hulian/mocks build`（若该包无 build 则跳过，靠 www 端 dev 验证）
Expected: 类型通过。

- [ ] **Step 4: Commit**

```bash
git add packages/mocks/src/handlers.ts packages/mocks/src/index.ts
git commit -m "feat(mocks): /api/chat 流式 SSE handler"
```

---

## Task 4: 对话域类型 + reducer（纯逻辑）

**Files:**
- Create: `apps/www/app/demos/ai-chat/chat-types.ts`

- [ ] **Step 1: 写 chat-types.ts**

```ts
// apps/www/app/demos/ai-chat/chat-types.ts
// 对话状态机：消费 ChatEvent 流，累积成可渲染的消息列表。纯函数 reducer，便于推理与测试。
import type { ChatEvent } from "@hulian/mocks";

export type TurnPhase = "waiting" | "thinking" | "tool" | "streaming" | "done";

export interface ToolInvocation {
  id: string;
  name: string;
  input: string;
  output?: string;
  status: "running" | "success";
}
export interface CitationItem {
  index: number;
  title: string;
  source: string;
  href: string;
}
export interface UserMessage { id: string; role: "user"; text: string }
export interface AssistantMessage {
  id: string;
  role: "assistant";
  phase: TurnPhase;
  thinking: string;
  thinkingDone: boolean;
  duration?: number;
  tools: ToolInvocation[];
  text: string;
  citations: CitationItem[];
}
export type ChatMsg = UserMessage | AssistantMessage;

export type ChatAction =
  | { kind: "user_send"; id: string; text: string }
  | { kind: "assistant_start"; id: string }
  | { kind: "event"; id: string; event: ChatEvent }
  | { kind: "aborted"; id: string };

export function emptyAssistant(id: string): AssistantMessage {
  return { id, role: "assistant", phase: "waiting", thinking: "", thinkingDone: false,
    tools: [], text: "", citations: [] };
}

export function chatReducer(state: ChatMsg[], action: ChatAction): ChatMsg[] {
  switch (action.kind) {
    case "user_send":
      return [...state, { id: action.id, role: "user", text: action.text }];
    case "assistant_start":
      return [...state, emptyAssistant(action.id)];
    case "aborted":
      return state.map((m) =>
        m.id === action.id && m.role === "assistant" ? { ...m, phase: "done" } : m);
    case "event":
      return state.map((m) => {
        if (m.id !== action.id || m.role !== "assistant") return m;
        return applyEvent(m, action.event);
      });
    default:
      return state;
  }
}

function applyEvent(m: AssistantMessage, e: ChatEvent): AssistantMessage {
  switch (e.type) {
    case "thinking_delta":
      return { ...m, phase: "thinking", thinking: m.thinking + e.text };
    case "thinking_done":
      return { ...m, thinkingDone: true, duration: e.duration };
    case "tool":
      return { ...m, phase: "tool",
        tools: [...m.tools, { id: e.id, name: e.name, input: e.input, status: "running" }] };
    case "tool_result":
      return { ...m, tools: m.tools.map((t) =>
        t.id === e.id ? { ...t, output: e.output, status: "success" } : t) };
    case "text_delta":
      return { ...m, phase: "streaming", text: m.text + e.text };
    case "citation":
      return { ...m, citations: [...m.citations,
        { index: e.index, title: e.title, source: e.source, href: e.href }] };
    case "done":
      return { ...m, phase: "done" };
    default:
      return m;
  }
}
```

- [ ] **Step 2: 类型检查**

Run: `pnpm --filter www exec tsc --noEmit`（或随后 dev 编译）
Expected: 无类型错误（依赖 `@hulian/mocks` 已导出 `ChatEvent`）。

- [ ] **Step 3: Commit**

```bash
git add apps/www/app/demos/ai-chat/chat-types.ts
git commit -m "feat(www): AI 对话状态机 reducer + 域类型"
```

---

## Task 5: 流消费 hook + 假会话数据

**Files:**
- Create: `apps/www/app/demos/ai-chat/use-chat-stream.ts`
- Create: `apps/www/app/demos/ai-chat/conversations.ts`

- [ ] **Step 1: 写 conversations.ts（rail 静态假数据）**

```ts
// apps/www/app/demos/ai-chat/conversations.ts
export interface ConversationStub {
  id: string;
  title: string;
  preview: string;
  active?: boolean;
}
export const CONVERSATIONS: ConversationStub[] = [
  { id: "c1", title: "今天的天气", preview: "北京今天多云转晴…", active: true },
  { id: "c2", title: "快速排序实现", preview: "function quickSort…" },
  { id: "c3", title: "闭包是什么", preview: "函数与其词法作用域的组合…" },
  { id: "c4", title: "周报草稿", preview: "本周完成了 demo 区…" },
];
```

- [ ] **Step 2: 写 use-chat-stream.ts**

```ts
// apps/www/app/demos/ai-chat/use-chat-stream.ts
"use client";
import { useCallback, useReducer, useRef, useState } from "react";
import type { ChatEvent } from "@hulian/mocks";
import { chatReducer, type ChatMsg } from "./chat-types";

let seq = 0;
const nextId = () => `m${++seq}`;

export function useChatStream() {
  const [messages, dispatch] = useReducer(chatReducer, [] as ChatMsg[]);
  const [loading, setLoading] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const stop = useCallback(() => {
    abortRef.current?.abort();
  }, []);

  const send = useCallback(async (text: string) => {
    if (loading) return;
    const assistantId = nextId();
    dispatch({ kind: "user_send", id: nextId(), text });
    dispatch({ kind: "assistant_start", id: assistantId });
    setLoading(true);
    const ac = new AbortController();
    abortRef.current = ac;
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
        signal: ac.signal,
      });
      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      let buf = "";
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += decoder.decode(value, { stream: true });
        // 按 SSE 帧（\n\n）切分，逐帧 dispatch
        let idx;
        while ((idx = buf.indexOf("\n\n")) !== -1) {
          const frame = buf.slice(0, idx).trim();
          buf = buf.slice(idx + 2);
          if (frame.startsWith("data:")) {
            const event = JSON.parse(frame.slice(5).trim()) as ChatEvent;
            dispatch({ kind: "event", id: assistantId, event });
          }
        }
      }
    } catch (err) {
      if ((err as Error).name === "AbortError") {
        dispatch({ kind: "aborted", id: assistantId });
      } else {
        throw err;
      }
    } finally {
      setLoading(false);
      abortRef.current = null;
    }
  }, [loading]);

  return { messages, loading, send, stop };
}
```

- [ ] **Step 3: 类型检查（随 dev 编译）**

Run: `pnpm --filter www dev` 启动后无编译错误。
Expected: 通过。

- [ ] **Step 4: Commit**

```bash
git add apps/www/app/demos/ai-chat/use-chat-stream.ts apps/www/app/demos/ai-chat/conversations.ts
git commit -m "feat(www): 流式消费 hook + rail 假会话数据"
```

---

## Task 6: `/demos` 区级外壳 + 画廊索引页

**Files:**
- Create: `apps/www/app/demos/layout.tsx`
- Create: `apps/www/app/demos/page.tsx`

- [ ] **Step 1: 写 layout.tsx（复用 /components 壳气质）**

```tsx
// apps/www/app/demos/layout.tsx
import type { ReactNode } from "react";
import Link from "next/link";
import { AnimatedThemeToggler, Stack, Text } from "@hulian/ui";
import { ArrowLeft } from "lucide-react";

export default function DemosLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-dvh">
      <Stack
        as="header"
        direction="row"
        align="center"
        justify="between"
        className="border-b border-border px-6 py-3"
      >
        <Link href="/" className="flex items-center gap-2 text-sm text-muted hover:text-foreground">
          <ArrowLeft className="size-4" aria-hidden />
          <Text as="span" weight="medium">瑚琏 Demo</Text>
        </Link>
        <AnimatedThemeToggler />
      </Stack>
      {children}
    </div>
  );
}
```

- [ ] **Step 2: 写画廊 page.tsx（dogfood BentoGrid/BentoCard）**

```tsx
// apps/www/app/demos/page.tsx
import Link from "next/link";
import { Bot, LayoutDashboard, Table2, Sparkles, type LucideIcon } from "lucide-react";
import { BentoCard, BentoGrid, Badge, Heading, Stack, Text } from "@hulian/ui";
import { DEMOS, DEMO_COMING_SOON, type DemoMeta } from "../../lib/demos";

const ICONS: Record<DemoMeta["icon"], LucideIcon> = {
  bot: Bot,
  "layout-dashboard": LayoutDashboard,
  "table-2": Table2,
};

export default function DemosGallery() {
  return (
    <main className="mx-auto max-w-4xl px-6 py-12">
      <Heading level={1} size="3xl" className="tracking-tight">内置 Demo 项目</Heading>
      <Text tone="muted" className="mt-3 max-w-xl leading-relaxed">
        不只是组件孤岛——用瑚琏拼出能跑的真实产品。每个 demo 100% 由 @hulian/ui 搭建。
      </Text>

      <BentoGrid className="mt-10 auto-rows-[12rem] sm:grid-cols-2">
        {DEMOS.map((d) => {
          const Icon = ICONS[d.icon];
          return (
            <Link key={d.slug} href={d.href} className="contents">
              <BentoCard
                icon={<Icon aria-hidden />}
                title={d.title}
                description={d.desc}
                className="transition-colors hover:border-primary"
              />
            </Link>
          );
        })}
        {Array.from({ length: DEMO_COMING_SOON }).map((_, i) => (
          <BentoCard
            key={`soon-${i}`}
            icon={<Sparkles aria-hidden />}
            title={<Stack direction="row" align="center" gap={2}>
              更多 demo <Badge variant="soft" size="sm">敬请期待</Badge>
            </Stack>}
            description="仪表盘 · 数据表格 · 更多真实场景陆续登场。"
            className="opacity-60"
          />
        ))}
      </BentoGrid>
    </main>
  );
}
```

> 若 `BentoCard` 的 `title` 不接 `ReactNode`（只接 string），占位卡退化为纯文字标题 + 不传 Badge；**或**按硬门禁去 `packages/ui` 给 `BentoCardProps.title` 放宽到 `ReactNode`（实现时读 `bento-grid.types.ts` 定夺，优先放宽组件）。

- [ ] **Step 3: 验证**

Run: dev 下访问 `/demos`
Expected: 画廊显示 AI 对话卡 + 2 张占位卡；点 AI 对话卡进 `/demos/ai-chat`（下个任务做完后可通）。

- [ ] **Step 4: Commit**

```bash
git add apps/www/app/demos/layout.tsx apps/www/app/demos/page.tsx
git commit -m "feat(www): /demos 画廊索引 + 区级外壳"
```

---

## Task 7: AI 对话页 — 壳 + 会话 rail（Layout + List + Select）

先把"产品壳"立起来（顶栏 + 左 rail + 右空对话区），下个任务再填对话渲染。

**Files:**
- Create: `apps/www/app/demos/ai-chat/page.tsx`

- [ ] **Step 1: 写 page.tsx 壳（桌面 Layout + 移动 Drawer rail）**

```tsx
// apps/www/app/demos/ai-chat/page.tsx
"use client";
import { useState } from "react";
import {
  Layout, List, ListItem, Avatar, Button, Badge, Stack, Text, Heading,
  Select, SelectTrigger, SelectContent, SelectItem,
  Drawer, DrawerTrigger, DrawerContent,
} from "@hulian/ui";
import { Plus, Menu } from "lucide-react";
import { CONVERSATIONS } from "./conversations";

const MODELS = [
  { value: "gpt-4o", label: "GPT-4o" },
  { value: "claude", label: "Claude Opus" },
  { value: "hulian", label: "瑚琏 1.0" },
];

function Rail() {
  return (
    <Stack gap={2} className="p-3">
      <Button variant="outline" className="w-full justify-start gap-2">
        <Plus className="size-4" aria-hidden /> 新建对话
      </Button>
      <List
        items={CONVERSATIONS}
        renderItem={(c) => (
          <ListItem
            className={c.active ? "rounded-[var(--radius)] bg-surface-hover" : ""}
          >
            <ListItem.Meta
              avatar={<Avatar size="sm" fallback={c.title.slice(0, 1)} />}
              title={c.title}
              description={c.preview}
            />
          </ListItem>
        )}
      />
    </Stack>
  );
}

export default function AiChatDemo() {
  const [model, setModel] = useState("gpt-4o");

  const header = (
    <Stack direction="row" align="center" justify="between" className="w-full">
      <Stack direction="row" align="center" gap={2}>
        {/* 移动端 rail 抽屉触发 */}
        <span className="md:hidden">
          <Drawer>
            <DrawerTrigger render={<Button variant="ghost" size="sm" aria-label="会话列表" className="size-8 px-0"><Menu className="size-4" /></Button>} />
            <DrawerContent side="left" className="w-72"><Rail /></DrawerContent>
          </Drawer>
        </span>
        <Heading as="span" size="base" weight="semibold">AI 对话工具</Heading>
        <Badge variant="soft" size="sm">demo</Badge>
      </Stack>
      <Select items={MODELS} value={model} onValueChange={setModel}>
        <SelectTrigger size="sm" className="w-36" />
        <SelectContent>
          {MODELS.map((m) => <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>)}
        </SelectContent>
      </Select>
    </Stack>
  );

  return (
    <div className="mx-auto h-[calc(100dvh-57px)] max-w-[1280px] overflow-hidden">
      <Layout className="h-full">
        <Layout.Header className="px-4">{header}</Layout.Header>
        <Layout hasSider className="min-h-0 flex-auto">
          <Layout.Sider width={280} className="hidden md:block">
            <Rail />
          </Layout.Sider>
          <Layout.Content className="flex min-h-0 flex-col p-0">
            {/* 对话区占位，下个任务填充 */}
            <div className="flex-1" />
          </Layout.Content>
        </Layout>
      </Layout>
    </div>
  );
}
```

> 实现时校验：`Select` 的受控 `value/onValueChange`、`SelectTrigger` 是否接 `className`/`size`、`Drawer`/`DrawerContent` 的 `side`/`render` prop、`List`/`ListItem.Meta` 的 `avatar/title/description`、`Avatar` 的 `size="sm"`。任一不符合硬门禁 → 先去 `packages/ui` 补/放宽，再回填。`h-[calc(100dvh-57px)]` 的 57px 对应 layout header 实测高度，实现时按真实高度微调或改用 flex 撑满。

- [ ] **Step 2: 验证壳**

Run: dev 访问 `/demos/ai-chat`
Expected: 桌面见顶栏（标题+模型选择）+ 左 rail（新建 + 4 条会话）+ 右空区；窄屏 rail 收进抽屉，点 Menu 弹出。

- [ ] **Step 3: Commit**

```bash
git add apps/www/app/demos/ai-chat/page.tsx
git commit -m "feat(www): AI 对话页产品壳 + 会话 rail(Layout/List/Select/Drawer)"
```

---

## Task 8: AI 对话页 — 对话渲染 + 输入（接状态机）

填充对话区：空状态、消息流、流式渲染、输入框。

**Files:**
- Modify: `apps/www/app/demos/ai-chat/page.tsx`（替换 Step 7 的对话区占位 + 接 `useChatStream`）

- [ ] **Step 1: 抽出 ConversationView 组件并接 hook**

在 `page.tsx` 顶部 import 追加：

```tsx
import {
  Conversation, ChatMessage, ThinkingBlock, ToolCall, StreamingText,
  Citation, MessageActions, PromptInput, PromptSuggestions, Empty, Prose, CodeBlock,
} from "@hulian/ui";
import { Bot, Sparkles } from "lucide-react";
import { useChatStream } from "./use-chat-stream";
import type { AssistantMessage } from "./chat-types";
```

新增组件（同文件）：

```tsx
const SUGGESTIONS = [
  "北京今天天气怎么样",
  "帮我写一个快速排序",
  "解释一下什么是闭包",
  "你能做什么？",
];

// 渲染含 markdown 代码块的正文：done 后用 Prose，流式中用 StreamingText 逐字。
function AssistantBody({ m }: { m: AssistantMessage }) {
  return (
    <Stack gap={3}>
      {m.thinking && (
        <ThinkingBlock thinking={!m.thinkingDone} duration={m.thinkingDone ? `思考 ${m.duration}s` : undefined}>
          {m.thinking}
        </ThinkingBlock>
      )}
      {m.tools.map((t) => (
        <ToolCall
          key={t.id}
          name={t.name}
          status={t.status}
          input={<CodeBlock language="json">{t.input}</CodeBlock>}
          output={t.output ? <CodeBlock language="json">{t.output}</CodeBlock> : undefined}
        />
      ))}
      {m.phase === "waiting" && m.tools.length === 0 && !m.thinking && <TypingDots />}
      {m.text && (m.phase === "done"
        ? <Prose size="sm"><StreamingTextMarkdown text={m.text} /></Prose>
        : <StreamingText text={m.text} streaming />)}
      {m.citations.length > 0 && (
        <Stack direction="row" wrap gap={2}>
          {m.citations.map((c) => (
            <Citation key={c.index} index={c.index} title={c.title} source={c.source} href={c.href} />
          ))}
        </Stack>
      )}
      {m.phase === "done" && (
        <MessageActions content={m.text} onLike={() => {}} onDislike={() => {}} onRegenerate={() => {}} />
      )}
    </Stack>
  );
}
```

> **markdown 渲染决策（实现时定夺，硬门禁）**：`done` 后正文含 ```` ``` ```` 代码块，需要 markdown→HTML。检查 `@hulian/ui` 是否已有 markdown 渲染件（`markdown-editor` 含解析？`Prose` 仅排版皮肤不解析）。
> - 若库已有可复用的 markdown 渲染：直接用，删掉 `StreamingTextMarkdown` 占位。
> - 若没有：这是**真实库缺口** → 去 `packages/ui` 新增一个轻量 `Markdown` 渲染组件（或给 `Prose` 加 `markdown` 能力，复用仓库已有的 markdown 依赖，如 `markdown-editor` 的解析栈），补 showcase + 导出，再回页面用。**禁止在页面里塞第三方 markdown 库手搓。**
> - 临时占位 `StreamingTextMarkdown` 仅为让计划自洽：实现时必被替换为真实库组件，不得留存。

- [ ] **Step 2: 替换对话区占位**

把 Step 7 中 `<Layout.Content>` 内的占位 `<div className="flex-1" />` 替换为：

```tsx
          <Layout.Content className="flex min-h-0 flex-col p-0">
            {messages.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center gap-6 px-6">
                <Empty
                  icon={<Bot className="size-10" aria-hidden />}
                  title="开始一段对话"
                  description="问我天气、让我写代码、或解释一个概念"
                />
                <PromptSuggestions
                  suggestions={SUGGESTIONS}
                  onSelect={(v) => send(v)}
                  className="max-w-xl"
                />
              </div>
            ) : (
              <Conversation className="flex-1 px-4 py-6 sm:px-6">
                {messages.map((m) =>
                  m.role === "user" ? (
                    <ChatMessage key={m.id} role="user" avatar={<Avatar size="sm" fallback="我" />}>
                      {m.text}
                    </ChatMessage>
                  ) : (
                    <ChatMessage key={m.id} role="assistant" name="瑚琏助手"
                      avatar={<Avatar size="sm" fallback={<Bot className="size-4" />} />}>
                      <AssistantBody m={m} />
                    </ChatMessage>
                  ),
                )}
              </Conversation>
            )}
            <div className="border-t border-border p-3 sm:p-4">
              <PromptInput
                onSubmit={(t) => send(t)}
                loading={loading}
                onStop={stop}
                placeholder="给瑚琏助手发消息…"
                className="mx-auto max-w-3xl"
              />
            </div>
          </Layout.Content>
```

并在 `AiChatDemo` 组件体顶部接入 hook：

```tsx
  const { messages, loading, send, stop } = useChatStream();
```

（`TypingDots` 也需 import；`StreamingText` import 已在 Step 1。）

- [ ] **Step 3: 端到端验证（Playwright/手动）**

Run: dev 访问 `/demos/ai-chat`，点「帮我写一个快速排序」建议
Expected 依次可见：TypingDots → ThinkingBlock（转圈→收起带耗时）→（天气问句才有 ToolCall running→success）→ StreamingText 逐字 → 代码块 markdown 渲染 → MessageActions。点「停止生成」可中断。三套脚本 + 兜底都能触发。

- [ ] **Step 4: 自动化烟测（可选但推荐）**

用 Playwright MCP 跑一遍：导航 `/demos/ai-chat` → 点建议 → `browser_wait_for` 文本出现 → 截图存档。

- [ ] **Step 5: Commit**

```bash
git add apps/www/app/demos/ai-chat/page.tsx
git commit -m "feat(www): AI 对话渲染——空状态/流式/思考/工具/引用/操作 全 hulian 组件"
```

---

## Task 9: 收尾验证 + 库改动回归

- [ ] **Step 1: 硬门禁审计**

通读 `apps/www/app/demos/**`，确认：无手搓的"本应是组件"的 UI；所有交互元素来自 `@hulian/ui`；任何实现中做的库改动（如 `Markdown` 组件、`BentoCard.title` 放宽）都有对应 `packages/ui` commit + showcase + 导出。

- [ ] **Step 2: 全量构建**

Run: `pnpm --filter @hulian/ui build && pnpm --filter @hulian/mocks exec vitest run && pnpm --filter www build`
Expected: UI 库构建通过、mocks 单测绿、www 构建通过。

- [ ] **Step 3: 主题/响应式抽检**

明暗主题各跑一遍 `/demos` 与 `/demos/ai-chat`；窄屏验证 rail 抽屉、PromptInput、消息气泡不溢出。

- [ ] **Step 4: 最终 commit（如有零散改动）**

```bash
git add -A
git commit -m "chore(www): demos AI 对话收尾——门禁审计 + 构建通过"
```

---

## Self-Review 结论

- **Spec 覆盖**：§2 路由→Task1/6/7；§3 首页红框→Task1；§4.1 壳/rail→Task7；§4.2 组件映射→Task8；§4.3 流式数据流→Task2/3/4/5；§5 库改动门禁→贯穿 + Task9 审计；§6 范围红线→各任务范围注释；§7 验收→Task8/9。无遗漏。
- **占位扫描**：唯一刻意保留的占位是 Task8 的 `StreamingTextMarkdown`，已显式标注"实现时必被真实库 markdown 组件替换，不得留存"——这是把"markdown 是否构成库缺口"的判断显式交给执行者，符合硬门禁，非计划失败。
- **类型一致**：`ChatEvent`（mocks 定义 → www 复用）、`ChatMsg`/`AssistantMessage`（chat-types 定义 → hook/page 消费）、`chatReducer`/`useChatStream` 签名跨任务一致。
- **TDD 适配**：纯逻辑（chat-script 选择/编码）走 TDD（Task2）；UI 页面走构建 + 浏览器/Playwright 验证（Task7/8/9）——诚实反映 UI demo 难以单测的现实。
