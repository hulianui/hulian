"use client";
import { useState, type FormEvent } from "react";
import { Button } from "../button";
import { Checkbox } from "../checkbox/checkbox";
import { useLocale } from "../config/locale";
import { Field } from "../field";
import { useForm } from "../form/use-form";
import { Input } from "../input";
import { cn } from "../lib/cn";
import type { LoginFormProps } from "./login-form.types";

// LoginForm = 登录页模板（自管 useForm：账号/密码必填 + 记住我）。复用 Field/Input/Checkbox/Button。
export function LoginForm({
  title,
  subtitle,
  logo,
  onFinish,
  loading: loadingProp,
  showRemember = true,
  footer,
  className,
}: LoginFormProps) {
  const loc = useLocale().loginForm;
  const form = useForm({ initialValues: { username: "", password: "", remember: false } });
  const [submitting, setSubmitting] = useState(false);
  const loading = loadingProp ?? submitting;

  const username = form.register("username", { rules: [{ required: true, message: loc.usernameRequired }] });
  const password = form.register("password", { rules: [{ required: true, message: loc.passwordRequired }] });
  const remember = Boolean(form.getFieldValue("remember"));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const r = await form.validate();
    if (!r.ok) return;
    const ret = onFinish?.({
      username: String(r.values.username ?? ""),
      password: String(r.values.password ?? ""),
      remember: Boolean(r.values.remember),
    });
    if (ret && typeof (ret as Promise<unknown>).then === "function") {
      setSubmitting(true);
      try {
        await ret;
      } catch {
        /* 失败：错误反馈交消费者 */
      } finally {
        setSubmitting(false);
      }
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={cn(
        // 左对齐 + 放大圆角 + 柔和分层阴影(非生硬单层 drop shadow) + 舒展留白
        "flex w-full max-w-sm flex-col rounded-[calc(var(--radius)+0.375rem)] border border-border bg-surface p-8 text-foreground",
        "shadow-[0_1px_3px_rgba(15,23,42,0.04),0_16px_40px_-20px_rgba(15,23,42,0.18)]",
        className,
      )}
    >
      <header className="mb-7 flex flex-col items-start gap-1.5">
        {logo != null && <div className="mb-3">{logo}</div>}
        {title !== null && (
          <h2 className="text-2xl font-semibold tracking-tight">{title ?? loc.title}</h2>
        )}
        {subtitle != null && <p className="text-sm text-muted">{subtitle}</p>}
      </header>

      <div className="flex flex-col gap-4">
        <Field label={loc.username} error={username.error}>
          <Input value={username.value as string} onChange={username.onChange} onBlur={username.onBlur} autoComplete="username" />
        </Field>
        <Field label={loc.password} error={password.error}>
          <Input
            type="password"
            value={password.value as string}
            onChange={password.onChange}
            onBlur={password.onBlur}
            autoComplete="current-password"
          />
        </Field>
        {showRemember && (
          <div className="flex items-center justify-between pt-0.5">
            <Checkbox
              label={loc.remember}
              checked={remember}
              onCheckedChange={(v) => form.setFieldValue("remember", v)}
            />
          </div>
        )}
        <Button type="submit" loading={loading} className="mt-2 w-full">
          {loc.submit}
        </Button>
      </div>

      {footer != null && <div className="mt-6 border-t border-border pt-4">{footer}</div>}
    </form>
  );
}
