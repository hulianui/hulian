import type { ReactNode } from "react";
import { HanHubShell } from "../_components/shell";

export default function HanHubAppLayout({ children }: { children: ReactNode }) {
  return <HanHubShell>{children}</HanHubShell>;
}
