"use client";
import { useState } from "react";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  Input,
  Switch,
  type ShowcaseSpec,
} from "@hulian/ui";
import { CodeBlock } from "./code-block";

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
        <CodeBlock code={spec.toCode(props)} className="rounded-[var(--radius)]" />
      </div>
      <div className="space-y-3 rounded-[var(--radius)] border border-border bg-surface p-4">
        {spec.controls.map((c) => (
          <label key={c.prop} className="block text-sm">
            <span className="mb-1 block text-muted">{c.label ?? c.prop}</span>
            {c.type === "select" && (
              <Select
                items={c.options!.map((o) => ({ value: o, label: o }))}
                value={String(props[c.prop])}
                onValueChange={(v) => set(c.prop, v)}
              >
                <SelectTrigger size="sm" />
                <SelectContent>
                  {c.options!.map((o) => (
                    <SelectItem key={o} value={o}>
                      {o}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            {c.type === "boolean" && (
              <Switch
                checked={Boolean(props[c.prop])}
                onCheckedChange={(checked) => set(c.prop, checked)}
              />
            )}
            {c.type === "text" && (
              <Input
                size="sm"
                value={String(props[c.prop])}
                onChange={(e) => set(c.prop, e.target.value)}
              />
            )}
            {c.type === "number" && (
              <Input
                type="number"
                size="sm"
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
