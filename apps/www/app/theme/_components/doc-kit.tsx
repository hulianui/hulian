import type { ReactNode } from "react";
// dogfood：行内代码直接复用库 Code（纯皮肤·RSC 安全），不再本地重复一份。
export { Code } from "@hulianui/ui";

// Theme 文档区共享原语 —— 纯皮肤、server 安全（无 hooks）。下划线目录 = 私有不路由。

export function DocHeader({ title, en, lede }: { title: string; en: string; lede: ReactNode }) {
  return (
    <header className="mb-10 max-w-2xl">
      <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted">{en}</p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight">{title}</h1>
      <p className="mt-3 text-sm leading-relaxed text-muted">{lede}</p>
    </header>
  );
}

export function Section({ title, desc, children }: { title: string; desc?: ReactNode; children: ReactNode }) {
  return (
    <section className="mb-12 max-w-3xl">
      <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
      {desc ? <p className="mt-1.5 text-sm leading-relaxed text-muted">{desc}</p> : null}
      <div className="mt-5">{children}</div>
    </section>
  );
}

export function Note({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-[var(--radius)] border border-border bg-surface px-4 py-3 text-sm leading-relaxed text-muted">
      {children}
    </div>
  );
}

// 简单分隔卡片容器
export function Panel({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`rounded-[var(--radius)] border border-border bg-surface p-5 ${className}`}>
      {children}
    </div>
  );
}
