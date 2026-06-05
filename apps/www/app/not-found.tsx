import Link from "next/link";
import { ArrowLeft, Home } from "lucide-react";
import { Button, DotPattern, Result } from "@hulianui/ui";

// 自定义 404 —— Next.js 默认 not-found 没有任何返回入口，进去就出不来。
// dogfood 自家 Result 组件（status="404" 内置放大镜图标 + muted 语义色 + 居中版式），
// 操作槽放两个出口，给一条明确的回家路径。
export default function NotFound() {
  return (
    <main className="relative flex min-h-svh flex-col items-center justify-center overflow-hidden px-6">
      <DotPattern className="-z-10 text-border/70 [mask-image:radial-gradient(420px_circle_at_center,black,transparent)]" />
      <Result
        status="404"
        title="404"
        subTitle="找不到这个页面，它可能已被移动或删除。"
        className="relative z-10"
      >
        <Button render={<Link href="/" />} className="group">
          <Home className="size-4" aria-hidden />
          回到首页
        </Button>
        <Button variant="outline" render={<Link href="/components" />} className="group">
          <ArrowLeft
            className="size-4 transition-transform group-hover:-translate-x-0.5"
            aria-hidden
          />
          浏览组件
        </Button>
      </Result>
    </main>
  );
}
