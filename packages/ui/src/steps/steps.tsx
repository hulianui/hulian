"use client";
import { memo } from "react";
import { Check, X } from "../_icons";
import { cn } from "../lib/cn";
import type { StepsItem, StepStatus, StepsProps } from "./steps.types";
import { useComponentLocale } from "../config/locale-context";

// Steps = 零依赖原生步骤条（替代重型 MUI stepper 桥件）。数据驱动 items；状态由 current 派生、可被 item.status 覆盖。
// 仅消费语义 token；连接线颜色取「线左侧那一步是否 finish」。可点击时整个步头(指示器+标题)成 button。

const indicatorByStatus: Record<StepStatus, string> = {
  finish: "bg-primary text-primary-foreground",
  process: "bg-primary text-primary-foreground ring-4 ring-primary/15",
  wait: "border border-border bg-surface text-muted-foreground",
  error: "bg-danger text-danger-foreground",
};

const titleByStatus: Record<StepStatus, string> = {
  finish: "text-foreground",
  process: "text-foreground font-medium",
  wait: "text-muted-foreground",
  error: "text-danger font-medium",
};

const sizeMap = {
  sm: { box: "size-6 text-xs", title: "text-xs", desc: "text-[11px]" },
  md: { box: "size-8 text-sm", title: "text-sm", desc: "text-xs" },
} as const;

function resolveStatus(
  index: number,
  current: number,
  stepsStatus: StepsProps["status"],
  override?: StepStatus,
): StepStatus {
  if (override) return override;
  if (index < current) return "finish";
  if (index === current) return stepsStatus ?? "process";
  return "wait";
}

function Indicator({
  status,
  index,
  item,
  box,
}: {
  status: StepStatus;
  index: number;
  item: StepsItem;
  box: string;
}) {
  return (
    <span
      className={cn(
        "relative z-1 grid shrink-0 place-items-center rounded-full font-medium transition-colors [&>svg]:size-[55%]",
        box,
        indicatorByStatus[status],
      )}
      aria-hidden
    >
      {item.icon ?? (status === "finish" ? <Check /> : status === "error" ? <X /> : index + 1)}
    </span>
  );
}

function StepsImpl({
  items,
  current = 0,
  status,
  direction = "horizontal",
  size = "md",
  onChange,
  className,
}: StepsProps) {
  const labels = useComponentLocale().steps ?? { label: "步骤" };
  const sz = sizeMap[size];
  const vertical = direction === "vertical";

  return (
    <ol
      className={cn("flex", vertical ? "flex-col" : "flex-row items-start", className)}
      aria-label={labels.label}
    >
      {items.map((item, i) => {
        const st = resolveStatus(i, current, status, item.status);
        const isLast = i === items.length - 1;
        const interactive = !!onChange;
        const canClick = interactive && !item.disabled;
        const Comp = interactive ? "button" : "div";
        // 连接线：线左侧/上侧那一步 finish 则点亮。
        const connectorOn = st === "finish";
        const connectorClass = cn(
          "rounded-full transition-colors",
          connectorOn ? "bg-primary" : "bg-border",
        );

        const head = (
          <Comp
            type={interactive ? "button" : undefined}
            onClick={interactive ? () => onChange?.(i) : undefined}
            disabled={interactive ? item.disabled : undefined}
            className={cn(
              "group flex text-left outline-none",
              vertical ? "w-full items-start gap-3" : "w-full flex-col",
              canClick && "cursor-pointer",
              item.disabled && "cursor-not-allowed opacity-50",
            )}
          >
            {vertical ? (
              <>
                <span className="flex flex-col items-center self-stretch">
                  <span
                    className={cn(
                      "rounded-full",
                      canClick &&
                        "transition-transform group-hover:scale-105 group-focus-visible:ring-2 group-focus-visible:ring-ring group-focus-visible:ring-offset-2",
                    )}
                  >
                    <Indicator status={st} index={i} item={item} box={sz.box} />
                  </span>
                  {!isLast && <span className={cn("mt-1 w-0.5 flex-1", connectorClass)} />}
                </span>
                <span className={cn("min-w-0 flex-1", isLast ? "pb-0" : "pb-6")}>
                  <span className={cn("block leading-tight", sz.title, titleByStatus[st])}>
                    {item.title}
                  </span>
                  {item.description != null && (
                    <span className={cn("mt-0.5 block text-muted-foreground", sz.desc)}>
                      {item.description}
                    </span>
                  )}
                </span>
              </>
            ) : (
              <>
                <span className="flex w-full items-center">
                  <span
                    className={cn(
                      "rounded-full",
                      canClick &&
                        "transition-transform group-hover:scale-105 group-focus-visible:ring-2 group-focus-visible:ring-ring group-focus-visible:ring-offset-2",
                    )}
                  >
                    <Indicator status={st} index={i} item={item} box={sz.box} />
                  </span>
                  {!isLast && <span className={cn("mx-2 h-0.5 flex-1", connectorClass)} />}
                </span>
                <span className={cn("mt-2 pr-4", isLast && "pr-0")}>
                  <span className={cn("block leading-tight", sz.title, titleByStatus[st])}>
                    {item.title}
                  </span>
                  {item.description != null && (
                    <span className={cn("mt-0.5 block text-muted-foreground", sz.desc)}>
                      {item.description}
                    </span>
                  )}
                </span>
              </>
            )}
          </Comp>
        );

        return (
          <li
            key={i}
            aria-current={i === current ? "step" : undefined}
            className={cn("relative", vertical ? "" : isLast ? "flex-none" : "flex-1")}
          >
            {head}
          </li>
        );
      })}
    </ol>
  );
}
StepsImpl.displayName = "Steps";

// evidence 链指向的是根（GenericFixture -> Steps）：items 引用不变时整条步骤条本可跳过。
// 内部 Indicator 是同一次渲染里的子节点，根被 memo 挡住后它连带不跑，无需单独 memo。
// props 全是原语 + 稳定 items 时 React 无法自己 bailout —— 与 Button/Checkbox/Chip 同一处方。
export const Steps = memo(StepsImpl);
Steps.displayName = "Steps";
