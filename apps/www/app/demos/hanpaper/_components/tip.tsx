"use client";
import type { ReactElement, ReactNode } from "react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@hulianui/ui";

/** Tooltip for icon-only buttons. The trigger is injected through `render` (never as children). */
export function Tip({ label, children, side }: { label: ReactNode; children: ReactElement; side?: "top" | "right" | "bottom" | "left" }) {
  return (
    <Tooltip>
      <TooltipTrigger render={children} />
      <TooltipContent side={side}>{label}</TooltipContent>
    </Tooltip>
  );
}
