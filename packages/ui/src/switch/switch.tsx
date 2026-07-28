"use client";
import { Switch as BaseSwitch } from "@base-ui/react/switch";
import { cva } from "class-variance-authority";
import { cn } from "../lib/cn";
import type { SwitchProps } from "./switch.types";

// 轨道与旋钮成对变化。三档的 on 位移都按同一条式子取：内容宽（轨道宽 − 2×1px 边框）− 旋钮宽，
// 于是 sm/md 同为 18px、lg 为 22px。md 档与加 size 之前逐像素一致。
const trackVariants = cva(
  cn(
    "relative inline-flex items-center rounded-full border border-border transition-colors outline-none",
    "bg-surface-hover data-[checked]:bg-primary",
    "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-bg",
    "disabled:opacity-50 disabled:pointer-events-none",
  ),
  {
    variants: {
      size: { sm: "h-5 w-9", md: "h-6 w-10", lg: "h-7 w-12" },
      // 不可见命中区：伪元素撑到 44px 高、铺满宽度，只扩命中不占布局。
      touchTarget: {
        true: "before:absolute before:left-0 before:top-1/2 before:h-11 before:w-full before:-translate-y-1/2 before:content-['']",
        false: "",
      },
    },
    defaultVariants: { size: "md", touchTarget: false },
  },
);

const thumbVariants = cva(
  // 旋钮恒为白色：在灰色 off 轨道与蓝色 on 轨道上、亮暗两态都保证对比。
  // 曾用 bg-surface（暗色=gray-900）→ 比轨道还暗且与面板同色，暗色 off 态整体「黑融黑」不可见。
  "block rounded-full bg-white shadow transition-transform",
  {
    variants: {
      size: {
        sm: "size-4 translate-x-0.5 data-[checked]:translate-x-[1.125rem]",
        md: "size-5 translate-x-0.5 data-[checked]:translate-x-[1.125rem]",
        lg: "size-6 translate-x-0.5 data-[checked]:translate-x-[1.375rem]",
      },
    },
    defaultVariants: { size: "md" },
  },
);

export function Switch({ className, size, touchTarget, ...props }: SwitchProps) {
  return (
    <BaseSwitch.Root
      {...props}
      className={cn(trackVariants({ size, touchTarget: Boolean(touchTarget) }), className)}
    >
      <BaseSwitch.Thumb className={thumbVariants({ size })} />
    </BaseSwitch.Root>
  );
}
