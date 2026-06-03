import Link from "next/link";
import { Sparkles } from "lucide-react";
import { manifest, CATEGORIES } from "../../lib/manifest";
import { SampleTable } from "../../components/showcase/sample-table";
import { AsyncUsers } from "../../components/showcase/async-users";

export default function ComponentsIndexPage() {
  return (
    <div className="mx-auto max-w-5xl space-y-12">
      <header>
        <h1 className="text-2xl font-semibold">组件</h1>
        <p className="mt-1 text-sm text-muted">瑚琏吸取式聚合组件库 · 博采众长</p>
      </header>

      {CATEGORIES.map((cat) => {
        const catItems = manifest.filter((m) => m.category === cat.key);
        if (catItems.length === 0) return null;
        return (
          <section key={cat.key} id={cat.key} className="scroll-mt-24 space-y-6">
            <h2 className="text-base font-semibold text-foreground">
              {cat.label}
              <span className="ml-2 text-sm font-normal tabular-nums text-muted">{catItems.length}</span>
            </h2>
            {cat.groups.map((g) => {
              const items = catItems.filter((m) => m.group === g.key);
              if (items.length === 0) return null;
              return (
                <div key={g.key} className="space-y-3">
                  <h3 className="text-xs font-medium uppercase tracking-wide text-muted">{g.label}</h3>
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {items.map((m) => (
                      <Link
                        key={m.slug}
                        href={`/components/${m.slug}`}
                        className="rounded-[var(--radius)] border border-border bg-surface p-4 transition-colors hover:bg-surface-hover"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-medium text-foreground">{m.name}</span>
                          {m.tags?.includes("animated") && (
                            <Sparkles className="size-3.5 shrink-0 text-primary/60" aria-label="动效" />
                          )}
                        </div>
                        <p className="mt-1 text-sm text-muted">{m.description}</p>
                      </Link>
                    ))}
                  </div>
                </div>
              );
            })}
          </section>
        );
      })}

      {/* 数据层 mock 能力总览（保留 P1 的 faker / MSW 演示可达）*/}
      <section className="space-y-4">
        <h2 className="text-sm font-medium text-muted">真实样例数据（faker）</h2>
        <div className="rounded-[var(--radius)] border border-border p-4">
          <SampleTable />
        </div>
      </section>
      <section className="space-y-4">
        <h2 className="text-sm font-medium text-muted">异步加载 + 分页（MSW）</h2>
        <div className="rounded-[var(--radius)] border border-border p-4">
          <AsyncUsers />
        </div>
      </section>
    </div>
  );
}
