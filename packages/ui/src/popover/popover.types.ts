import type { ReactNode } from "react";

export interface PopoverContentProps {
  title?: ReactNode;
  description?: ReactNode;
  children?: ReactNode;
  side?: "top" | "right" | "bottom" | "left";
  align?: "start" | "center" | "end";
  sideOffset?: number;
  className?: string;
}
