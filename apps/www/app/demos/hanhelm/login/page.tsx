"use client";
import { useRouter } from "next/navigation";
import { Share2, Boxes, ShieldCheck } from "lucide-react";
import { Heading, Link, LoginForm, GridPattern, Text } from "@hulianui/ui";

const FEATURES = [
  { icon: Share2, title: "六维智能路由", desc: "按能力 + 成本 + 延迟 + 负载 + 优先级 + SLA 打分，把任务派给最优执行器" },
  { icon: Boxes, title: "多 agent 编排 + 降级", desc: "复杂任务分解为子任务 DAG，执行器失败自动 failover 到降级链" },
  { icon: ShieldCheck, title: "全链路 SLA 可观测", desc: "队列深度、负载、P50/P95 延迟、逐任务成本，每一次调度都算得清" },
];

export default function HanHelmLoginPage() {
  const router = useRouter();

  return (
    <main className="flex h-dvh bg-bg">
      <aside className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-neutral-950 p-12 text-white lg:flex">
        <GridPattern className="absolute inset-0 text-white/10" />
        <div className="relative z-10 flex items-center gap-2">
          <span className="grid size-8 place-items-center rounded-[var(--radius)] bg-primary text-sm font-bold text-primary-foreground">
            舵
          </span>
          <span className="text-base font-semibold tracking-tight">瀚舵 HanHelm</span>
        </div>

        <div className="relative z-10 max-w-md">
          <Heading level={1} size="3xl" balance className="text-white">
            智能体
            <br />
            任务调度平台
          </Heading>
          <Text className="mt-4 text-white/70">
            异构 AI 任务涌入任务总线，智能路由按六维打分派给 agent/模型池，多 agent 编排 + 降级 failover + 全链路可观测。
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
          © 2026 瀚舵 HanHelm · 内置示例
        </Text>
      </aside>

      <div className="flex flex-1 items-center justify-center p-6">
        <div className="flex w-full max-w-md flex-col gap-3">
          <LoginForm
            logo={
              <span className="inline-flex items-center gap-2">
                <span className="grid size-7 place-items-center rounded-[var(--radius)] bg-primary text-sm font-bold text-primary-foreground">
                  舵
                </span>
                <span className="text-base font-semibold tracking-tight">瀚舵 HanHelm</span>
              </span>
            }
            subtitle="登录调度控制台"
            onFinish={async () => {
              await new Promise((r) => setTimeout(r, 600));
              router.push("/demos/hanhelm");
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
