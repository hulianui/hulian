"use client";

import Link from "next/link";
import {
  LoginForm,
  Card,
  Divider,
  SocialButton,
  Link as UILink,
} from "@hulianui/ui";

// 登录 Block —— 自包含、可整段复制。
// 复用库内 LoginForm（含校验 / 记住我 / 异步提交 loading），底部注入忘记密码链接；
// 表单下方接「或」分隔线 + 第三方登录（GitHub / Google）+ 去注册引导。
// onFinish 用本文件内联 sleep 模拟异步，无外部依赖。

const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

export function LoginBlock() {
  return (
    <section className="flex w-full items-center justify-center px-6 py-16">
      <Card
        variant="elevated"
        className="w-full max-w-md p-8"
      >
        <LoginForm
          logo={
            <span className="inline-flex items-center gap-2">
              <span className="grid size-7 place-items-center rounded-lg bg-primary text-sm font-bold text-primary-foreground">
                瀚
              </span>
              <span className="text-base font-semibold tracking-tight">瀚云控制台</span>
            </span>
          }
          title="欢迎回来"
          subtitle="登录你的瀚云账号，继续管理你的项目"
          onFinish={async () => {
            await sleep(700);
          }}
          footer={
            <div className="flex justify-end text-sm">
              <UILink href="#">忘记密码？</UILink>
            </div>
          }
        />

        <Divider plain className="my-6 text-muted">
          或
        </Divider>

        <div className="grid gap-3">
          <SocialButton provider="github" className="w-full justify-center">
            使用 GitHub 登录
          </SocialButton>
          <SocialButton provider="google" className="w-full justify-center">
            使用 Google 登录
          </SocialButton>
        </div>

        <p className="mt-6 text-center text-sm text-muted">
          还没有账号？{" "}
          <Link
            href="#"
            className="font-medium text-primary underline-offset-4 hover:underline"
          >
            去注册
          </Link>
        </p>
      </Card>
    </section>
  );
}
