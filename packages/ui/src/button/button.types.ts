import type { VariantProps } from "class-variance-authority";
import type { ButtonHTMLAttributes } from "react";
import type { buttonVariants } from "./button";

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  loading?: boolean;
}
