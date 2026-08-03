import type { ReactNode } from "react";
import { ComponentTree } from "../../components/component-tree";
import { DocsShell } from "../../components/docs-shell";
import { DOCS_LOCALE } from "../../lib/docs-locale";

export default function ComponentsLayout({ children }: { children: ReactNode }) {
  return (
    <DocsShell
      navLabel={DOCS_LOCALE === "en" ? "Component navigation" : "组件导航"}
      nav={<ComponentTree />}
      contentClassName="bg-muted/[0.045]"
    >
      {children}
    </DocsShell>
  );
}
