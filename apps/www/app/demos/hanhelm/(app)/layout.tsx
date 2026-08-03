import type { ReactNode } from "react";
import { HanHelmShell } from "../_components/helm-shell";
import { FunnelServerContract } from "../_fixtures/funnel-server-contract";

export default function HanHelmAppLayout({ children }: { children: ReactNode }) {
  return (
    <HanHelmShell>
      <FunnelServerContract />
      {children}
    </HanHelmShell>
  );
}
