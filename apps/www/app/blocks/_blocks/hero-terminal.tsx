/** @jsxImportSource ../../../lib/fixture-jsx */
import Link from "next/link";
import { Button, Terminal, Tag, Heading, Text } from "@hulianui/ui";
import { ArrowRight, TerminalSquare } from "lucide-react";

// Hero 变体 · 开发者向 —— 与居中款 hero.tsx 区分：左文右终端，主打「一行命令上线」。
// 左：Tag + 标题(强调命令上线) + 副文案 + CTA；右：Terminal 逐行演示部署命令行输出。
// 响应式：md 以下塌成上下单列。

const LINES = [
  { prompt: "$", text: "npm i -g @hulian/cli", tone: "command" as const },
  { prompt: "$", text: "hulian deploy", tone: "command" as const },
  { text: "✓ 检测到 Next.js 项目", tone: "muted" as const },
  { text: "✓ 构建产物 12.4 MB · 已上传", tone: "muted" as const },
  { text: "✓ 已分发至 28 个边缘节点", tone: "muted" as const },
  { text: "🚀 上线成功：https://my-app.hulian.app", tone: "success" as const },
];

export function HeroTerminalBlock({ ctaHref = "#" }: { ctaHref?: string }) {
  return (
    <section className="relative overflow-hidden border-b border-border bg-bg">
      <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-12 px-6 py-20 md:grid-cols-2 md:gap-10 md:py-28">
        {/* 左：文案 */}
        <div className="flex flex-col items-start gap-6 text-left">
          <Tag variant="soft" tone="brand" size="md" icon={<TerminalSquare className="size-3.5" />}>
            为开发者而生
          </Tag>

          <Heading
            level={1}
            weight="bold"
            balance
            className="text-4xl leading-tight text-foreground sm:text-5xl"
          >
            一行命令，
            <br className="hidden sm:block" />
            把应用送上全球边缘
          </Heading>

          <Text tone="muted" size="lg" className="max-w-md">
            零配置、零运维。瀚云 CLI 自动识别框架、构建并分发到全球节点，部署快到只需一杯咖啡的间隙。
          </Text>

          <div className="mt-2 flex flex-wrap items-center gap-3">
            <Button size="lg" render={<Link href={ctaHref} />}>
              安装 CLI
              <ArrowRight className="ml-2 size-4" aria-hidden />
            </Button>
            <Button variant="outline" size="lg" render={<Link href="#docs" />}>
              阅读文档
            </Button>
          </div>

          <Text tone="muted" size="sm">
            支持 Next.js · Vite · Astro · 任意静态/SSR 框架
          </Text>
        </div>

        {/* 右：终端演示 */}
        <div className="md:justify-self-end">
          <Terminal title="bash — hulian deploy" lines={LINES} className="max-w-full shadow-xl md:max-w-lg" />
        </div>
      </div>
    </section>
  );
}
