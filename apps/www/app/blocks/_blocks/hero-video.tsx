import Link from "next/link";
import { Button, HeroVideoDialog, Tag, Heading, Text } from "@hulianui/ui";
import { ArrowRight, PlayCircle } from "lucide-react";

// Hero 变体 · 居中 + 视频演示 —— 与居中渐变款 hero.tsx 区分：以产品 demo 视频为视觉主体。
// 居中标题 + 副文案 + 主 CTA，下方 HeroVideoDialog 点击播放产品演示（缩略图用内联渐变 SVG 占位，视频源为内联占位页）。

// 内联渐变缩略图（data-URI，无远程资源）。
const THUMB =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' width='1280' height='720'>
      <defs>
        <linearGradient id='g' x1='0' y1='0' x2='1' y2='1'>
          <stop offset='0%' stop-color='#6366f1'/>
          <stop offset='55%' stop-color='#0ea5e9'/>
          <stop offset='100%' stop-color='#0f172a'/>
        </linearGradient>
      </defs>
      <rect width='1280' height='720' fill='url(#g)'/>
      <rect x='0' y='0' width='1280' height='720' fill='black' opacity='0.12'/>
    </svg>`,
  );

// 内联占位视频页（避免任何外部请求）。
const VIDEO_SRC =
  "data:text/html;charset=utf-8," +
  encodeURIComponent(
    `<body style="margin:0;display:flex;align-items:center;justify-content:center;height:100vh;background:#0f172a;color:#e2e8f0;font-family:system-ui">演示视频占位</body>`,
  );

export function HeroVideoBlock({ ctaHref = "#" }: { ctaHref?: string }) {
  return (
    <section className="relative overflow-hidden border-b border-border bg-bg">
      <div className="mx-auto flex max-w-4xl flex-col items-center gap-6 px-6 py-20 text-center md:py-28">
        <Tag variant="soft" tone="brand" size="md" icon={<PlayCircle className="size-3.5" />}>
          3 分钟看懂瀚云
        </Tag>

        <Heading
          level={1}
          weight="bold"
          balance
          className="text-4xl leading-tight text-foreground sm:text-5xl md:text-6xl"
        >
          看看部署可以有多简单
        </Heading>

        <Text tone="muted" size="lg" className="max-w-2xl">
          从连接仓库到全球上线，一段演示带你走完瀚云的完整部署流程，无需配置、无需运维。
        </Text>

        <div className="mt-2">
          <Button size="lg" render={<Link href={ctaHref} />}>
            免费开始
            <ArrowRight className="ml-2 size-4" aria-hidden />
          </Button>
        </div>

        <HeroVideoDialog
          thumbnailSrc={THUMB}
          thumbnailAlt="瀚云产品演示视频缩略图"
          videoSrc={VIDEO_SRC}
          className="mt-6 aspect-video w-full max-w-3xl shadow-xl"
        />
      </div>
    </section>
  );
}
