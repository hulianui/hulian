"use client";
import type { ComponentProps, ReactNode } from "react";
import { Menu as BaseMenu } from "@base-ui/react/menu";
import { cva } from "class-variance-authority";
import { cn } from "../lib/cn";
import { Check } from "../_icons";
import { motionDurationCss, motionEaseCss } from "../motion";
import type {
  MenuContentProps,
  MenuItemProps,
  MenuCheckboxItemProps,
  MenuRadioGroupProps,
  MenuRadioItemProps,
} from "./menu.types";

// overlay 自管 mount/unmount；用瑚琏 motion token 的 CSS 镜像驱动 Base UI 原生过渡（与 Dialog/Popover 同手感）。
// transition 简写(而非 transitionDuration/TimingFunction 长写)：Base UI 过渡期会往内联 style 注入
// transition 简写，与长写混在同一 style 对象 → React "shorthand/longhand 混用" 警告并丢弃长写。
const overlayTransition = {
  transition: `opacity ${motionDurationCss.base} ${motionEaseCss.out}, transform ${motionDurationCss.base} ${motionEaseCss.out}`,
} as const;

export function Menu(props: ComponentProps<typeof BaseMenu.Root>) {
  return <BaseMenu.Root {...props} />;
}

export const MenuTrigger = BaseMenu.Trigger;
export const MenuGroup = BaseMenu.Group;

export function MenuContent({
  children,
  side = "bottom",
  align = "start",
  sideOffset = 6,
  className,
}: MenuContentProps) {
  return (
    <BaseMenu.Portal>
      <BaseMenu.Positioner side={side} align={align} sideOffset={sideOffset} className="z-50">
        <BaseMenu.Popup
          className={cn(
            // 高度上限跟 Select / Combobox / TreeSelect 同一套：放得下时 min() 取 24rem 一档不产生
            // 任何视觉差异；放不下时改为滚动，而不是让菜单项长到视口外——浮层是 fixed 的，溢出的
            // 那截既点不到也滚不出来（#198）。
            "max-h-[min(24rem,var(--available-height))] min-w-[8rem] overflow-y-auto rounded-[var(--radius)] border border-hairline bg-surface p-1 text-foreground shadow-xl outline-none",
            "origin-[var(--transform-origin)] data-[starting-style]:scale-95 data-[starting-style]:opacity-0 data-[ending-style]:scale-95 data-[ending-style]:opacity-0",
            className,
          )}
          style={overlayTransition}
        >
          {children}
        </BaseMenu.Popup>
      </BaseMenu.Positioner>
    </BaseMenu.Portal>
  );
}

// Item 渲 <div>，高亮态 data-highlighted（键盘漫游 + 指针 hover 同置位）、禁用 data-disabled
// （非 button → 禁 hover/focus/:disabled 伪类）。圆角封顶避小盒过圆。
export const menuItemVariants = cva(
  [
    "flex cursor-default select-none items-center gap-2 rounded-[min(var(--radius),0.375rem)] px-2 py-1.5 text-sm outline-none transition-colors",
    "data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
  ],
  {
    variants: {
      variant: {
        default: "text-foreground data-[highlighted]:bg-surface-hover data-[highlighted]:text-foreground",
        danger: "text-danger data-[highlighted]:bg-danger/10 data-[highlighted]:text-danger",
      },
    },
    defaultVariants: { variant: "default" },
  },
);

export function MenuItem({ variant, className, ...props }: MenuItemProps) {
  return <BaseMenu.Item className={cn(menuItemVariants({ variant }), className)} {...props} />;
}

// ===== 选中态菜单项（勾选 / 单选）=====
//
// 存在的理由是 a11y 而非视觉：用 MenuItem 自己画一个 √ 看起来一模一样，但 role 退化成
// menuitem、没有 aria-checked —— 读屏用户听到的是几个平级动作，听不出这是一组选项、
// 也听不出当前选的是哪个。语义只能由原语给，所以这两件走 Base UI 的 CheckboxItem / RadioItem
// （role=menuitemcheckbox / menuitemradio + aria-checked 由它们自己写，调用处顶不掉）。
//
// 勾选槽位：MenuItem 是 `flex gap-2`，首个 size-4 图标恰好占 1rem；这里把 display 换成
// grid-cols-[1rem_1fr]（gap-2 继续由 menuItemVariants 提供，tailwind-merge 只替换 display），
// 指示器落第一列、文字落第二列。未选中时指示器不挂载，但列宽由栅格固定 ——
// 所以同一个菜单里勾选项与「带图标的普通项」文字左缘对齐，也不会因勾选与否而横跳。
const indicatorSlotClass = "grid grid-cols-[1rem_1fr]";
const indicatorClass = "col-start-1 flex size-4 items-center justify-center";
const indicatorLabelClass = "col-start-2 inline-flex items-center gap-2";

export function MenuCheckboxItem({ variant, className, children, ...props }: MenuCheckboxItemProps) {
  return (
    <BaseMenu.CheckboxItem
      {...props}
      className={cn(menuItemVariants({ variant }), indicatorSlotClass, className)}
    >
      <BaseMenu.CheckboxItemIndicator className={indicatorClass}>
        <Check aria-hidden className="size-4" />
      </BaseMenu.CheckboxItemIndicator>
      <span className={indicatorLabelClass}>{children}</span>
    </BaseMenu.CheckboxItem>
  );
}

// 单选组：把一组 MenuRadioItem 绑到同一个受控/非受控值上，互斥由 Base UI 维护。
export function MenuRadioGroup({ className, ...props }: MenuRadioGroupProps) {
  return <BaseMenu.RadioGroup {...props} className={className} />;
}

// 单选项：选中标记用实心圆点（与勾选项的 √ 区分「单选」与「多选」，与 Radix/shadcn 同惯例）。
export function MenuRadioItem({ variant, className, children, ...props }: MenuRadioItemProps) {
  return (
    <BaseMenu.RadioItem
      {...props}
      className={cn(menuItemVariants({ variant }), indicatorSlotClass, className)}
    >
      <BaseMenu.RadioItemIndicator className={indicatorClass}>
        <span className="size-2 rounded-full bg-current" />
      </BaseMenu.RadioItemIndicator>
      <span className={indicatorLabelClass}>{children}</span>
    </BaseMenu.RadioItem>
  );
}

export function MenuSeparator({ className }: { className?: string }) {
  return <BaseMenu.Separator className={cn("-mx-1 my-1 h-px bg-border", className)} />;
}

export function MenuGroupLabel({ children, className }: { children?: ReactNode; className?: string }) {
  return (
    <BaseMenu.GroupLabel className={cn("px-2 py-1.5 text-xs font-medium text-muted-foreground", className)}>
      {children}
    </BaseMenu.GroupLabel>
  );
}
