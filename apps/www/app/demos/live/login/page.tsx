"use client";
import { useRouter } from "next/navigation";
import { Radio, Sparkles, ShoppingBag, Bot } from "lucide-react";
import { Heading, Link, LoginForm, Meteors, Text } from "@hulian/ui";

const FEATURES = [
  { icon: Radio, title: "一键开播中控", desc: "实时弹幕 / 在线 / 带货数据尽在掌握" },
  { icon: Bot, title: "AI 直播副驾", desc: "自动答弹幕、智能提词、情绪与转化分析" },
  { icon: ShoppingBag, title: "小黄车直连", desc: "拖拽排序、一键讲解、同步观众端抢购" },
];

export default function LiveLoginPage() {
  const router = useRouter();
  return (
    <main className="flex h-dvh bg-bg">
      <aside className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-neutral-950 p-12 text-white lg:flex">
        <Meteors number={18} />
        <div className="relative z-10 flex items-center gap-2">
          <span className="grid size-8 place-items-center rounded-[var(--radius)] bg-primary text-sm font-bold text-primary-foreground">
            瀚
          </span>
          <span className="text-base font-semibold tracking-tight">瀚播 HanLive</span>
        </div>

        <div className="relative z-10 max-w-md">
          <Heading level={1} size="3xl" balance className="text-white">
            AI 副驾
            <br />
            陪你播好每一场
          </Heading>
          <Text className="mt-4 text-white/70">
            主播中控台 + C 端观众直播间，一套实时引擎驱动。弹幕、礼物、飘心、小黄车、AI 答疑，开播即用。
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
                  瀚
                </span>
                <span className="text-base font-semibold tracking-tight">瀚播 HanLive</span>
              </span>
            }
            subtitle="登录后进入主播中控台"
            onFinish={async () => {
              await new Promise((r) => setTimeout(r, 500));
              router.push("/demos/live");
            }}
            footer={
              <div className="flex justify-between text-sm">
                <Link href="#">忘记密码</Link>
                <Link href="/demos/live/room">先逛逛观众端</Link>
              </div>
            }
          />
          <Text size="sm" className="text-center text-muted">
            <Sparkles className="mr-1 inline size-3.5" />
            演示账号已预填，直接「登录」即可
          </Text>
        </div>
      </div>
    </main>
  );
}
