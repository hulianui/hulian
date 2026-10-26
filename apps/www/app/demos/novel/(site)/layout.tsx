import type { ReactNode } from "react";
import { NovelShell } from "../_components/novel-shell";

export default function NovelSiteLayout({ children }: { children: ReactNode }) {
  return <NovelShell>{children}</NovelShell>;
}
