import Link from "next/link";
import { ArrowLeft, Home } from "lucide-react";
import { Button, DotPattern, Result } from "@hulianui/ui";
import { DOCS_LOCALE } from "../lib/docs-locale";
import { HulianMascot } from "../components/hulian-mascot";
import { notFoundContent } from "./not-found.content";

// 自定义 404 —— Next.js 默认 not-found 没有任何返回入口，进去就出不来。
// dogfood 自家 Result 组件（muted 语义色 + 居中版式），操作槽放两个出口，给一条明确的回家路径。
//
// 器灵的 sleep 态顶掉 status="404" 内置的放大镜（icon={null} 关掉它）：放大镜说的是「我在找」，
// 而 404 的事实是「这儿没有」。打盹的器把「这条路走到头了」讲清楚，也顺手把品牌带到了
// 用户最容易迷路的那一屏。
//
// 刻意不走 Result 的 icon 槽：那个槽写死了 `[&_svg]:size-16`（64px），从外面覆盖要靠
// 同等特异度的选择器抢源码顺序，赌的是 Tailwind 的产出次序。器灵单独放在上方，尺寸自己说了算。
export default function NotFound() {
  const content = notFoundContent[DOCS_LOCALE];
  return (
    <main className="relative flex min-h-svh flex-col items-center justify-center overflow-hidden px-6">
      <DotPattern className="-z-10 text-border/70 [mask-image:radial-gradient(420px_circle_at_center,black,transparent)]" />
      <span className="relative z-10 mb-2 block size-28 text-primary">
        <HulianMascot mood="sleep" tight title={content.mascotAlt} />
      </span>
      <Result
        status="404"
        icon={null}
        title="404"
        subTitle={content.description}
        className="relative z-10"
      >
        <Button render={<Link href="/" />} className="group">
          <Home className="size-4" aria-hidden />
          {content.home}
        </Button>
        <Button variant="outline" render={<Link href="/components" />} className="group">
          <ArrowLeft
            className="size-4 transition-transform group-hover:-translate-x-0.5"
            aria-hidden
          />
          {content.components}
        </Button>
      </Result>
    </main>
  );
}
