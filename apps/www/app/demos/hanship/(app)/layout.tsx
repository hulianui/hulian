import type { ReactNode } from "react";
import { HanShipShell } from "../_components/shell";

export default function HanShipAppLayout({ children }: { children: ReactNode }) {
  return <HanShipShell>{children}</HanShipShell>;
}
