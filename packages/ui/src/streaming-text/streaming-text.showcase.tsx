"use client";
import { useEffect, useRef, useState } from "react";
import type { ShowcaseSpec } from "../showcase/types";
import { StreamingText } from "./streaming-text";

const FULL =
  "瑚琏站在 Base UI、TanStack、Recharts 肩上博采众长，聚成一套可直接 import 的 React 组件，明暗双主题 0 闪烁。";

// 模拟逐字流入（演示用：定时追加），实战中由 SSE/fetch stream 驱动 text 增长
function Demo() {
  const [text, setText] = useState("");
  const [streaming, setStreaming] = useState(true);
  const ref = useRef(0);
  useEffect(() => {
    ref.current = 0;
    setText("");
    setStreaming(true);
    const id = setInterval(() => {
      ref.current += 1;
      setText(FULL.slice(0, ref.current));
      if (ref.current >= FULL.length) {
        setStreaming(false);
        clearInterval(id);
      }
    }, 60);
    return () => clearInterval(id);
  }, []);
  return (
    <p className="max-w-lg text-sm leading-relaxed text-foreground">
      <StreamingText text={text} streaming={streaming} />
    </p>
  );
}

export const streamingTextShowcase: ShowcaseSpec = {
  examples: [
    {
      title: "流式中（尾随光标）",
      description: "streaming 为 true 时尾部追加闪烁光标，文本随 token 增长。",
      code: `<p className="text-sm leading-relaxed">
  <StreamingText text="瑚琏站在 Base UI、TanStack、Recharts 肩上" streaming />
</p>`,
      render: () => (
        <p className="max-w-lg text-sm leading-relaxed text-foreground">
          <StreamingText text="瑚琏站在 Base UI、TanStack、Recharts 肩上" streaming />
        </p>
      ),
    },
    {
      title: "已完成（去光标）",
      description: "streaming 为 false / 省略时不渲染光标，作为最终静态文本。",
      code: `<p className="text-sm leading-relaxed">
  <StreamingText text="瑚琏支持明暗双主题 0 闪烁。" />
</p>`,
      render: () => (
        <p className="max-w-lg text-sm leading-relaxed text-foreground">
          <StreamingText text="瑚琏支持明暗双主题 0 闪烁。" />
        </p>
      ),
    },
    {
      title: "保留换行",
      description: "whitespace-pre-wrap 内置，文本中的换行原样保留。",
      code: `<StreamingText text={"第一行\\n第二行\\n第三行"} streaming />`,
      render: () => (
        <p className="max-w-lg text-sm leading-relaxed text-foreground">
          <StreamingText text={"第一行\n第二行\n第三行"} streaming />
        </p>
      ),
    },
    {
      title: "自定义光标",
      description: "cursor 槽替换默认竖线，例如用「▍」块光标。",
      code: `<StreamingText
  text="正在生成回答"
  streaming
  cursor={<span className="ml-0.5 text-primary">▍</span>}
/>`,
      render: () => (
        <p className="max-w-lg text-sm leading-relaxed text-foreground">
          <StreamingText
            text="正在生成回答"
            streaming
            cursor={<span className="ml-0.5 text-primary">▍</span>}
          />
        </p>
      ),
    },
  ],
  controls: [],
  states: [
    { name: "流式逐字（光标闪烁→收尾去光标）", render: () => <Demo /> },
    {
      name: "静态片段 + 光标",
      render: () => (
        <p className="max-w-lg text-sm leading-relaxed">
          <StreamingText text="正在思考你的问题" streaming />
        </p>
      ),
    },
  ],
  renderWithProps: () => <Demo />,
  toCode: () => `<StreamingText text={text} streaming={!done} />`,
};
