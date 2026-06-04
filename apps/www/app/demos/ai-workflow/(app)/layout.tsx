import type { ReactNode } from "react";
import { StudioShell } from "../_components/studio-shell";

export default function AiWorkflowAppLayout({ children }: { children: ReactNode }) {
  return <StudioShell>{children}</StudioShell>;
}
