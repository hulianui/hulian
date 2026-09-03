"use client";
import type { ComponentProps, ReactNode } from "react";
import { Menu as BaseMenu } from "@base-ui/react/menu";
import { cva } from "class-variance-authority";
import { cn } from "../lib/cn";
import { Check, ChevronRight } from "../_icons";
import { overlayTransitions } from "../motion";
import type {
  MenuContentProps,
  MenuItemProps,
  MenuCheckboxItemProps,
  MenuRadioGroupProps,
  MenuRadioItemProps,
  MenuSubTriggerProps,
  MenuSubContentProps,
} from "./menu.types";

// 面板皮肤（主菜单 / 子菜单共用），抽常量而非各写一遍：#212 的成因正是同一套东西在两处
// 各自维护后漂开，子面板再抄一份字面量就是把同一个坑挪进本文件。
//
// 高度上限跟 Select / Combobox / TreeSelect 同一套：放得下时 min() 取 24rem 一档不产生
// 任何视觉差异；放不下时改为滚动，而不是让菜单项长到视口外——浮层是 fixed 的，溢出的
// 那截既点不到也滚不出来（#198）。
const popupClass =
  "max-h-[min(24rem,var(--available-height))] min-w-[8rem] overflow-y-auto rounded-[var(--radius)] border border-hairline bg-surface p-1 text-foreground shadow-xl outline-none origin-[var(--transform-origin)] data-[starting-style]:scale-95 data-[starting-style]:opacity-0 data-[ending-style]:scale-95 data-[ending-style]:opacity-0";

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
        <BaseMenu.Popup className={cn(popupClass, className)} style={overlayTransitions.popup}>
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

// ===== 级联子菜单（#212）=====
//
// 与 ContextMenu 的那三件是同一形态：Base UI 的 context-menu 与 menu 共用同一套 Submenu 原语
// （Menu.SubmenuRoot / Menu.SubmenuTrigger），所以点击式下拉本来就能开二级，缺的只是瑚琏这层封装。
// 消费方在库外拼这段是能跑的（issue 里的 shim 就是），但 chevron、右侧展开方位、data-popup-open
// 的高亮保持这三样得各自记住 —— 记漏了菜单看不出「这项还有下一级」，而这正是子菜单唯一的可见线索。

// 子菜单根：包住 SubTrigger + SubContent。
export const MenuSub = BaseMenu.SubmenuRoot;

// 子菜单触发项：菜单项皮肤 + 右向 chevron 提示有下级。
// data-popup-open 时保持高亮：指针移进子面板后就不再 hover 父项了，不补这条，
// 展开着的那一级会失去底色，看起来像「没选中任何东西却凭空冒出个面板」。
export function MenuSubTrigger({ variant, className, children, ...props }: MenuSubTriggerProps) {
  return (
    <BaseMenu.SubmenuTrigger
      className={cn(
        menuItemVariants({ variant }),
        "data-[popup-open]:bg-surface-hover data-[popup-open]:text-foreground",
        className,
      )}
      {...props}
    >
      {children}
      <ChevronRight className="ml-auto size-4 shrink-0 text-muted-foreground" />
    </BaseMenu.SubmenuTrigger>
  );
}

// 子菜单面板：锚到父项右侧（side=right / align=start），复用主面板皮肤。
export function MenuSubContent({ children, className }: MenuSubContentProps) {
  return (
    <BaseMenu.Portal>
      <BaseMenu.Positioner className="z-50" side="right" align="start" sideOffset={4}>
        <BaseMenu.Popup className={cn(popupClass, className)} style={overlayTransitions.popup}>
          {children}
        </BaseMenu.Popup>
      </BaseMenu.Positioner>
    </BaseMenu.Portal>
  );
}
