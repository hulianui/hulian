import type { ReactNode } from "react";
import { ComponentTree } from "../../components/component-tree";
import { DocsShell } from "../../components/docs-shell";

export default function ComponentsLayout({ children }: { children: ReactNode }) {
  return (
    <DocsShell navLabel="组件导航" nav={<ComponentTree />} contentClassName="bg-muted/[0.045]">
      {children}
    </DocsShell>
  );
}
