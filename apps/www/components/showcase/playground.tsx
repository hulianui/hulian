"use client";
import { useState } from "react";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  Input,
  Switch,
  CodeBlock,
  type ShowcaseSpec,
} from "@hulianui/ui";

export function Playground({ spec }: { spec: ShowcaseSpec }) {
  const [props, setProps] = useState<Record<string, unknown>>(
    Object.fromEntries(spec.controls.map((c) => [c.prop, c.defaultValue])),
  );
  const set = (k: string, v: unknown) => setProps((p) => ({ ...p, [k]: v }));

  return (
    // 竖排：配置 → 组件 → 代码（替代旧的左右两列）
    <div className="space-y-4">
      {spec.controls.length > 0 && (
        <div className="grid gap-3 rounded-[var(--radius)] border border-border/70 bg-subtle/50 p-4 sm:grid-cols-2 lg:grid-cols-3">
          {spec.controls.map((c) => (
          <label key={c.prop} className="block text-sm">
            <span className="mb-1 block text-muted-foreground">{c.label ?? c.prop}</span>
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
      )}
      <div className="flex min-h-32 items-center justify-center rounded-[var(--radius)] border border-border bg-bg p-8">
        {spec.renderWithProps(props)}
      </div>
      <CodeBlock code={spec.toCode(props)} className="rounded-[var(--radius)]" />
    </div>
  );
}
