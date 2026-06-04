// AI 对话 demo 的预设脚本 + SSE 事件序列（纯函数，可单测，无副作用/无定时器）。
// MSW handler 消费 scriptToEvents 的结果，逐个 enqueue 并夹 delay。

export interface ScriptTool {
  name: string;
  input: string; // JSON 文本
  output: string; // JSON / 文本
}
export interface ScriptCitation {
  index: number;
  title: string;
  source: string;
  href: string;
}
export interface ChatScript {
  id: "weather" | "code" | "explain" | "fallback";
  thinking: string; // 推理过程全文
  tool?: ScriptTool; // 可选工具调用
  answer: string; // assistant 正文（可含 markdown）
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
      "用户想理解闭包概念。先给一句话定义，再用『函数记住它出生时的作用域』打比方，最后附权威来源。",
    answer:
      "**闭包**是指函数与其定义时所在的词法作用域的组合——即便在该作用域之外执行，函数依然能访问当时的变量。\n\n打个比方：函数像带着一个『背包』出门，背包里装着它出生时能看到的变量，走到哪都能取用。常见于回调、模块私有状态、柯里化等场景。",
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
    thinking:
      "这是一个开放式问题，没有特定意图。给一个友好、引导性的回复，提示用户可以问什么。",
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
      if (buf) {
        out.push(buf);
        buf = "";
      }
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
