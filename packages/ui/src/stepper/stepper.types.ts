import type { ReactNode } from "react";

export interface StepItem {
  label: ReactNode;
}
export interface StepperProps {
  steps: StepItem[];
  /** 受控当前步（0-based） */
  activeStep: number;
  className?: string;
}
