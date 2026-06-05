"use client";
import { useState } from "react";
import { AvatarCircles, Button, Input, Tag, Heading, Text } from "@hulianui/ui";
import { Check, Mail, Sparkles } from "lucide-react";

// Hero 变体 · 等候名单 —— 与居中款 hero.tsx 区分：以邮箱订阅 + 社会证明为转化主体。
// 居中标题 + 副文案 + 内嵌邮箱 inline 表单（提交态本地管理）+ AvatarCircles + "已有 8,200+ 人加入"。

// 内联渐变头像（data-URI，无远程资源）。
function avatar(a: string, b: string): string {
  return (
    "data:image/svg+xml;utf8," +
    encodeURIComponent(
      `<svg xmlns='http://www.w3.org/2000/svg' width='80' height='80'>
        <defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'>
          <stop offset='0%' stop-color='${a}'/><stop offset='100%' stop-color='${b}'/>
        </linearGradient></defs>
        <rect width='80' height='80' fill='url(#g)'/>
      </svg>`,
    )
  );
}

const AVATARS = [
  { src: avatar("#6366f1", "#8b5cf6"), alt: "成员头像" },
  { src: avatar("#0ea5e9", "#22d3ee"), alt: "成员头像" },
  { src: avatar("#f43f5e", "#fb923c"), alt: "成员头像" },
  { src: avatar("#10b981", "#34d399"), alt: "成员头像" },
  { src: avatar("#eab308", "#f59e0b"), alt: "成员头像" },
];

export function HeroWaitlistBlock() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  return (
    <section className="relative overflow-hidden border-b border-border bg-bg">
      <div className="mx-auto flex max-w-2xl flex-col items-center gap-6 px-6 py-24 text-center md:py-32">
        <Tag variant="soft" tone="brand" size="md" icon={<Sparkles className="size-3.5" />}>
          即将公测 · 抢先体验
        </Tag>

        <Heading
          level={1}
          weight="bold"
          balance
          className="text-4xl leading-tight text-foreground sm:text-5xl"
        >
          加入瀚云等候名单
        </Heading>

        <Text tone="muted" size="lg" className="max-w-xl">
          我们正在邀请首批团队体验全新的云端工作台。留下邮箱，公测开放第一时间通知你。
        </Text>

        {/* 内嵌邮箱订阅表单 */}
        <form
          className="mt-2 flex w-full max-w-md flex-col gap-3 sm:flex-row"
          onSubmit={(e) => {
            e.preventDefault();
            if (email.trim()) setSubmitted(true);
          }}
        >
          <Input
            type="email"
            required
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            prefix={<Mail className="size-4" />}
            disabled={submitted}
            className="flex-1"
            aria-label="邮箱地址"
          />
          <Button type="submit" size="lg" disabled={submitted}>
            {submitted ? (
              <>
                <Check className="mr-1.5 size-4" aria-hidden />
                已加入
              </>
            ) : (
              "申请加入"
            )}
          </Button>
        </form>

        {submitted && (
          <Text tone="primary" size="sm">
            🎉 已收到，公测开放时我们会发邮件通知你。
          </Text>
        )}

        {/* 社会证明 */}
        <div className="mt-4 flex flex-col items-center gap-3">
          <AvatarCircles avatars={AVATARS} extraCount={99} size="md" />
          <Text tone="muted" size="sm">
            已有 <span className="font-medium text-foreground">8,200+</span> 人加入等候名单
          </Text>
        </div>
      </div>
    </section>
  );
}
