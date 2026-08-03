"use client";
import { useEffect, useRef, useState } from "react";
import type { ShowcaseSpec } from "../../../../packages/ui/src/showcase/types";
import { StreamingText } from "../../../../packages/ui/src/streaming-text/streaming-text";
const FULL = "Standing on the shoulders of Base UI, TanStack, Recharts, Hulian learned from the strengths of others and gathered together a set of React components that can be directly used with import, with light and dark dual themes and 0 flicker.";
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
    return (<p className="max-w-lg text-sm leading-relaxed text-foreground">
      <StreamingText text={text} streaming={streaming}/>
    </p>);
}
export const streamingTextShowcase: ShowcaseSpec = {
    examples: [
        {
            title: "Streaming (trailing cursor)",
            description: "When streaming is true, a blinking cursor is appended to the end, and the text grows with token.",
            code: `<p className="text-sm leading-relaxed">
  <StreamingText text="Hulian stands on the shoulders of Base UI, TanStack, Recharts" streaming />
</p>`,
            render: () => (<p className="max-w-lg text-sm leading-relaxed text-foreground">
          <StreamingText text="Hulian stands on the shoulders of Base UI, TanStack, Recharts" streaming/>
        </p>),
        },
        {
            title: "Completed (remove cursor)",
            description: "streaming is false / When omitted, the cursor is not rendered, as the final static text.",
            code: `<p className="text-sm leading-relaxed">
  <StreamingText text="Hulian supports light and dark dual themes 0 flashing." />
</p>`,
            render: () => (<p className="max-w-lg text-sm leading-relaxed text-foreground">
          <StreamingText text="Hulian supports light and dark dual themes with 0 flicker."/>
        </p>),
        },
        {
            title: "Keep line breaks",
            description: "whitespace-pre-wrap built-in, line breaks in the text are preserved intact.",
            code: `<StreamingText text={"First row\\nSecond row\\nThird row"} streaming />`,
            render: () => (<p className="max-w-lg text-sm leading-relaxed text-foreground">
          <StreamingText text={"First line\nSecond line\nThird line"} streaming/>
        </p>),
        },
        {
            title: "Custom cursor",
            description: "cursor slot replaces the default vertical bar, for example with a \"\u258D\" block cursor.",
            code: `<StreamingText
  text="Generating answer"
  streaming
  cursor={<span className="ml-0.5 text-primary">\u258D</span>}
/>`,
            render: () => (<p className="max-w-lg text-sm leading-relaxed text-foreground">
          <StreamingText text="Generating answer" streaming cursor={<span className="ml-0.5 text-primary">▍</span>}/>
        </p>),
        },
    ],
    controls: [],
    states: [
        { name: "Streaming word-by-word (cursor flashes \u2192 remove cursor at the end)", render: () => <Demo /> },
        {
            name: "Static clip + cursor",
            render: () => (<p className="max-w-lg text-sm leading-relaxed">
          <StreamingText text="Thinking about your question" streaming/>
        </p>),
        },
    ],
    renderWithProps: () => <Demo />,
    toCode: () => `<StreamingText text={text} streaming={!done} />`,
};
