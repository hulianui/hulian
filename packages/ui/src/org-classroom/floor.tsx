import type { ReactNode } from "react";
import { cn } from "../lib/cn";
import { ISO_PLANE_CLASS } from "./iso";

/** 等距舞台。透视在外层，旋转在内层，子分区继续 preserve-3d。 */
export function Floor({ label, children }: { label: string; children: ReactNode }) {
  return (
    <section
      aria-label={label}
      data-slot="org-classroom-floor"
      className="rounded-[var(--radius)] bg-muted/40 px-8 py-24 sm:px-14"
    >
      <div className="mx-auto w-max [perspective:1400px]">
        <div data-slot="org-classroom-plane" className={cn(ISO_PLANE_CLASS, "flex items-start gap-16")}>
          {children}
        </div>
      </div>
    </section>
  );
}
