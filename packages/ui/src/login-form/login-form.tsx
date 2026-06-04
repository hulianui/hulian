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
        "flex w-full max-w-sm flex-col gap-5 rounded-[var(--radius)] border border-border bg-surface p-6 text-foreground",
        className,
      )}
    >
      {(logo != null || title !== null) && (
        <div className="flex flex-col items-center gap-2">
          {logo}
          <h2 className="text-lg font-semibold">{title ?? loc.title}</h2>
        </div>
      )}
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
        <Checkbox
          label={loc.remember}
          checked={remember}
          onCheckedChange={(v) => form.setFieldValue("remember", v)}
        />
      )}
      <Button type="submit" loading={loading} className="w-full">
        {loc.submit}
      </Button>
      {footer}
    </form>
  );
}
