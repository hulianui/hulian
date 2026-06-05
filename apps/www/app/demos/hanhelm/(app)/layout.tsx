import type { ReactNode } from "react";
import { HanHelmShell } from "../_components/helm-shell";

export default function HanHelmAppLayout({ children }: { children: ReactNode }) {
  return <HanHelmShell>{children}</HanHelmShell>;
}
