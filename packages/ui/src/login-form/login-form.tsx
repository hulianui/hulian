"use client";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { Button } from "../button";
import { Checkbox } from "../checkbox/checkbox";
import { useLocale } from "../config/locale";
import { Field } from "../field";
import type { FormRule } from "../form/rules";
import { useForm } from "../form/use-form";
import { Input } from "../input";
import { cn } from "../lib/cn";
import type { LoginFormProps, LoginValues } from "./login-form.types";

const FIELD_KEYS = ["username", "password", "remember"] as const;

// LoginForm = 登录页模板（默认自管 useForm：账号/密码必填 + 记住我）。复用 Field/Input/Checkbox/Button。
// 三个逃生口：rules（追加字段校验）、values + onValuesChange（受控）、beforeSubmit + extra（验证码等前置步骤）。
export function LoginForm({
  title,
  subtitle,
  logo,
  onFinish,
  loading: loadingProp,
  showRemember = true,
  rememberLabel,
  rememberDescription,
  footer,
  rules,
  values: valuesProp,
  onValuesChange,
  beforeSubmit,
  extra,
  fields,
  surface = true,
  className,
}: LoginFormProps) {
  const loc = useLocale().loginForm;
  const controlled = valuesProp !== undefined;
  // 受控回写触发的内部变更不该再冒泡给外部（否则外部 setState → 再同步 → 回调重复）
  const syncing = useRef(false);
  const form = useForm({
    initialValues: {
      username: valuesProp?.username ?? "",
      password: valuesProp?.password ?? "",
      remember: valuesProp?.remember ?? false,
    },
    onValuesChange: (changed, all) => {
      if (syncing.current) return;
      onValuesChange?.(changed as Partial<LoginValues>, all as unknown as LoginValues);
    },
  });
  const [submitting, setSubmitting] = useState(false);
  const loading = loadingProp ?? submitting;

  // 受控：外部值变化 → 同步进内部表单（只回写真正不同的字段，避免无谓渲染）
  const { setFieldsValue, getFieldValue } = form;
  const ctrl = { username: valuesProp?.username, password: valuesProp?.password, remember: valuesProp?.remember };
  const { username: ctrlUsername, password: ctrlPassword, remember: ctrlRemember } = ctrl;
  useEffect(() => {
    if (!controlled) return;
    const next: Partial<LoginValues> = { username: ctrlUsername, password: ctrlPassword, remember: ctrlRemember };
    const patch: Record<string, unknown> = {};
    for (const key of FIELD_KEYS) {
      const v = next[key];
      if (v !== undefined && v !== getFieldValue(key)) patch[key] = v;
    }
    if (Object.keys(patch).length === 0) return;
    syncing.current = true;
    setFieldsValue(patch);
    syncing.current = false;
  }, [controlled, ctrlUsername, ctrlPassword, ctrlRemember, setFieldsValue, getFieldValue]);

  const usernameRules: FormRule[] = [{ required: true, message: loc.usernameRequired }, ...(rules?.username ?? [])];
  const passwordRules: FormRule[] = [{ required: true, message: loc.passwordRequired }, ...(rules?.password ?? [])];
  const username = form.register("username", { rules: usernameRules });
  const password = form.register("password", { rules: passwordRules });
  const remember = Boolean(form.getFieldValue("remember"));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const r = await form.validate();
    if (!r.ok) return;
    const values: LoginValues = {
      username: String(r.values.username ?? ""),
      password: String(r.values.password ?? ""),
      remember: Boolean(r.values.remember),
    };
    setSubmitting(true);
    try {
      // beforeSubmit 返回 false / 抛错 → 中止（验证码取消、前置校验不通过等）
      if (beforeSubmit && (await beforeSubmit(values)) === false) return;
      await onFinish?.(values);
    } catch {
      /* 失败：错误反馈交消费者 */
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={cn(
        "flex w-full max-w-md flex-col text-foreground",
        // 卡面可整体关掉：分屏登录页的右半边不该再套一张卡（卡中卡）。
        // 关掉时连内距一起让给外层——否则消费方还要写 xl:p-0 抵消，等于没关。
        surface &&
          // 左对齐 + 放大圆角 + 阴影令牌(三层结构·明暗自适应) + 舒展留白
          "rounded-[calc(var(--radius)+0.375rem)] border border-border bg-surface p-8 sm:p-10 shadow-xl",
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
        <Field
          label={fields?.username?.label ?? loc.username}
          description={fields?.username?.description}
          error={username.error}
        >
          <Input
            value={username.value as string}
            onChange={username.onChange}
            onBlur={username.onBlur}
            placeholder={fields?.username?.placeholder}
            prefix={fields?.username?.prefix}
            suffix={fields?.username?.suffix}
            autoComplete={fields?.username?.autoComplete ?? "username"}
          />
        </Field>
        <Field
          label={fields?.password?.label ?? loc.password}
          description={fields?.password?.description}
          error={password.error}
        >
          <Input
            type="password"
            value={password.value as string}
            onChange={password.onChange}
            onBlur={password.onBlur}
            placeholder={fields?.password?.placeholder}
            prefix={fields?.password?.prefix}
            suffix={fields?.password?.suffix}
            autoComplete={fields?.password?.autoComplete ?? "current-password"}
          />
        </Field>
        {extra}
        {showRemember && (
          <div className="flex flex-col gap-1 pt-0.5">
            <div className="flex items-center justify-between">
              <Checkbox
                label={rememberLabel ?? loc.remember}
                checked={remember}
                onCheckedChange={(v) => form.setFieldValue("remember", v)}
              />
            </div>
            {rememberDescription != null && (
              // 说明行紧贴勾选项（extra 槽在密码框与记住我之间，位置不对）。
              <p className="pl-6 text-xs text-muted">{rememberDescription}</p>
            )}
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
