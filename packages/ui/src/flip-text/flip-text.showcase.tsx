import type { ShowcaseSpec } from "../showcase/types";
import { FlipText } from "./flip-text";

export const flipTextShowcase: ShowcaseSpec = {
  examples: [
    {
      title: "页面主标题",
      description:
        "最常见的用法：标题自己就是那个 h1（不套壳），鼠标移入时逐字翻面。文案直接写在 children 里，变量表达式照传。",
      code: `<FlipText as="h1" className="text-2xl font-semibold tracking-tight">
  AI 状态
</FlipText>`,
      render: () => (
        <FlipText as="h1" className="text-2xl font-semibold tracking-tight">
          AI 状态
        </FlipText>
      ),
    },
    {
      title: "四档翻转方向",
      description:
        "direction 说的是新字面**进入**的方向：top 从上方压下来，left 从左侧转过来，以此类推。",
      code: `<FlipText direction="top">从上翻</FlipText>
<FlipText direction="bottom">从下翻</FlipText>
<FlipText direction="left">从左翻</FlipText>
<FlipText direction="right">从右翻</FlipText>`,
      render: () => (
        <div className="flex flex-wrap gap-6 text-xl font-medium">
          <FlipText direction="top">从上翻</FlipText>
          <FlipText direction="bottom">从下翻</FlipText>
          <FlipText direction="left">从左翻</FlipText>
          <FlipText direction="right">从右翻</FlipText>
        </div>
      ),
    },
    {
      title: "节奏：时长与错峰",
      description:
        "duration 是单字翻面秒数，stagger 是相邻字的错峰毫秒。错峰越大，波浪推得越慢越明显。",
      code: `<FlipText duration={0.8} stagger={90} className="text-xl">
  慢一点的波浪
</FlipText>`,
      render: () => (
        <FlipText duration={0.8} stagger={90} className="text-xl font-medium">
          慢一点的波浪
        </FlipText>
      ),
    },
    {
      title: "西文标题按词切",
      description:
        "splitType=\"word\" 按空白切，避免长单词被逐字拆开后在窄容器里断行。中文用默认的 char 即可。",
      code: `<FlipText splitType="word" as="h2" className="text-xl font-semibold">
  Deploy in seconds
</FlipText>`,
      render: () => (
        <FlipText splitType="word" as="h2" className="text-xl font-semibold">
          Deploy in seconds
        </FlipText>
      ),
    },
  ],
  controls: [
    { prop: "direction", type: "select", options: ["top", "bottom", "left", "right"], defaultValue: "top" },
    { prop: "splitType", type: "select", options: ["char", "word"], defaultValue: "char" },
    { prop: "duration", type: "number", defaultValue: 0.5 },
    { prop: "stagger", type: "number", defaultValue: 30 },
  ],
  states: [
    {
      name: "default（移入标题看翻转）",
      render: () => (
        <FlipText as="h1" className="text-2xl font-semibold tracking-tight">
          AI 状态
        </FlipText>
      ),
    },
    {
      name: "direction=left",
      render: () => (
        <FlipText direction="left" className="text-2xl font-semibold">
          从左翻
        </FlipText>
      ),
    },
    {
      name: "splitType=word",
      render: () => (
        <FlipText splitType="word" className="text-2xl font-semibold">
          Deploy in seconds
        </FlipText>
      ),
    },
  ],
  renderWithProps: (p) => (
    <FlipText
      as="h1"
      className="text-2xl font-semibold tracking-tight"
      direction={p.direction as "top" | "bottom" | "left" | "right"}
      splitType={p.splitType as "char" | "word"}
      duration={p.duration as number}
      stagger={p.stagger as number}
    >
      AI 状态
    </FlipText>
  ),
  toCode: (p) =>
    `<FlipText as="h1" direction="${p.direction}" splitType="${p.splitType}" duration={${p.duration}} stagger={${p.stagger}}>AI 状态</FlipText>`,
};
