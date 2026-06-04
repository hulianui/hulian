import type { ReactNode } from "react";
import { BackTop, Watermark } from "@hulian/ui";
import { ProjectsShell } from "../_components/projects-shell";

// 工程协同后台外壳：route group (app) 把侧栏/顶栏/页签套在所有业务页上。
export default function ProjectsAppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="h-dvh">
      <Watermark content="瑚琏工程 · 演示">
        <ProjectsShell>{children}</ProjectsShell>
      </Watermark>
      <BackTop />
    </div>
  );
}
