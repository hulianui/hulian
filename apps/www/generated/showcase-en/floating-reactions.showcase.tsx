"use client";
import { useEffect, useRef } from "react";
import type { ShowcaseSpec } from "../../../../packages/ui/src/showcase/types";
import { FloatingReactions } from "../../../../packages/ui/src/floating-reactions/floating-reactions";
import type { FloatingReactionsHandle } from "../../../../packages/ui/src/floating-reactions/floating-reactions.types";
function FloatingDemo({ auto = false, emoji = "\u2764\uFE0F", palette, size, }: {
    auto?: boolean;
    emoji?: string;
    palette?: string[];
    size?: number;
}) {
    const ref = useRef<FloatingReactionsHandle>(null);
    useEffect(() => {
        if (!auto)
            return;
        const id = setInterval(() => ref.current?.emit(undefined, { count: 2 }), 500);
        return () => clearInterval(id);
    }, [auto]);
    return (<div className="relative grid h-72 w-64 place-items-center overflow-hidden rounded-[var(--radius)] bg-gradient-to-br from-slate-700 to-slate-900">
      <button type="button" onClick={() => ref.current?.emit(palette ? undefined : emoji, { count: 3 })} className="z-10 rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:bg-primary-hover">
        Like {emoji}
      </button>
      <FloatingReactions ref={ref} palette={palette} size={size}/>
    </div>);
}
export const floatingReactionsShowcase: ShowcaseSpec = {
    examples: [
        {
            title: "Imperative trigger",
            description: "By ref.emit spraying floating emoticons, count fires multiple at once. Click the button to try it.",
            code: `const ref = useRef<FloatingReactionsHandle>(null);

<button onClick={() => ref.current?.emit("\u2764\uFE0F", { count: 3 })}> Like \u2764\uFE0F</button>
<FloatingReactions ref={ref} />`,
            render: () => <FloatingDemo />,
        },
        {
            title: "Random emoticon pool",
            description: "When content is not transmitted, an emoticon is randomly selected from palette, which is suitable for mixed floating characters on the \"like wall\".",
            code: `<button onClick={() => ref.current?.emit(undefined, { count: 3 })}>Send flowers \uD83C\uDF38</button>
<FloatingReactions ref={ref} palette={["\uD83C\uDF38", "\uD83C\uDF3A", "\uD83C\uDF37", "\uD83D\uDC90"]} />`,
            render: () => <FloatingDemo emoji="🌸" palette={["\uD83C\uDF38", "\uD83C\uDF3A", "\uD83C\uDF37", "\uD83D\uDC90"]}/>,
        },
        {
            title: "Automatic burst",
            description: "Call emit regularly to simulate the happy atmosphere of continuous likes in the live broadcast room.",
            code: `useEffect(() => {
  const id = setInterval(() => ref.current?.emit(undefined, { count: 2 }), 500);
  return () => clearInterval(id);
}, []);

<FloatingReactions ref={ref} />`,
            render: () => <FloatingDemo auto/>,
        },
        {
            title: "Larger font size",
            description: "size Increase the base font size of individual expressions to make the overall expression more eye-catching.",
            code: `<FloatingReactions ref={ref} size={40} />`,
            render: () => <FloatingDemo size={40}/>,
        },
    ],
    controls: [],
    states: [
        { name: "Like Piaoxin (Imperative ref.emit \u00B7 Click the button to spray)", render: () => <FloatingDemo /> },
        { name: "Automatic burst", render: () => <FloatingDemo auto/> },
    ],
    renderWithProps: () => <FloatingDemo />,
    toCode: () => `const ref = useRef<FloatingReactionsHandle>(null);
// ...
<button onClick={() => ref.current?.emit("\u2764\uFE0F", { count: 3 })}>Like</button>
<FloatingReactions ref={ref} />`,
};
