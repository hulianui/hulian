/** @jsxImportSource ../../../lib/fixture-jsx */
"use client";

import Link from "next/link";
import {
  LoginForm,
  Divider,
  SocialButton,
  Link as UILink,
} from "@hulianui/ui";

// 登录 Block —— 自包含、可整段复制。
// 复用库内 LoginForm（含校验 / 记住我 / 异步提交 loading）；忘记密码链接、「或」分隔线、
// 第三方登录与去注册引导全部走 LoginForm 的 footer 槽，落在**同一张卡**里。
//
// 注意：LoginForm 根节点自带完整卡片外观（边框 + 表面 + 阴影 + p-8），
// 所以外面**不要**再套 Card —— 那会渲染成白框套白框（两条边框、两层阴影、内外两份 p-8），
// 照抄这个 block 的项目会原样继承（hulianui/hulian#65）。
// onFinish 用本文件内联 sleep 模拟异步，无外部依赖。

const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

export function LoginBlock() {
  return (
    <section className="flex w-full items-center justify-center px-6 py-16">
      <div className="w-full max-w-md">
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
            <div className="flex flex-col gap-0">
              <div className="flex justify-end text-sm">
                <UILink href="#">忘记密码？</UILink>
              </div>

              <Divider plain className="my-6 text-muted-foreground">
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

              <p className="mt-6 text-center text-sm text-muted-foreground">
                还没有账号？{" "}
                <Link
                  href="#"
                  className="font-medium text-primary underline-offset-4 hover:underline"
                >
                  去注册
                </Link>
              </p>
            </div>
          }
        />
      </div>
    </section>
  );
}
