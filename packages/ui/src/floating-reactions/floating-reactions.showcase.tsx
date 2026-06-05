"use client";
import { useEffect, useRef } from "react";
import type { ShowcaseSpec } from "../showcase/types";
import { FloatingReactions } from "./floating-reactions";
import type { FloatingReactionsHandle } from "./floating-reactions.types";

function FloatingDemo({ auto = false }: { auto?: boolean }) {
  const ref = useRef<FloatingReactionsHandle>(null);
  useEffect(() => {
    if (!auto) return;
    const id = setInterval(() => ref.current?.emit(undefined, { count: 2 }), 500);
    return () => clearInterval(id);
  }, [auto]);

  return (
    <div className="relative grid h-72 w-64 place-items-center overflow-hidden rounded-[var(--radius)] bg-gradient-to-br from-slate-700 to-slate-900">
      <button
        type="button"
        onClick={() => ref.current?.emit("❤️", { count: 3 })}
        className="z-10 rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:bg-primary-hover"
      >
        点赞 ❤
      </button>
      <FloatingReactions ref={ref} />
    </div>
  );
}

export const floatingReactionsShowcase: ShowcaseSpec = {
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
