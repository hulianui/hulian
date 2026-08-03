"use client";
import { useState, type FormEvent } from "react";
import { Button } from "../button";
import { useLocaleValue } from "../config/locale-context";
import type { FormValues } from "../form/use-form";
import { cn } from "../lib/cn";
import type { ProFormProps } from "./pro-form.types";

// ProForm = 内联表单编排（ModalForm 的内联姊妹件）。useForm + 自动 footer(提交/重置) + async onFinish loading。
// 字段区栅格：用容器查询（@container）按「表单实际宽度」而非视口断点决定列数，
// 这样表单放进窄侧栏自动单列、放进宽主区才多列——响应式由组件内化，消费者不再手搓 grid。
const GRID_BY_COLUMNS: Record<1 | 2 | 3, string> = {
  1: "space-y-4",
  2: "grid grid-cols-1 gap-x-4 gap-y-4 @lg:grid-cols-2",
  3: "grid grid-cols-1 gap-x-4 gap-y-4 @md:grid-cols-2 @4xl:grid-cols-3",
};

export function ProForm({
  form,
  onFinish,
  submitText,
  resetText,
  showReset = true,
  columns = 1,
  footerAlign = "left",
  footer,
  className,
  children,
}: ProFormProps) {
  const loc = useLocaleValue("proForm", {
    submit: "提交",
    reset: "重置",
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    let values: FormValues = form ? form.values : {};
    if (form) {
      const r = await form.validate();
      if (!r.ok) return;
      values = r.values;
    }
    const ret = onFinish?.(values);
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

  return (
    <form onSubmit={handleSubmit} className={cn("@container flex flex-col gap-5", className)}>
      <div className={GRID_BY_COLUMNS[columns]}>{children}</div>
      {footer !== undefined ? (
        footer
      ) : (
        <div
          className={cn("flex gap-2", footerAlign === "right" ? "justify-end" : "justify-start")}
        >
          <Button type="submit" loading={loading}>
            {submitText ?? loc.submit}
          </Button>
          {showReset && form && (
            <Button
              type="button"
              variant="ghost"
              onClick={() => form.resetFields()}
              disabled={loading}
            >
              {resetText ?? loc.reset}
            </Button>
          )}
        </div>
      )}
    </form>
  );
}
