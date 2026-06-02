"use client";
import { useState } from "react";
import type { ShowcaseSpec } from "@hulian/ui";

export function Playground({ spec }: { spec: ShowcaseSpec }) {
  const [props, setProps] = useState<Record<string, unknown>>(
    Object.fromEntries(spec.controls.map((c) => [c.prop, c.defaultValue])),
  );
  const set = (k: string, v: unknown) => setProps((p) => ({ ...p, [k]: v }));

  return (
    <div className="grid gap-4 md:grid-cols-[1fr_16rem]">
      <div className="space-y-4">
        <div className="flex min-h-32 items-center justify-center rounded-[var(--radius)] border border-border bg-bg p-8">
          {spec.renderWithProps(props)}
        </div>
        <pre className="overflow-auto rounded-[var(--radius)] bg-surface p-4 text-sm">
          <code className="text-foreground">{spec.toCode(props)}</code>
        </pre>
      </div>
      <div className="space-y-3 rounded-[var(--radius)] border border-border bg-surface p-4">
        {spec.controls.map((c) => (
          <label key={c.prop} className="block text-sm">
            <span className="mb-1 block text-muted">{c.label ?? c.prop}</span>
            {c.type === "select" && (
              <select
                className="w-full rounded border border-border bg-bg px-2 py-1.5 text-foreground"
                value={String(props[c.prop])}
                onChange={(e) => set(c.prop, e.target.value)}
              >
                {c.options!.map((o) => (
                  <option key={o} value={o}>
                    {o}
                  </option>
                ))}
              </select>
            )}
            {c.type === "boolean" && (
              <input
                type="checkbox"
                checked={Boolean(props[c.prop])}
                onChange={(e) => set(c.prop, e.target.checked)}
                className="size-4 accent-[var(--color-primary)]"
              />
            )}
            {c.type === "text" && (
              <input
                className="w-full rounded border border-border bg-bg px-2 py-1.5 text-foreground"
                value={String(props[c.prop])}
                onChange={(e) => set(c.prop, e.target.value)}
              />
            )}
            {c.type === "number" && (
              <input
                type="number"
                className="w-full rounded border border-border bg-bg px-2 py-1.5 text-foreground"
                value={Number(props[c.prop])}
                onChange={(e) => set(c.prop, Number(e.target.value))}
              />
            )}
          </label>
        ))}
      </div>
    </div>
  );
}
