import type { ReactNode } from "react";

export interface DialogContentProps {
  title: string;
  description?: string;
  children?: ReactNode;
  className?: string;
}
