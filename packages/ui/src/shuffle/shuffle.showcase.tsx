"use client";
import type { ShowcaseSpec } from "../showcase/types";
import { Shuffle } from "./shuffle";

/** 深色舞台，让解密/洗牌的等宽字效果更具「终端」质感 */
function Stage({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="flex h-40 w-full max-w-xl items-center justify-center overflow-hidden rounded-xl border border-border"
      style={{ background: "oklch(0.14 0.02 255)" }}
    >
      {children}
    </div>
  );
}

export const shuffleShowcase: ShowcaseSpec = {
  examples: [
    {
      title: "基础用法",
      description: "逐字洗牌解密，每个字位先滚动随机乱码再按方向顺序锁定为真字；悬停可重洗。",
      code: `<Shuffle
  text="HULIAN"
  triggerOnHover
  className="text-3xl font-semibold tracking-wide"
/>`,
      render: () => (
        <Stage>
          <Shuffle
            text="HULIAN"
            triggerOnView={false}
            triggerOnHover
            className="text-3xl font-semibold tracking-wide text-white"
          />
        </Stage>
      ),
    },
    {
      title: "向左解析",
      description: "shuffleDirection=left 时字符从右往左依次锁定，duration 控制整段时长。",
      code: `<Shuffle
  text="DECRYPTING…"
  shuffleDirection="left"
  duration={0.9}
  triggerOnHover
  className="text-2xl font-medium tracking-widest"
/>`,
      render: () => (
        <Stage>
          <Shuffle
            text="DECRYPTING…"
            shuffleDirection="left"
            duration={0.9}
            triggerOnView={false}
            triggerOnHover
            className="text-2xl font-medium tracking-widest text-white"
          />
        </Stage>
      ),
    },
    {
      title: "循环 + 自定义字符集",
      description: "loop 循环重洗，scrambleCharset 限定乱码取样字符（此处仅十六进制字符）。",
      code: `<Shuffle
  text="0xC0FFEE"
  loop
  loopDelay={1.2}
  scrambleCharset="0123456789ABCDEF"
  duration={0.7}
  className="text-3xl font-bold"
/>`,
      render: () => (
        <Stage>
          <Shuffle
            text="0xC0FFEE"
            loop
            loopDelay={1.2}
            scrambleCharset="0123456789ABCDEF"
            duration={0.7}
            triggerOnView={false}
            className="text-3xl font-bold text-white"
          />
        </Stage>
      ),
    },
  ],

  controls: [
    { prop: "text", type: "text", defaultValue: "HULIAN", label: "文本" },
    { prop: "duration", type: "number", defaultValue: 0.6, label: "时长（秒）" },
    {
      prop: "shuffleDirection",
      type: "select",
      options: ["right", "left"],
      defaultValue: "right",
      label: "方向",
    },
    { prop: "loop", type: "boolean", defaultValue: false, label: "循环" },
    {
      prop: "triggerOnHover",
      type: "boolean",
      defaultValue: true,
      label: "悬停重洗",
    },
  ],

  states: [
    {
      name: "default（向右解析）",
      render: () => (
        <Stage>
          <Shuffle
            text="HULIAN"
            triggerOnView={false}
            triggerOnHover
            className="text-3xl font-semibold tracking-wide text-white"
          />
        </Stage>
      ),
    },
    {
      name: "向左解析 · 长文本",
      render: () => (
        <Stage>
          <Shuffle
            text="DECRYPTING…"
            shuffleDirection="left"
            duration={0.9}
            triggerOnView={false}
            triggerOnHover
            className="text-2xl font-medium tracking-widest text-white"
          />
        </Stage>
      ),
    },
    {
      name: "循环 · 自定义字符集",
      render: () => (
        <Stage>
          <Shuffle
            text="0xC0FFEE"
            loop
            loopDelay={1.2}
            scrambleCharset="0123456789ABCDEF"
            duration={0.7}
            triggerOnView={false}
            className="text-3xl font-bold text-white"
          />
        </Stage>
      ),
    },
  ],

  renderWithProps: (p) => (
    <Stage>
      <Shuffle
        text={(p.text as string) || "HULIAN"}
        duration={p.duration as number}
        shuffleDirection={p.shuffleDirection as "left" | "right"}
        loop={p.loop as boolean}
        triggerOnHover={p.triggerOnHover as boolean}
        triggerOnView={false}
        className="text-3xl font-semibold tracking-wide text-white"
      />
    </Stage>
  ),

  toCode: (p) =>
    [
      `<Shuffle`,
      `  text="${p.text}"`,
      `  duration={${p.duration}}`,
      `  shuffleDirection="${p.shuffleDirection}"`,
      `  loop={${p.loop}}`,
      `  triggerOnHover={${p.triggerOnHover}}`,
      `  className="text-3xl font-semibold"`,
      `/>`,
    ].join("\n"),
};
