"use client";
import { useState } from "react";
import { Link } from "../link";
import type { ShowcaseSpec } from "../showcase/types";
import { LoginForm } from "./login-form";

function Demo() {
  const [user, setUser] = useState<string | null>(null);
  return (
    <div
      className="flex min-h-[560px] w-full items-center justify-center rounded-[var(--radius)] border border-border p-6"
      // 有意图的登录页背景：primary 微染径向辉光自顶部渐隐到 bg（token 驱动·自动适配明暗）
      style={{
        background:
          "radial-gradient(125% 125% at 50% 0%, color-mix(in oklab, var(--color-primary) 8%, var(--color-bg)) 0%, var(--color-bg) 60%)",
      }}
    >
      <div className="flex w-full max-w-md flex-col items-stretch gap-3">
        <LoginForm
          logo={
            <span className="inline-flex items-center gap-2">
              <span className="grid size-7 place-items-center rounded-lg bg-primary text-sm font-bold text-primary-foreground">瑚</span>
              <span className="text-base font-semibold tracking-tight">瑚琏 Admin</span>
            </span>
          }
          subtitle="欢迎回来，请登录你的管理后台"
          onFinish={async (v) => {
            await new Promise((r) => setTimeout(r, 700));
            setUser(`${v.username}${v.remember ? "（已记住）" : ""}`);
          }}
          footer={
            <div className="flex justify-between text-sm">
              <Link href="#">忘记密码</Link>
              <Link href="#">注册账号</Link>
            </div>
          }
        />
        {user && (
          <p className="text-center text-sm text-muted" role="status">
            登录中：{user}
          </p>
        )}
      </div>
    </div>
  );
}

export const loginFormShowcase: ShowcaseSpec = {
  examples: [
    {
      title: "基础用法",
      description: "自管 useForm：账号/密码必填 + 记住我 + 异步提交 loading。",
      code: `<LoginForm
  onFinish={async ({ username, password, remember }) => {
    await api.login(username, password, remember);
  }}
/>`,
      render: () => (
        <div className="w-full max-w-md">
          <LoginForm
            onFinish={async () => {
              await new Promise((r) => setTimeout(r, 700));
            }}
          />
        </div>
      ),
    },
    {
      title: "品牌 logo + 副标题",
      description: "logo 落头部左上作品牌标，subtitle 作引导文案。",
      code: `<LoginForm
  logo={<Logo />}
  subtitle="欢迎回来，请登录你的管理后台"
  onFinish={({ username }) => console.log(username)}
/>`,
      render: () => (
        <div className="w-full max-w-md">
          <LoginForm
            logo={
              <span className="inline-flex items-center gap-2">
                <span className="grid size-7 place-items-center rounded-lg bg-primary text-sm font-bold text-primary-foreground">
                  瑚
                </span>
                <span className="text-base font-semibold tracking-tight">瑚琏 Admin</span>
              </span>
            }
            subtitle="欢迎回来，请登录你的管理后台"
            onFinish={() => {}}
          />
        </div>
      ),
    },
    {
      title: "底部链接区",
      description: "footer 放忘记密码 / 注册等附加操作，带顶部分隔线。",
      code: `<LoginForm
  footer={
    <div className="flex justify-between text-sm">
      <Link href="/forgot">忘记密码</Link>
      <Link href="/register">注册账号</Link>
    </div>
  }
  onFinish={() => {}}
/>`,
      render: () => (
        <div className="w-full max-w-md">
          <LoginForm
            footer={
              <div className="flex justify-between text-sm">
                <Link href="#">忘记密码</Link>
                <Link href="#">注册账号</Link>
              </div>
            }
            onFinish={() => {}}
          />
        </div>
      ),
    },
    {
      title: "隐藏记住我",
      description: "showRemember={false} 去掉「记住我」勾选（如不支持持久会话的场景）。",
      code: `<LoginForm showRemember={false} onFinish={() => {}} />`,
      render: () => (
        <div className="w-full max-w-md">
          <LoginForm showRemember={false} onFinish={() => {}} />
        </div>
      ),
    },
  ],
  controls: [],
  states: [{ name: "登录模板 · 校验 + 记住我 + 异步提交", render: () => <Demo /> }],
  renderWithProps: () => <Demo />,
  toCode: () =>
    `<LoginForm
  logo={<Logo />}
  onFinish={async ({ username, password, remember }) => {
    await api.login(username, password, remember);
  }}
  footer={<Link href="/forgot">忘记密码</Link>}
/>`,
};
