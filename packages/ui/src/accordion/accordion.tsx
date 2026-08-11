"use client";
import { Accordion as BaseAccordion } from "@base-ui/react/accordion";
import { cn } from "../lib/cn";
import { motionDurationCss, motionEaseCss } from "../motion";
import type {
  AccordionProps,
  AccordionItemProps,
  AccordionTriggerProps,
  AccordionPanelProps,
} from "./accordion.types";

// 容器：透明转发 Root（不偷改 Base UI 默认 multiple=true）+ 边框/圆角/item 分隔皮肤。
// 泛型参数原样透给 Base UI Root（默认 string），受控 value / onValueChange 才有真类型（#163）。
export function Accordion<Value = string>({ className, ...props }: AccordionProps<Value>) {
  return (
    <BaseAccordion.Root
      {...props}
      className={cn(
        "w-full divide-y divide-border overflow-hidden rounded-[var(--radius)] border border-border bg-surface text-foreground",
        className,
      )}
    />
  );
}

export function AccordionItem({ className, ...props }: AccordionItemProps) {
  return <BaseAccordion.Item {...props} className={cn(className)} />;
}

// Header(语义 heading) + Trigger(button) + chevron 打包；group 让 chevron 读父 data-panel-open。
export function AccordionTrigger({ className, children, ...props }: AccordionTriggerProps) {
  return (
    <BaseAccordion.Header>
      <BaseAccordion.Trigger
        {...props}
        className={cn(
          "group flex w-full items-center justify-between gap-3 px-4 py-3.5 text-left text-sm font-medium text-foreground outline-none transition-colors",
          "hover:bg-surface-hover",
          "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset",
          "data-[disabled]:opacity-50 data-[disabled]:pointer-events-none",
          className,
        )}
      >
        {children}
        <svg
          data-chevron
          aria-hidden
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="size-4 shrink-0 text-muted-foreground transition-transform duration-200 group-data-[panel-open]:rotate-180"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </BaseAccordion.Trigger>
    </BaseAccordion.Header>
  );
}

// Panel 本体零 padding（border-box 下 padding 会撑破塌零）；高度走 Base UI 内建
// --accordion-panel-height 纯 CSS 过渡。时长/曲线复用 motion token CSS 镜像（同 Dialog）——
// 与 Button(motion) 同手感、零混库。内层 div 承载 padding 与正文皮肤；plain 时整层不渲染（#162）。
export function AccordionPanel({ className, children, plain = false, ...props }: AccordionPanelProps) {
  return (
    <BaseAccordion.Panel
      {...props}
      style={{
        transitionDuration: motionDurationCss.base,
        transitionTimingFunction: motionEaseCss.out,
      }}
      className={cn(
        "h-[var(--accordion-panel-height)] overflow-hidden transition-[height]",
        "data-[starting-style]:h-0 data-[ending-style]:h-0",
        className,
      )}
    >
      {plain ? children : <div className="px-4 pb-4 pt-1 text-sm text-muted-foreground">{children}</div>}
    </BaseAccordion.Panel>
  );
}
