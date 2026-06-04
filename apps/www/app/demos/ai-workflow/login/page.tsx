"use client";
import { useRouter } from "next/navigation";
import { Sparkles, Wand2, Clapperboard } from "lucide-react";
import { Heading, Link, LoginForm, Meteors, Text } from "@hulian/ui";

const FEATURES = [
  { icon: Wand2, title: "可视化节点编排", desc: "拖拽连线即可搭出生图/视频流水线" },
  { icon: Sparkles, title: "多模型自由组合", desc: "提示词、放大、风格重绘随心拼接" },
  { icon: Clapperboard, title: "一键文生视频", desc: "从一句话到一段动态画面" },
];

export default function AiWorkflowLoginPage() {
  const router = useRouter();

  return (
    <main className="flex h-dvh bg-bg">
      {/* 左：品牌面板 */}
      <aside className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-neutral-950 p-12 text-white lg:flex">
        <Meteors number={18} />
        <div className="relative z-10 flex items-center gap-2">
          <span className="grid size-8 place-items-center rounded-[var(--radius)] bg-primary text-sm font-bold text-primary-foreground">
            瑚
          </span>
          <span className="text-base font-semibold tracking-tight">瑚琏 Flow Studio</span>
        </div>

        <div className="relative z-10 max-w-md">
          <Heading level={1} size="3xl" balance className="text-white">
            把创意
            <br />
            连成一条流水线
          </Heading>
          <Text className="mt-4 text-white/70">
            可视化编排 AI 生图与视频工作流：提示词、模型、放大、图生视频，拖拽连线即可运行。
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

      {/* 右：登录表单 */}
      <div className="flex flex-1 items-center justify-center p-6">
        <div className="flex w-full max-w-md flex-col gap-3">
          <LoginForm
            logo={
              <span className="inline-flex items-center gap-2">
                <span className="grid size-7 place-items-center rounded-[var(--radius)] bg-primary text-sm font-bold text-primary-foreground">
                  瑚
                </span>
                <span className="text-base font-semibold tracking-tight">瑚琏 Flow Studio</span>
              </span>
            }
            subtitle="登录开始你的 AI 创作工作流"
            onFinish={async () => {
              await new Promise((r) => setTimeout(r, 600));
              router.push("/demos/ai-workflow");
            }}
            footer={
              <div className="flex justify-between text-sm">
                <Link href="#">忘记密码</Link>
                <Link href="#">申请试用</Link>
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
