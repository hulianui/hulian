/** @jsxImportSource ../../../lib/fixture-jsx */
"use client";

import { useState } from "react";
import Link from "next/link";
import { SocialButton, Input, Button, Heading, Text, Divider } from "@hulianui/ui";
import { Cloud, Globe, ArrowRight } from "lucide-react";

// 营销页脚区块 —— 自包含、可整段复制。深色克制风。
// 顶部：品牌列（Logo + 简介 + 社交）+ 4 列链接 / 中部：newsletter 订阅 / 底部：版权 + 语言 + 备案。
// 复制后改：columns 链接、邮件提交逻辑、icp 备案号。

const columns = [
  {
    title: "产品",
    links: ["弹性部署", "边缘网络", "可观测", "算力市场", "对象存储"],
  },
  {
    title: "资源",
    links: ["文档中心", "组件库", "更新日志", "状态页", "API 参考"],
  },
  {
    title: "公司",
    links: ["关于我们", "招贤纳士", "客户案例", "合作伙伴", "联系销售"],
  },
  {
    title: "法律",
    links: ["服务条款", "隐私政策", "SLA 协议", "安全合规"],
  },
];

export function FooterBlock() {
  const [email, setEmail] = useState("");

  return (
    <footer className="border-t border-border bg-surface/40 text-foreground">
      <div className="mx-auto w-full max-w-7xl px-6 py-16">
        {/* 顶部：品牌 + 链接列 */}
        <div className="grid grid-cols-2 gap-10 md:grid-cols-6">
          {/* 品牌列 */}
          <div className="col-span-2">
            <Link href="#" className="flex items-center gap-2 text-foreground">
              <span className="flex size-7 items-center justify-center rounded-[min(var(--radius),0.5rem)] bg-primary text-primary-foreground">
                <Cloud className="size-4" aria-hidden />
              </span>
              <span className="text-base font-semibold">瀚云</span>
            </Link>
            <Text tone="muted" size="sm" className="mt-4 max-w-xs">
              从 git push 到全球上线，把部署、弹性算力与端到端可观测收进同一个平台。
            </Text>
            <div className="mt-5 flex items-center gap-2">
              <SocialButton provider="github" shape="icon" variant="outline" aria-label="GitHub" />
              <SocialButton provider="x" shape="icon" variant="outline" aria-label="X" />
              <SocialButton provider="weibo" shape="icon" variant="outline" aria-label="微博" />
              <SocialButton provider="wechat" shape="icon" variant="outline" aria-label="微信" />
            </div>
          </div>

          {/* 链接列 */}
          {columns.map((col) => (
            <div key={col.title}>
              <Text size="sm" weight="medium" className="text-foreground">
                {col.title}
              </Text>
              <ul className="mt-4 flex flex-col gap-3">
                {col.links.map((label) => (
                  <li key={label}>
                    <Link
                      href="#"
                      className="text-sm text-muted transition-colors hover:text-foreground"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* 中部：newsletter 订阅 */}
        <Divider className="my-10" />
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Heading level={3} size="lg" weight="semibold" className="text-foreground">
              订阅产品月报
            </Heading>
            <Text tone="muted" size="sm" className="mt-1">
              每月一封，了解新特性、最佳实践与平台动态。绝不打扰。
            </Text>
          </div>
          <form
            className="flex w-full max-w-sm items-center gap-2"
            onSubmit={(e) => e.preventDefault()}
          >
            <Input
              type="email"
              placeholder="you@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              aria-label="邮箱地址"
            />
            <Button type="submit" className="shrink-0">
              订阅
              <ArrowRight className="size-4" aria-hidden />
            </Button>
          </form>
        </div>

        {/* 底部：版权 + 语言 + 备案 */}
        <Divider className="my-10" />
        <div className="flex flex-col gap-4 text-sm text-muted sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 瀚云科技 · 保留所有权利</p>
          <div className="flex flex-wrap items-center gap-4">
            <Link
              href="#"
              className="flex items-center gap-1.5 text-muted transition-colors hover:text-foreground"
            >
              <Globe className="size-4" aria-hidden />
              简体中文
            </Link>
            <Link
              href="#"
              className="text-muted transition-colors hover:text-foreground"
            >
              粤ICP备 2026000000 号
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
