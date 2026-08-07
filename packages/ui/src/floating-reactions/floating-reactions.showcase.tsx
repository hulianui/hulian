"use client";
import { useEffect, useRef } from "react";
import type { ShowcaseSpec } from "../showcase/types";
import { Button } from "../button";
import { FloatingReactions } from "./floating-reactions";
import type { FloatingReactionsHandle } from "./floating-reactions.types";

function FloatingDemo({
  auto = false,
  emoji = "❤️",
  palette,
  size,
}: {
  auto?: boolean;
  emoji?: string;
  palette?: string[];
  size?: number;
}) {
  const ref = useRef<FloatingReactionsHandle>(null);
  useEffect(() => {
    if (!auto) return;
    const id = setInterval(() => ref.current?.emit(undefined, { count: 2 }), 500);
    return () => clearInterval(id);
  }, [auto]);

  return (
    <div className="relative grid h-72 w-64 place-items-center overflow-hidden rounded-[var(--radius)] bg-gradient-to-br from-slate-700 to-slate-900">
      {/* 触发器 dogfood Button 而不是裸 <button>：showcase 是消费方照抄的地方，
          手搓一颗按钮就等于把「没有焦点环 / 没有禁用态 / 文字可被连点选中」一路复制出去。 */}
      <Button
        className="z-10 rounded-full"
        onClick={() => ref.current?.emit(palette ? undefined : emoji, { count: 3 })}
      >
        点赞 {emoji}
      </Button>
      <FloatingReactions ref={ref} palette={palette} size={size} />
    </div>
  );
}

export const floatingReactionsShowcase: ShowcaseSpec = {
  examples: [
    {
      title: "命令式触发",
      description: "通过 ref.emit 喷射上浮表情，count 一次发射多个。点击按钮试试。",
      code: `const ref = useRef<FloatingReactionsHandle>(null);

<Button onClick={() => ref.current?.emit("❤️", { count: 3 })}>点赞 ❤️</Button>
<FloatingReactions ref={ref} />`,
      render: () => <FloatingDemo />,
    },
    {
      title: "随机表情池",
      description: "不传 content 时从 palette 随机取一个表情，适合「点赞墙」混合飘字。",
      code: `<Button onClick={() => ref.current?.emit(undefined, { count: 3 })}>送花 🌸</Button>
<FloatingReactions ref={ref} palette={["🌸", "🌺", "🌷", "💐"]} />`,
      render: () => <FloatingDemo emoji="🌸" palette={["🌸", "🌺", "🌷", "💐"]} />,
    },
    {
      title: "自动连发",
      description: "定时调用 emit 模拟直播间持续点赞的飘心氛围。",
      code: `useEffect(() => {
  const id = setInterval(() => ref.current?.emit(undefined, { count: 2 }), 500);
  return () => clearInterval(id);
}, []);

<FloatingReactions ref={ref} />`,
      render: () => <FloatingDemo auto />,
    },
    {
      title: "更大字号",
      description: "size 调大单个表情的基准字号，整体更醒目。",
      code: `<FloatingReactions ref={ref} size={40} />`,
      render: () => <FloatingDemo size={40} />,
    },
  ],
  controls: [],
  states: [
    { name: "点赞飘心（命令式 ref.emit · 点按钮喷射）", render: () => <FloatingDemo /> },
    { name: "自动连发", render: () => <FloatingDemo auto /> },
  ],
  renderWithProps: () => <FloatingDemo />,
  toCode: () => `const ref = useRef<FloatingReactionsHandle>(null);
// ...
<button onClick={() => ref.current?.emit("❤️", { count: 3 })}>点赞</button>
<FloatingReactions ref={ref} />`,
};
