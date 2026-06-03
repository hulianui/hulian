"use client";
import { useState, type ReactNode } from "react";
import { CodeBlock } from "./code-block";

export function ComponentPreview({ children, code }: { children: ReactNode; code: string }) {
  const [tab, setTab] = useState<"preview" | "code">("preview");
  return (
    <div className="overflow-hidden rounded-[var(--radius)] border border-border">
      <div className="flex gap-1 border-b border-border bg-surface px-2 py-1.5 text-sm">
        {(["preview", "code"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`rounded px-2.5 py-1 transition-colors ${
              tab === t ? "bg-surface-hover text-foreground" : "text-muted hover:text-foreground"
            }`}
          >
            {t === "preview" ? "预览" : "代码"}
          </button>
        ))}
      </div>
      {tab === "preview" ? (
        <div className="flex flex-wrap items-center gap-4 bg-bg p-8">{children}</div>
      ) : (
        <CodeBlock code={code} />
      )}
    </div>
  );
}
