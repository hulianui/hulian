import { t, type Dictionary } from "intlayer";
import { DOCS_LOCALE } from "../../../lib/docs-locale";

export const content = {
  "zh-CN": {
    weatherThinking: "用户在问某地天气。我没有实时数据，应调用天气工具查询，再用自然语言总结结果。",
    weatherInput: `{ "city": "北京", "unit": "celsius" }`,
    weatherOutput: `{ "temp": 21, "condition": "多云转晴", "humidity": "45%", "wind": "微风 2 级" }`,
    weatherAnswer:
      "北京今天**多云转晴**，气温约 **21°C**，湿度 45%，微风 2 级，体感舒适，适合外出。出门带件薄外套即可。",
    codeThinking:
      "用户想要快速排序实现。给出简洁的 JS 版本，并补一句复杂度说明，方便直接复制使用。",
    codeAnswer:
      "下面是一个简洁的快速排序实现：\n\n```js\nfunction quickSort(arr) {\n  if (arr.length <= 1) return arr;\n  const [pivot, ...rest] = arr;\n  const left = rest.filter((x) => x < pivot);\n  const right = rest.filter((x) => x >= pivot);\n  return [...quickSort(left), pivot, ...quickSort(right)];\n}\n```\n\n平均时间复杂度 **O(n log n)**，最坏 O(n²)（已近乎有序时）。生产环境建议随机选 pivot 以规避最坏情况。",
    closureThinking:
      "用户想理解闭包概念。先给一句话定义，再用『函数记住它出生时的作用域』打比方，最后附权威来源。",
    closureAnswer:
      "**闭包**是指函数与其定义时所在的词法作用域的组合——即便在该作用域之外执行，函数依然能访问当时的变量。\n\n打个比方：函数像带着一个『背包』出门，背包里装着它出生时能看到的变量，走到哪都能取用。常见于回调、模块私有状态、柯里化等场景。",
    fallbackThinking:
      "这是一个开放式问题，没有特定意图。给一个友好、引导性的回复，提示用户可以问什么。",
    fallbackAnswer:
      "我可以帮你查天气、写代码、解释技术概念等等。试试问我「北京今天天气怎么样」「帮我写一个快速排序」或「解释一下什么是闭包」？",
  },
  en: {
    weatherThinking:
      "The user is asking about local weather. I do not have live conditions, so I should query the weather tool and summarize the result clearly.",
    weatherInput: `{ "city": "Beijing", "unit": "celsius" }`,
    weatherOutput: `{ "temp": 21, "condition": "partly cloudy, clearing later", "humidity": "45%", "wind": "light breeze, force 2" }`,
    weatherAnswer:
      "Beijing will be **partly cloudy, clearing later**, with a high near **21°C**, 45% humidity, and a light breeze. Conditions should be comfortable for going out; take a light jacket.",
    codeThinking:
      "The user wants a quicksort implementation. I should provide a concise JavaScript version and a short complexity note that is easy to reuse.",
    codeAnswer:
      "Here is a concise quicksort implementation:\n\n```js\nfunction quickSort(arr) {\n  if (arr.length <= 1) return arr;\n  const [pivot, ...rest] = arr;\n  const left = rest.filter((x) => x < pivot);\n  const right = rest.filter((x) => x >= pivot);\n  return [...quickSort(left), pivot, ...quickSort(right)];\n}\n```\n\nAverage time complexity is **O(n log n)**; the worst case is O(n²), such as with nearly sorted input. In production, choose pivots randomly to reduce that risk.",
    closureThinking:
      "The user wants to understand closures. I should start with a one-sentence definition, add an intuitive scope analogy, and include an authoritative source.",
    closureAnswer:
      "A **closure** combines a function with the lexical scope where it was defined. The function can still access those variables even when it runs outside that scope.\n\nThink of the function carrying a backpack filled with the variables that were visible when it was created. Closures are common in callbacks, private module state, and currying.",
    fallbackThinking:
      "This is an open-ended request without a specific intent. I should respond warmly and suggest a few useful things to ask.",
    fallbackAnswer:
      'I can check the weather, write code, or explain technical concepts. Try asking, "How\'s the weather in Beijing today?", "Write a quicksort function," or "What is a closure?"',
  },
} as const;

export type ContentKey = keyof (typeof content)["zh-CN"];

export function copy(key: ContentKey): string {
  return content[DOCS_LOCALE][key];
}

const dictionary: Dictionary = {
  key: "demo-ai-chat-use-chat-stream",
  content: t(content),
};

export default dictionary;
