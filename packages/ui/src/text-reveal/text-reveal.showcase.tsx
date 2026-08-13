import type { ShowcaseSpec } from "../showcase/types";
import { TextReveal } from "./text-reveal";

export const textRevealShowcase: ShowcaseSpec = {
  examples: [
    {
      title: "「进行中」的状态文字",
      description:
        "本件的正业：后台长任务的阶段名。repeat 让它一直扫——动画停下来本身就是错误信号，用户是靠它还在动来判断任务没死；startOnView={false} 是因为它常常一开始就在视口里。",
      code: `<TextReveal text="OCR 中" repeat startOnView={false} className="text-sm" />`,
      render: () => (
        <TextReveal text="OCR 中" repeat startOnView={false} className="text-sm font-medium" />
      ),
    },
    {
      title: "多串轮换（宽度按最宽那串预留）",
      description:
        "传数组即每扫完一轮换下一串。容器宽度取最宽的那串，换串时不会把紧挨着的元素挤得跳一下。",
      code: `<TextReveal text={["OCR 中", "解析中", "归档中"]} repeat startOnView={false} />`,
      render: () => (
        <span className="inline-flex items-center gap-2 text-sm">
          <TextReveal
            text={["OCR 中", "解析中", "归档中"]}
            repeat
            startOnView={false}
            className="font-medium"
          />
          <span className="text-muted-foreground">· 右边这段不会跟着跳</span>
        </span>
      ),
    },
    {
      title: "进场用法：滚入视口揭示一次",
      description:
        "默认 startOnView + 不 repeat：滚入视口扫一轮，停在全部揭示的终态。适合标题、大段引言。",
      code: `<TextReveal text="让开发更快更稳更美" className="text-2xl font-bold" />`,
      render: () => <TextReveal text="让开发更快更稳更美" className="text-2xl font-bold" />,
    },
    {
      title: "换色带与节奏",
      description:
        "colors 决定扫光带的颜色（默认 chart-1..5 五色，吃主题），duration 决定扫完一轮的秒数。单色也行。",
      code: `<TextReveal
  text="正在同步"
  colors={["var(--color-primary)"]}
  duration={1.2}
  repeat
  startOnView={false}
/>`,
      render: () => (
        <TextReveal
          text="正在同步"
          colors={["var(--color-primary)"]}
          duration={1.2}
          repeat
          startOnView={false}
          className="text-base font-medium"
        />
      ),
    },
  ],
  controls: [
    { prop: "duration", type: "number", defaultValue: 2 },
    { prop: "repeat", type: "boolean", defaultValue: true },
    { prop: "startOnView", type: "boolean", defaultValue: false },
  ],
  states: [
    {
      name: "default（循环扫的任务态标签）",
      render: () => (
        <TextReveal text="OCR 中" repeat startOnView={false} className="text-sm font-medium" />
      ),
    },
    {
      name: "多串轮换",
      render: () => (
        <TextReveal text={["OCR 中", "解析中", "归档中"]} repeat startOnView={false} className="text-sm font-medium" />
      ),
    },
    {
      name: "单色带",
      render: () => (
        <TextReveal
          text="正在同步"
          colors={["var(--color-primary)"]}
          repeat
          startOnView={false}
          className="text-sm font-medium"
        />
      ),
    },
  ],
  renderWithProps: (p) => (
    <TextReveal
      text="OCR 中"
      className="text-base font-medium"
      duration={p.duration as number}
      repeat={p.repeat as boolean}
      startOnView={p.startOnView as boolean}
    />
  ),
  toCode: (p) =>
    `<TextReveal text="OCR 中" duration={${p.duration}} repeat={${p.repeat}} startOnView={${p.startOnView}} />`,
};
