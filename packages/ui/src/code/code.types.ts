import type { HTMLAttributes, ReactNode } from "react";

export interface CodeProps extends HTMLAttributes<HTMLElement> {
  tone?: "default" | "primary" | "danger";
  children?: ReactNode;
}
