"use client";
import { useState, type FormEvent } from "react";
import { Button } from "../button";
import { useLocale } from "../config/locale";
import type { FormValues } from "../form/use-form";
import { cn } from "../lib/cn";
import type { ProFormProps } from "./pro-form.types";

// ProForm = 内联表单编排（ModalForm 的内联姊妹件）。useForm + 自动 footer(提交/重置) + async onFinish loading。
export function ProForm({
  form,
  onFinish,
  submitText,
  resetText,
  showReset = true,
  footerAlign = "left",
  footer,
  className,
  children,
}: ProFormProps) {
  const loc = useLocale().proForm;
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
    <form onSubmit={handleSubmit} className={cn("flex flex-col gap-5", className)}>
      <div className="space-y-4">{children}</div>
      {footer !== undefined ? (
        footer
      ) : (
        <div className={cn("flex gap-2", footerAlign === "right" ? "justify-end" : "justify-start")}>
          <Button type="submit" loading={loading}>
            {submitText ?? loc.submit}
          </Button>
          {showReset && form && (
            <Button type="button" variant="ghost" onClick={() => form.resetFields()} disabled={loading}>
              {resetText ?? loc.reset}
            </Button>
          )}
        </div>
      )}
    </form>
  );
}
