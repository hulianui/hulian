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
