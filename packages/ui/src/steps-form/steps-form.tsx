"use client";
import { useState } from "react";
import { Button } from "../button";
import { useLocale } from "../config/locale";
import { cn } from "../lib/cn";
import { Steps } from "../steps/steps";
import type { StepsFormProps } from "./steps-form.types";

// StepsForm = 分步表单（复用 Steps 指示器 + 上一步/下一步/提交 导航 shell）。
// 步进前可经 onStepValidate 校验本步；值跨步保留由消费者的 useForm 持有（仅当前步内容挂载）。
export function StepsForm({
  steps,
  current: currentProp,
  defaultCurrent = 0,
  onCurrentChange,
  onStepValidate,
  onFinish,
  direction = "horizontal",
  className,
}: StepsFormProps) {
  const loc = useLocale().stepsForm;
  const [internal, setInternal] = useState(defaultCurrent);
  const current = currentProp ?? internal;
  const [loading, setLoading] = useState(false);

  const last = steps.length - 1;

  const setCurrent = (n: number) => {
    if (currentProp === undefined) setInternal(n);
    onCurrentChange?.(n);
  };

  const prev = () => setCurrent(Math.max(current - 1, 0));

  const advance = () => setCurrent(Math.min(current + 1, last));

  const submit = async () => {
    const ret = onFinish?.();
    if (ret && typeof (ret as Promise<unknown>).then === "function") {
      setLoading(true);
      try {
        await ret;
      } catch {
        /* 失败：错误反馈交消费者 */
      } finally {
        setLoading(false);
      }
    }
  };

  // 无 onStepValidate → 同步推进（状态即时更新）；有 → 经异步校验，通过才推进。
  const runGuarded = (action: () => void) => {
    if (onStepValidate) {
      Promise.resolve(onStepValidate(current)).then((ok) => {
        if (ok) action();
      });
    } else {
      action();
    }
  };

  const next = () => runGuarded(advance);
  const finish = () => runGuarded(() => void submit());

  return (
    <div className={cn("flex flex-col gap-6", className)}>
      <Steps
        direction={direction}
        current={current}
        items={steps.map((s) => ({ title: s.title, description: s.description }))}
      />
      <div>{steps[current]?.content}</div>
      <div className="flex gap-2">
        {current > 0 && (
          <Button variant="outline" onClick={prev} disabled={loading}>
            {loc.prev}
          </Button>
        )}
        {current < last ? (
          <Button onClick={next}>{loc.next}</Button>
        ) : (
          <Button onClick={finish} loading={loading}>
            {loc.submit}
          </Button>
        )}
      </div>
    </div>
  );
}
