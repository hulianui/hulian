"use client";

import { useState, type FormEvent } from "react";
import { Button, GridPattern, Heading, Input, Text } from "@hulianui/ui";
import { Check, Mail } from "lucide-react";

// 内嵌订阅 CTA —— 克制网格底纹 + 居中标题 + inline 邮箱订阅表单。
// 提交走本地态机：idle → loading（模拟请求）→ done（成功态），无需后端。
// 视觉全程 token 化，跟随站点明暗切换。
export function CtaNewsletterBlock() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done">("idle");

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (status !== "idle" || !email.trim()) return;
    setStatus("loading");
    // 模拟订阅请求
    window.setTimeout(() => setStatus("done"), 1100);
  }

  return (
    <section className="px-6 py-20 sm:py-24">
      <div className="relative mx-auto w-full max-w-2xl overflow-hidden rounded-2xl border border-hairline bg-[var(--color-surface)] px-6 py-14 text-center sm:px-12">
        {/* 极低对比网格底纹，向中心渐隐 */}
        <GridPattern
          width={36}
          height={36}
          className="pointer-events-none absolute inset-0 h-full w-full text-foreground/[0.04] [mask-image:radial-gradient(ellipse_at_center,black_20%,transparent_80%)]"
        />
        <div className="relative flex flex-col items-center gap-4">
          <Heading level={2} size="2xl" weight="bold" balance>
            订阅瀚云月报
          </Heading>
          <Text tone="muted" size="lg" className="max-w-md">
            每月一封，精选产品更新、最佳实践与一线团队的实战经验。不灌水，随时退订。
          </Text>

          {status === "done" ? (
            <div className="mt-4 flex items-center gap-2 text-primary">
              <Check className="size-5" aria-hidden />
              <Text size="lg" weight="medium" tone="primary">
                订阅成功，欢迎加入瀚云！
              </Text>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="mt-4 flex w-full max-w-md flex-col gap-2.5 sm:flex-row"
            >
              <Input
                type="email"
                required
                size="lg"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                prefix={<Mail className="size-4 text-muted-foreground" aria-hidden />}
                className="flex-1"
                disabled={status === "loading"}
                aria-label="邮箱地址"
              />
              <Button
                type="submit"
                size="lg"
                loading={status === "loading"}
                className="sm:w-auto"
              >
                {status === "loading" ? "提交中" : "立即订阅"}
              </Button>
            </form>
          )}

          <Text tone="muted" size="xs" className="mt-1 max-w-sm">
            提交即代表你同意我们的隐私政策。我们绝不会把你的邮箱分享给第三方。
          </Text>
        </div>
      </div>
    </section>
  );
}
