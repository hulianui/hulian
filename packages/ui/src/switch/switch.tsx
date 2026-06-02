"use client";
import { Switch as BaseSwitch } from "@base-ui-components/react/switch";
import { cn } from "../lib/cn";
import type { SwitchProps } from "./switch.types";

export function Switch({ className, ...props }: SwitchProps) {
  return (
    <BaseSwitch.Root
      {...props}
      className={cn(
        "relative inline-flex h-6 w-10 items-center rounded-full border border-border transition-colors outline-none",
        "bg-surface-hover data-[checked]:bg-primary",
        "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-bg",
        "disabled:opacity-50 disabled:pointer-events-none",
        className,
      )}
    >
      <BaseSwitch.Thumb className="block size-5 translate-x-0.5 rounded-full bg-surface shadow transition-transform data-[checked]:translate-x-[1.125rem]" />
    </BaseSwitch.Root>
  );
}
