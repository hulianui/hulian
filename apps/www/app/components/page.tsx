"use client";
import Link from "next/link";
import { buttonShowcase, switchShowcase, dialogShowcase, type ShowcaseSpec } from "@hulian/ui";
import { ComponentPreview } from "../../components/showcase/component-preview";
import { StatesGallery } from "../../components/showcase/states-gallery";
import { Playground } from "../../components/showcase/playground";
import { SampleTable } from "../../components/showcase/sample-table";
import { AsyncUsers } from "../../components/showcase/async-users";
import { ThemeToggle } from "../../components/theme-toggle";

const SPECS: { name: string; spec: ShowcaseSpec }[] = [
  { name: "Button", spec: buttonShowcase },
  { name: "Switch", spec: switchShowcase },
  { name: "Dialog", spec: dialogShowcase },
];

function defaultProps(spec: ShowcaseSpec) {
  return Object.fromEntries(spec.controls.map((c) => [c.prop, c.defaultValue]));
}

export default function ComponentsPage() {
  return (
    <main className="mx-auto max-w-4xl space-y-16 px-6 py-12">
      <header className="flex items-center justify-between">
        <div>
          <Link href="/" className="text-sm text-muted hover:text-foreground">
            ← 瑚琏 Hulian
          </Link>
          <h1 className="mt-1 text-2xl font-semibold">组件</h1>
        </div>
        <ThemeToggle />
      </header>

      {SPECS.map(({ name, spec }) => (
        <section key={name} className="space-y-6">
          <h2 className="text-xl font-semibold">{name}</h2>

          <ComponentPreview code={spec.toCode(defaultProps(spec))}>
            {spec.states[0].render()}
          </ComponentPreview>

          <div>
            <h3 className="mb-3 text-sm font-medium text-muted">全状态</h3>
            <StatesGallery states={spec.states} />
          </div>

          {spec.controls.length > 0 && (
            <div>
              <h3 className="mb-3 text-sm font-medium text-muted">Playground</h3>
              <Playground spec={spec} />
            </div>
          )}
        </section>
      ))}

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">真实样例数据（faker）</h2>
        <div className="rounded-[var(--radius)] border border-border p-4">
          <SampleTable />
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">异步加载 + 分页（MSW）</h2>
        <div className="rounded-[var(--radius)] border border-border p-4">
          <AsyncUsers />
        </div>
      </section>
    </main>
  );
}
