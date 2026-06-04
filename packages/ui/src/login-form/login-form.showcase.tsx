"use client";
import { useState } from "react";
import { Link } from "../link";
import type { ShowcaseSpec } from "../showcase/types";
import { LoginForm } from "./login-form";

function Demo() {
  const [user, setUser] = useState<string | null>(null);
  return (
    <div className="flex w-full justify-center rounded-[var(--radius)] bg-surface-hover/30 p-8">
      <div className="flex flex-col items-stretch gap-3">
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
