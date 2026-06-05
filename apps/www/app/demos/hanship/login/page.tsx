"use client";
import { useRouter } from "next/navigation";
import { Rocket, GitBranch, Globe } from "lucide-react";
import { Heading, Link, LoginForm, DotPattern, Text } from "@hulianui/ui";

const FEATURES = [
  { icon: GitBranch, title: "连 Git 即自动部署", desc: "推送到生产分支自动构建，每个 PR 一个独立预览域名" },
  { icon: Rocket, title: "构建即可观测", desc: "实时构建日志、分步耗时、一键回滚到任意历史版本" },
  { icon: Globe, title: "边缘网络 + 免费 TLS", desc: "全球 310 节点分发，自定义域名自动签发并续期证书" },
];

export default function HanShipLoginPage() {
  const router = useRouter();

  return (
    <main className="flex h-dvh bg-bg">
      <aside className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-neutral-950 p-12 text-white lg:flex">
        <DotPattern className="absolute inset-0 text-white/10" />
        <div className="relative z-10 flex items-center gap-2">
          <span className="grid size-8 place-items-center rounded-[var(--radius)] bg-primary text-sm font-bold text-primary-foreground">
            舰
          </span>
          <span className="text-base font-semibold tracking-tight">瀚舰 HanShip</span>
        </div>

        <div className="relative z-10 max-w-md">
          <Heading level={1} size="3xl" balance className="text-white">
            从 git push
            <br />
            到全球上线
          </Heading>
          <Text className="mt-4 text-white/70">
            连接仓库、自动构建、预览部署、边缘分发 —— 把每一次提交都变成一个可回滚的线上版本。
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
          © 2026 瀚舰 HanShip · 内置示例
        </Text>
      </aside>

      <div className="flex flex-1 items-center justify-center p-6">
        <div className="flex w-full max-w-md flex-col gap-3">
          <LoginForm
            logo={
              <span className="inline-flex items-center gap-2">
                <span className="grid size-7 place-items-center rounded-[var(--radius)] bg-primary text-sm font-bold text-primary-foreground">
                  舰
                </span>
                <span className="text-base font-semibold tracking-tight">瀚舰 HanShip</span>
              </span>
            }
            subtitle="登录部署控制台"
            onFinish={async () => {
              await new Promise((r) => setTimeout(r, 600));
              router.push("/demos/hanship");
            }}
            footer={
              <div className="flex justify-between text-sm">
                <Link href="#">忘记密码</Link>
                <Link href="#">用 GitHub 登录</Link>
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
