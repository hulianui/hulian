import { copy } from "./layout.content";
import type { ReactNode } from "react";
import { BackTop, Watermark } from "@hulianui/ui";
import { ProjectsShell } from "../_components/projects-shell";

// 工程协同后台外壳：route group (app) 把侧栏/顶栏/页签套在所有业务页上。
export default function ProjectsAppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="h-dvh">
      <Watermark content={copy("hulianProjectDemonstration")}>
        <ProjectsShell>{children}</ProjectsShell>
      </Watermark>
      <BackTop />
    </div>
  );
}
