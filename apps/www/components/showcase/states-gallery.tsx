import type { StateSpec } from "@hulian/ui";

export function StatesGallery({ states }: { states: StateSpec[] }) {
  return (
    <div className="flex flex-wrap gap-4">
      {states.map((s) => (
        <div
          key={s.name}
          className="flex min-w-32 max-w-full flex-col items-center gap-2 rounded-[var(--radius)] border border-border bg-surface p-4"
        >
          <div className="flex min-h-12 items-center justify-center">{s.render()}</div>
          <span className="text-xs text-muted">{s.name}</span>
        </div>
      ))}
    </div>
  );
}
