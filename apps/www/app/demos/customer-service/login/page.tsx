"use client";
import { useRouter } from "next/navigation";
import { MessagesSquare, Headphones, Gauge } from "lucide-react";
import { Heading, Link, LoginForm, Text } from "@hulian/ui";
import { CS_ROOT } from "../_components/nav-config";

const FEATURES = [
  { icon: MessagesSquare, title: "多渠道统一接待", desc: "网页 / App / 微信 / 电话，一个工作台全收口" },
  { icon: Headphones, title: "实时坐席协同", desc: "进线提醒、输入状态、已读回执一目了然" },
  { icon: Gauge, title: "服务质量看板", desc: "首响时长、解决率、CSAT 满意度实时跟踪" },
];

export default function CsLoginPage() {
  const router = useRouter();

  return (
    <main className="flex h-dvh bg-bg">
      {/* 左：品牌面板 */}
      <aside
        className="relative hidden w-1/2 flex-col justify-between overflow-hidden p-12 lg:flex"
        style={{
          background:
            "radial-gradient(125% 125% at 30% 0%, color-mix(in oklab, var(--color-primary) 14%, var(--color-bg)) 0%, var(--color-bg) 55%)",
        }}
      >
        <div className="flex items-center gap-2">
          <span className="grid size-8 place-items-center rounded-[var(--radius)] bg-primary text-sm font-bold text-primary-foreground">
            瑚
          </span>
          <span className="text-base font-semibold tracking-tight">瑚琏客服</span>
        </div>

        <div className="max-w-md">
          <Heading level={1} size="3xl" balance>
            让每一次对话
            <br />
            都被认真对待
          </Heading>
          <Text tone="muted" className="mt-4">
            面向坐席的实时会话工作台，多渠道接待、工单流转、知识沉淀与服务度量一体化。
          </Text>

          <ul className="mt-10 flex flex-col gap-5">
            {FEATURES.map((f) => (
              <li key={f.title} className="flex items-start gap-3">
                <span className="mt-0.5 grid size-9 shrink-0 place-items-center rounded-[var(--radius)] bg-primary/12 text-primary">
                  <f.icon className="size-[18px]" />
                </span>
                <div>
                  <div className="font-medium">{f.title}</div>
                  <Text size="sm" tone="muted">
                    {f.desc}
                  </Text>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <Text size="sm" tone="muted">
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
                <span className="text-base font-semibold tracking-tight">瑚琏客服</span>
              </span>
            }
            subtitle="欢迎回来，登录你的客服工作台"
            onFinish={async () => {
              await new Promise((r) => setTimeout(r, 600));
              router.push(CS_ROOT);
            }}
            footer={
              <div className="flex justify-between text-sm">
                <Link href="#">忘记密码</Link>
                <Link href="#">联系管理员</Link>
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
