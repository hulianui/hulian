import type { ReactNode } from "react";
import { HanPaperShell } from "../_components/shell";

export default function HanPaperAppLayout({ children }: { children: ReactNode }) {
  return <HanPaperShell>{children}</HanPaperShell>;
}
