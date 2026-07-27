"use client";

import { useCallback, useMemo, useState } from "react";
import Link from "next/link";
import {
  Field,
  Input,
  Checkbox,
  Button,
  Divider,
  SocialButton,
  Heading,
  Text,
  AuroraText,
  Spinner,
  toast,
} from "@hulianui/ui";
import { Rocket, Check } from "lucide-react";

// 注册 Block —— 自包含、可整段复制。
// 两栏布局：左侧品牌图文（响应式塌成单列），右侧表单。
// 含内联校验、密码强度提示、同意条款 Checkbox（带链接）、第三方注册、底部去登录。
// 异步提交用本文件内联 sleep 模拟，无外部依赖。

const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

interface FormState {
  name: string;
  email: string;
  password: string;
}

type Errors = Partial<Record<keyof FormState | "agree", string>>;

const empty: FormState = { name: "", email: "", password: "" };

/** 极简密码强度评分：0-4。 */
function scorePassword(pw: string): number {
  let score = 0;
  if (pw.length >= 8) score += 1;
  if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) score += 1;
  if (/\d/.test(pw)) score += 1;
  if (/[^A-Za-z0-9]/.test(pw)) score += 1;
  return score;
}

const strengthMeta = [
  { label: "太弱", tone: "var(--color-danger)" },
  { label: "较弱", tone: "var(--color-danger)" },
  { label: "一般", tone: "var(--color-warning)" },
  { label: "不错", tone: "var(--color-success)" },
  { label: "很强", tone: "var(--color-success)" },
] as const;

const highlights = [
  "免费开始，闲时弹性算力自动归零",
  "从 git push 到全球边缘上线",
  "端到端可观测，故障定位以秒计",
];

export function SignupBlock() {
  const [values, setValues] = useState<FormState>(empty);
  const [agree, setAgree] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [pending, setPending] = useState(false);

  const strength = useMemo(() => scorePassword(values.password), [values.password]);

  const set = useCallback(<K extends keyof FormState>(key: K, value: FormState[K]) => {
    setValues((v) => ({ ...v, [key]: value }));
    setErrors((e) => (e[key] ? { ...e, [key]: undefined } : e));
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const found: Errors = {};
    if (!values.name.trim()) found.name = "请填写姓名";
    if (!values.email.trim()) found.email = "请填写邮箱";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) found.email = "邮箱格式不正确";
    if (!values.password) found.password = "请设置密码";
    else if (values.password.length < 8) found.password = "密码至少 8 位";
    if (!agree) found.agree = "请先阅读并同意服务条款";

    if (Object.keys(found).length > 0) {
      setErrors(found);
      toast({ title: "请检查表单", description: "还有必填项未填写或格式不正确。", tone: "danger" });
      return;
    }

    setPending(true);
    void (async () => {
      try {
        await sleep(700);
        const email = values.email;
        setValues(empty);
        setAgree(false);
        toast({ title: "注册成功", description: `验证邮件已发送至 ${email}。`, tone: "success" });
      } finally {
        setPending(false);
      }
    })();
  };

  return (
    <section className="mx-auto grid w-full max-w-5xl overflow-hidden rounded-[var(--radius)] border border-border bg-surface shadow-sm md:grid-cols-2">
      {/* 左：品牌图文 */}
      <div
        className="hidden flex-col justify-between gap-10 p-10 md:flex"
        style={{
          background:
            "radial-gradient(125% 125% at 0% 0%, color-mix(in oklab, var(--color-primary) 12%, var(--color-bg)) 0%, var(--color-bg) 60%)",
        }}
      >
        <div>
          <span className="inline-flex items-center gap-2">
            <span className="grid size-8 place-items-center rounded-lg bg-primary text-sm font-bold text-primary-foreground">
              瀚
            </span>
            <span className="text-base font-semibold tracking-tight">瀚云</span>
          </span>
          <Heading
            level={2}
            weight="bold"
            balance
            className="mt-8 text-3xl leading-tight text-foreground"
          >
            把想法送上 <AuroraText>全球边缘</AuroraText>
          </Heading>
          <Text tone="muted" className="mt-3 max-w-sm">
            五分钟创建账号，开启第一个项目。无需信用卡。
          </Text>
        </div>
        <ul className="space-y-3">
          {highlights.map((h) => (
            <li key={h} className="flex items-start gap-2 text-sm text-foreground">
              <Check className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
              <span>{h}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* 右：表单 */}
      <div className="p-8 sm:p-10">
        <Heading level={1} size="xl" weight="semibold" className="text-foreground">
          创建你的账号
        </Heading>
        <Text tone="muted" size="sm" className="mt-1">
          已有账号？{" "}
          <Link
            href="#"
            className="font-medium text-primary underline-offset-4 hover:underline"
          >
            直接登录
          </Link>
        </Text>

        <form onSubmit={handleSubmit} className="mt-6 space-y-5" noValidate>
          <Field label="姓名" error={errors.name} name="name">
            <Input
              placeholder="你的名字"
              value={values.name}
              invalid={Boolean(errors.name)}
              onChange={(e) => set("name", e.target.value)}
            />
          </Field>

          <Field label="邮箱" error={errors.email} name="email">
            <Input
              type="email"
              placeholder="you@company.com"
              value={values.email}
              invalid={Boolean(errors.email)}
              onChange={(e) => set("email", e.target.value)}
            />
          </Field>

          <Field
            label="密码"
            error={errors.password}
            description={!errors.password ? "至少 8 位，建议含大小写字母、数字与符号" : undefined}
            name="password"
          >
            <Input
              type="password"
              placeholder="设置一个安全的密码"
              value={values.password}
              invalid={Boolean(errors.password)}
              onChange={(e) => set("password", e.target.value)}
            />
          </Field>

          {/* 密码强度提示 */}
          {values.password.length > 0 && (
            <div aria-live="polite">
              <div className="flex gap-1.5">
                {[0, 1, 2, 3].map((i) => (
                  <span
                    key={i}
                    className="h-1.5 flex-1 rounded-full bg-surface-hover"
                    style={
                      i < strength
                        ? { background: strengthMeta[strength].tone }
                        : undefined
                    }
                  />
                ))}
              </div>
              <Text size="xs" tone="muted" className="mt-1.5">
                密码强度：{strengthMeta[strength].label}
              </Text>
            </div>
          )}

          <div>
            <Checkbox
              checked={agree}
              onCheckedChange={(c) => {
                setAgree(c);
                if (c) setErrors((e) => (e.agree ? { ...e, agree: undefined } : e));
              }}
              label={
                <span className="text-sm text-foreground">
                  我已阅读并同意{" "}
                  <Link href="#" className="text-primary underline-offset-4 hover:underline">
                    服务条款
                  </Link>{" "}
                  与{" "}
                  <Link href="#" className="text-primary underline-offset-4 hover:underline">
                    隐私政策
                  </Link>
                </span>
              }
            />
            {errors.agree && (
              <Text size="xs" className="mt-1.5 text-danger">
                {errors.agree}
              </Text>
            )}
          </div>

          <Button type="submit" size="lg" disabled={pending} className="w-full">
            {pending ? (
              <Spinner size="sm" tone="current" className="mr-2" />
            ) : (
              <Rocket className="mr-2 size-4" aria-hidden />
            )}
            {pending ? "创建中…" : "创建账号"}
          </Button>
        </form>

        <Divider plain className="my-6 text-muted">
          或使用第三方注册
        </Divider>

        <div className="grid gap-3 sm:grid-cols-2">
          <SocialButton provider="github" className="w-full justify-center">
            GitHub
          </SocialButton>
          <SocialButton provider="google" className="w-full justify-center">
            Google
          </SocialButton>
        </div>
      </div>
    </section>
  );
}
