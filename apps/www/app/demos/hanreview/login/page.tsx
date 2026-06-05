"use client";
import { useRouter } from "next/navigation";
import { ShieldCheck, GitPullRequest, Sparkles } from "lucide-react";
import { Heading, Link, LoginForm, Meteors, Text } from "@hulianui/ui";

const FEATURES = [
  { icon: GitPullRequest, title: "逐文件 AI 审查", desc: "PR 进来自动逐文件审，行内批注问题" },
  { icon: Sparkles, title: "智能选模型", desc: "按文件复杂度与成本派给最合适的模型" },
  { icon: ShieldCheck, title: "质量门禁", desc: "分数/严重问题/覆盖率不达标自动阻断合并" },
];

export default function HanReviewLoginPage() {
  const router = useRouter();

  return (
    <main className="flex h-dvh bg-bg">
      <aside className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-neutral-950 p-12 text-white lg:flex">
        <Meteors number={18} />
        <div className="relative z-10 flex items-center gap-2">
          <span className="grid size-8 place-items-center rounded-[var(--radius)] bg-primary text-sm font-bold text-primary-foreground">
            瑚
          </span>
          <span className="text-base font-semibold tracking-tight">瀚审 HanReview</span>
        </div>

        <div className="relative z-10 max-w-md">
          <Heading level={1} size="3xl" balance className="text-white">
            把资深 reviewer
            <br />
            的眼睛规模化
          </Heading>
          <Text className="mt-4 text-white/70">
            每个 PR 进来，AI 审查员逐文件审查、行内批注、给质量分、跑质量门禁，决定能否合并。
          </Text>

          <ul className="mt-10 flex flex-col gap-5">
            {FEATURES.map((f) => (
              <li key={f.title} className="flex items-start gap-3">
                <span className="mt-0.5 grid size-9 shrink-0 place-items-center rounded-[var(--radius)] bg-white/10 text-primary-foreground">
                  <f.icon className="size-[18px]" />
                </span>
                <div>
                  <div className="font-medium text-white">{f.title}</div>
                  <Text size="sm" className="text-white/60">
                    {f.desc}
                  </Text>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <Text size="sm" className="relative z-10 text-white/50">
          © 2026 瑚琏 Hulian · 内置示例
        </Text>
      </aside>

      <div className="flex flex-1 items-center justify-center p-6">
        <div className="flex w-full max-w-md flex-col gap-3">
          <LoginForm
            logo={
              <span className="inline-flex items-center gap-2">
                <span className="grid size-7 place-items-center rounded-[var(--radius)] bg-primary text-sm font-bold text-primary-foreground">
                  瑚
                </span>
                <span className="text-base font-semibold tracking-tight">瀚审 HanReview</span>
              </span>
            }
            subtitle="登录进入代码审查质检台"
            onFinish={async () => {
              await new Promise((r) => setTimeout(r, 600));
              router.push("/demos/hanreview");
            }}
            footer={
              <div className="flex justify-between text-sm">
                <Link href="#">忘记密码</Link>
                <Link href="#">接入你的仓库</Link>
              </div>
            }
          />
          <Text size="xs" tone="muted" className="text-center">
            演示环境：用户名 / 密码任意填写即可登录
          </Text>
        </div>
      </div>
    </main>
  );
}
