"use client";

import { memo } from "react";
import { useComponentLocale } from "../config/locale-context";
import { cn } from "../lib/cn";
import type { StepperProps } from "./stepper.types";

// 自研步骤条（零依赖）。此前是 @mui/material/Stepper 的包装，但 MUI 只提供了布局与连接线
// —— 图标早就是自绘的（见下），标签色、连接线色也全靠 sx 覆盖成 token。为这点布局拖着
// emotion 这套 runtime CSS-in-JS 不划算，用 flex + token 直接画掉。
//
// 图标为什么自绘：MUI 默认完成态用 CheckCircle，其对勾是「负空间镂空」露出页面底色 ——
// 暗色下底色发黑，对勾就成了黑色，且无法用 CSS 给镂空上色。所以填充圆 + 独立描边对勾。
//
// 状态语义与原实现一致：done = i < activeStep，active = i === activeStep。
// 连接线「通往已达成步」时点亮主色（即第 i 段在 i < activeStep 时点亮）。

function StepIcon({ index, done, active }: { index: number; done: boolean; active: boolean }) {
  const filled = done || active;
  return (
    <span
      aria-hidden
      className={cn(
        "inline-flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold",
        filled
          ? "bg-primary text-primary-foreground"
          : "border border-border bg-transparent text-muted",
      )}
    >
      {done ? (
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={3}
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <path d="M20 6 9 17l-5-5" />
        </svg>
      ) : (
        index + 1
      )}
    </span>
  );
}

function StepperImpl({ steps, activeStep, className }: StepperProps) {
  const locale = useComponentLocale().stepper ?? { progress: "步骤进度" };
  return (
    <ol className={cn("flex w-full items-start", className)} aria-label={locale.progress}>
      {steps.map((s, i) => {
        const done = i < activeStep;
        const active = i === activeStep;
        return (
          <li
            key={i}
            className="flex min-w-0 flex-1 flex-col items-center"
            aria-current={active ? "step" : undefined}
            data-state={done ? "completed" : active ? "active" : "pending"}
          >
            {/* 图标行：左右伸出连接线，首尾两段用 invisible 占位保持图标严格居中 */}
            <div className="flex w-full items-center">
              <span
                className={cn(
                  "h-px flex-1",
                  i === 0 && "invisible",
                  done || active ? "bg-primary" : "bg-border",
                )}
              />
              <StepIcon index={i} done={done} active={active} />
              <span
                className={cn(
                  "h-px flex-1",
                  i === steps.length - 1 && "invisible",
                  done ? "bg-primary" : "bg-border",
                )}
              />
            </div>
            <span
              className={cn(
                "mt-2 px-1 text-center text-sm",
                done || active ? "text-foreground" : "text-muted",
              )}
            >
              {s.label}
            </span>
          </li>
        );
      })}
    </ol>
  );
}

StepperImpl.displayName = "Stepper";

// Stepper 挂在向导/审批流外壳里，父级状态一变就重渲；props 稳定时应整棵跳过
// —— 与 Button/Checkbox/Chip 同一处方（hulianui/hulian#89）。
export const Stepper = memo(StepperImpl);
Stepper.displayName = "Stepper";
