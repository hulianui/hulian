"use client";
import { useRouter } from "next/navigation";
import { BarChart3, ShieldCheck, Workflow } from "lucide-react";
import { Heading, Link, LoginForm, Spotlight, Text } from "@hulianui/ui";

const FEATURES = [
  { icon: Workflow, title: "全流程客户管理", desc: "线索 → 商机 → 成交，跟进有迹可循" },
  { icon: BarChart3, title: "实时业绩看板", desc: "成交趋势、商机漏斗一屏掌握" },
  { icon: ShieldCheck, title: "数据安全可控", desc: "字段级权限与操作审计" },
];

export default function CrmLoginPage() {
  const router = useRouter();

  return (
    <main className="flex h-dvh bg-bg">
      {/* 左：品牌面板 */}
      <aside className="relative hidden w-1/2 flex-col justify-between overflow-hidden p-12 lg:flex">
        <Spotlight x="30%" intensity={14} />
        <div className="relative z-10 flex items-center gap-2">
          <span className="grid size-8 place-items-center rounded-[var(--radius)] bg-primary text-sm font-bold text-primary-foreground">
            瑚
          </span>
          <span className="text-base font-semibold tracking-tight">瑚琏 CRM</span>
        </div>

        <div className="relative z-10 max-w-md">
          <Heading level={1} size="3xl" balance>
            让每一次客户跟进
            <br />
            都有迹可循
          </Heading>
          <Text tone="muted" className="mt-4">
            从线索接入到回款成交的全流程销售管理，团队协作、业绩透明、决策有据。
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

        <Text size="sm" tone="muted" className="relative z-10">
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
                <span className="text-base font-semibold tracking-tight">瑚琏 CRM</span>
              </span>
            }
            subtitle="欢迎回来，登录你的销售管理后台"
            onFinish={async () => {
              await new Promise((r) => setTimeout(r, 600));
              router.push("/demos/crm");
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
