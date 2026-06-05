"use client";
import { useRouter } from "next/navigation";
import { Boxes, Activity, ScrollText } from "lucide-react";
import { Heading, Link, LoginForm, GridPattern, Text } from "@hulian/ui";

const FEATURES = [
  { icon: Boxes, title: "一个 base_url，十余家上游", desc: "OpenAI / Claude / Gemini / DeepSeek / Qwen 全 OpenAI 兼容" },
  { icon: Activity, title: "健康探测 + 自动熔断转移", desc: "渠道测速、被动失败转移、阈值熔断，可用性兜底" },
  { icon: ScrollText, title: "逐请求成本可观测", desc: "input/output 分计、倍率、配额，每一次调用都算得清" },
];

export default function HanHubLoginPage() {
  const router = useRouter();

  return (
    <main className="flex h-dvh bg-bg">
      <aside className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-neutral-950 p-12 text-white lg:flex">
        <GridPattern className="absolute inset-0 text-white/10" />
        <div className="relative z-10 flex items-center gap-2">
          <span className="grid size-8 place-items-center rounded-[var(--radius)] bg-primary text-sm font-bold text-primary-foreground">
            枢
          </span>
          <span className="text-base font-semibold tracking-tight">瀚枢 HanHub</span>
        </div>

        <div className="relative z-10 max-w-md">
          <Heading level={1} size="3xl" balance className="text-white">
            一站式
            <br />
            大模型 API 中转网关
          </Heading>
          <Text className="mt-4 text-white/70">
            统一接入、智能路由、健康探测、逐请求计费 —— 把多家大模型收拢到一把密钥背后。
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
          © 2026 瀚枢 HanHub · 内置示例
        </Text>
      </aside>

      <div className="flex flex-1 items-center justify-center p-6">
        <div className="flex w-full max-w-md flex-col gap-3">
          <LoginForm
            logo={
              <span className="inline-flex items-center gap-2">
                <span className="grid size-7 place-items-center rounded-[var(--radius)] bg-primary text-sm font-bold text-primary-foreground">
                  枢
                </span>
                <span className="text-base font-semibold tracking-tight">瀚枢 HanHub</span>
              </span>
            }
            subtitle="登录网关控制台"
            onFinish={async () => {
              await new Promise((r) => setTimeout(r, 600));
              router.push("/demos/hanhub");
            }}
            footer={
              <div className="flex justify-between text-sm">
                <Link href="#">忘记密码</Link>
                <Link href="#">申请接入</Link>
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
