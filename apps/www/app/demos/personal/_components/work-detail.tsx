"use client";

import Link from "next/link";
import {
  Skeleton,
  Empty,
  Tag,
  Chip,
  Button,
  Carousel,
  Lens,
  HeroVideoDialog,
  Snippet,
  NumberTicker,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  Silk,
  Iridescence,
  WavyBackground,
  Threads,
  LiquidChrome,
  Chrome,
  IPhone,
  Tablet,
  Watch,
  Terminal,
  type TagTone,
  type TerminalLine,
  cn,
} from "@hulianui/ui";
import { ArrowLeft, ArrowRight, ExternalLink, Code2 } from "lucide-react";
import { useMockData } from "../../lib/async";
import { workBySlug, workNav, type Work } from "../_data/works";
import { workShot } from "../_lib/art";

const BASE = "/demos/personal";

// ---------------------------------------------------------------------------
// 状态 → Tag tone 映射（与 work section 保持一致）
// ---------------------------------------------------------------------------
const STATUS_TONE: Record<Work["status"], TagTone> = {
  在线: "success",
  开源: "brand",
  Beta: "warning",
  已下架: "neutral",
};

// ---------------------------------------------------------------------------
// Hero 背景
// ---------------------------------------------------------------------------
function HeroBg({ bg, hue }: { bg: Work["bg"]; hue: number }) {
  // 把 hue 转成大致的 oklch/hsl 色，让背景贴近作品主色
  const hslColor = `hsl(${hue} 70% 55%)`;

  switch (bg) {
    case "silk":
      return (
        <Silk
          speed={3}
          scale={1.1}
          color={hslColor}
          noiseIntensity={1.2}
          className="absolute inset-0 -z-10"
        />
      );
    case "iridescence":
      return (
        <Iridescence
          speed={0.6}
          amplitude={0.12}
          className="absolute inset-0 -z-10"
        />
      );
    case "wavy":
      return (
        <WavyBackground
          colors={[
            `hsl(${hue} 70% 55%)`,
            `hsl(${(hue + 30) % 360} 65% 50%)`,
            `hsl(${(hue + 60) % 360} 60% 45%)`,
            `hsl(${(hue + 90) % 360} 65% 50%)`,
            `hsl(${hue} 70% 55%)`,
          ]}
          speed="slow"
          blur={8}
          containerClassName="absolute inset-0 -z-10 h-full w-full"
          className="pointer-events-none"
        />
      );
    case "threads":
      return (
        <Threads
          color={hslColor}
          amplitude={1.2}
          distance={0.2}
          className="absolute inset-0 -z-10"
        />
      );
    case "liquid-chrome":
      return (
        <LiquidChrome
          speed={0.2}
          amplitude={0.55}
          interactive={false}
          className="absolute inset-0 -z-10"
        />
      );
    default:
      return null;
  }
}

// ---------------------------------------------------------------------------
// 设备外壳展示
// ---------------------------------------------------------------------------
function DeviceMockup({ work }: { work: Work }) {
  const shot = work.shots[0];
  const imageSrc = workShot(shot, work.hue);

  switch (work.device) {
    case "chrome":
      return (
        <Chrome url={`linyu.dev/${work.slug}`} title={work.nameEn} style={{ width: 560, maxWidth: "100%" }}>
          <img
            src={imageSrc}
            alt={shot.caption}
            className="block w-full"
            style={{ aspectRatio: "16/10", objectFit: "cover" }}
          />
        </Chrome>
      );
    case "iphone":
      return (
        <IPhone model="15-pro">
          <img
            src={imageSrc}
            alt={shot.caption}
            className="block h-full w-full object-cover"
          />
        </IPhone>
      );
    case "tablet":
      return (
        <Tablet model="ipad-pro-11">
          <img
            src={imageSrc}
            alt={shot.caption}
            className="block h-full w-full object-cover"
          />
        </Tablet>
      );
    case "watch":
      return (
        <Watch model="series-45">
          <img
            src={imageSrc}
            alt={shot.caption}
            className="block h-full w-full object-cover"
          />
        </Watch>
      );
    case "terminal": {
      // 从 install/codeSample 拼几行命令
      const lines: TerminalLine[] = [];
      if (work.install) {
        lines.push({ prompt: "$", text: work.install, tone: "command" });
        lines.push({ text: "Resolving dependencies…", tone: "muted" });
        lines.push({ text: "Done in 1.23s", tone: "success" });
      }
      if (work.codeSample) {
        lines.push({ prompt: "$", text: `${work.slug} run`, tone: "command" });
        lines.push({ text: `Running ${work.codeSample.title}…`, tone: "muted" });
        lines.push({ text: "All tasks completed successfully", tone: "success" });
      }
      if (lines.length === 0) {
        lines.push({ prompt: "$", text: `${work.slug} --help`, tone: "command" });
        lines.push({ text: "Usage: " + work.slug + " [options]", tone: "muted" });
        lines.push({ text: "Ready.", tone: "success" });
      }
      return (
        <Terminal
          lines={lines}
          title={work.nameEn}
          lineDelay={0.18}
          className="w-full max-w-2xl"
        />
      );
    }
    default:
      return null;
  }
}

// ---------------------------------------------------------------------------
// 加载骨架（chromeless）
// ---------------------------------------------------------------------------
function WorkDetailSkeleton() {
  return (
    <div className="space-y-10 py-10">
      {/* hero 占位 */}
      <Skeleton shape="rect" className="h-72 w-full rounded-none" />
      <div className="mx-auto max-w-5xl space-y-8 px-6">
        {/* 设备外壳占位 */}
        <div className="flex justify-center">
          <Skeleton shape="rect" className="h-60 w-96" />
        </div>
        {/* 摘要 */}
        <div className="space-y-3">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>
        {/* 指标 */}
        <div className="flex gap-8">
          {[0, 1, 2].map((i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-6 w-16" />
              <Skeleton className="h-3 w-12" />
            </div>
          ))}
        </div>
        {/* 截图轮播 */}
        <Skeleton shape="rect" className="h-52 w-full" />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// 指标数字（纯数字 → NumberTicker，含文字 → 直接展示）
// ---------------------------------------------------------------------------
function MetricValue({ value }: { value: string }) {
  const num = parseFloat(value.replace(/[^0-9.]/g, ""));
  const isPureNumber = /^\d+$/.test(value.trim());
  if (isPureNumber && !isNaN(num)) {
    return (
      <NumberTicker
        value={num}
        className="text-3xl font-bold tabular-nums text-foreground"
      />
    );
  }
  return <span className="text-3xl font-bold text-foreground">{value}</span>;
}

// ---------------------------------------------------------------------------
// 主体
// ---------------------------------------------------------------------------
function WorkDetailContent({ work }: { work: Work }) {
  const nav = workNav(work.slug);

  return (
    <article>
      {/* ---- HERO ---- */}
      <section
        className="relative overflow-hidden"
        style={{ background: "oklch(0.10 0.02 265)" }}
      >
        {/* 炫背景：absolute inset-0，在内容下层 */}
        <HeroBg bg={work.bg} hue={work.hue} />

        {/* 顶部渐变遮罩，让文字更易读 */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 z-0 bg-gradient-to-b from-black/60 via-black/30 to-black/70"
        />

        <div className="relative z-10 mx-auto max-w-5xl px-6 pb-16 pt-10">
          {/* 返回 */}
          <Link
            href={`${BASE}#work`}
            className="mb-8 inline-flex items-center gap-1.5 text-sm text-white/60 transition-colors hover:text-white"
          >
            <ArrowLeft className="size-4" aria-hidden />
            所有作品
          </Link>

          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            {/* 左侧信息 */}
            <div className="space-y-4">
              {/* 品类 + 年份 */}
              <div className="flex flex-wrap items-center gap-2">
                <Tag variant="outline" tone="neutral" className="border-white/30 text-white/70">
                  {work.category}
                </Tag>
                <span className="font-mono text-xs text-white/40">{work.year}</span>
              </div>

              {/* 名称 */}
              <div>
                <span
                  className="block font-mono text-xs uppercase tracking-[0.2em] mb-1"
                  style={{ color: `hsl(${work.hue} 70% 70%)` }}
                >
                  {work.nameEn}
                </span>
                <h1 className="text-4xl font-bold tracking-tight text-white md:text-5xl">
                  {work.name}
                </h1>
                <p className="mt-3 max-w-xl text-lg leading-relaxed text-white/70">
                  {work.tagline}
                </p>
              </div>

              {/* 状态 */}
              <Tag
                variant="soft"
                tone={STATUS_TONE[work.status]}
                dot
                pulse={work.status === "在线"}
              >
                {work.status}
              </Tag>
            </div>

            {/* 右侧：技术栈 + 链接 */}
            <div className="space-y-4">
              {/* 技术栈 Chip */}
              <div className="flex flex-wrap gap-2">
                {work.stack.map((tech) => (
                  <Chip key={tech} variant="outline" tone="neutral" className="border-white/20 text-white/60">
                    {tech}
                  </Chip>
                ))}
              </div>

              {/* 外链按钮 */}
              <div className="flex flex-wrap gap-2">
                {work.links.map((link, i) => (
                  <Tooltip key={link.label}>
                    <TooltipTrigger
                      render={
                        <Button
                          variant={i === 0 ? "solid" : "outline"}
                          size="sm"
                          render={
                            <a
                              href={link.href}
                              target="_blank"
                              rel="noopener noreferrer"
                            />
                          }
                        >
                          {link.label}
                          <ExternalLink className="size-3.5" aria-hidden />
                        </Button>
                      }
                    />
                    <TooltipContent>{link.label}</TooltipContent>
                  </Tooltip>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ---- 内容区 ---- */}
      <div className="mx-auto max-w-5xl space-y-16 px-6 py-16">

        {/* 设备外壳 */}
        <section aria-label="产品预览" className="flex justify-center">
          <DeviceMockup work={work} />
        </section>

        {/* 概述 */}
        <section aria-labelledby="summary-heading">
          <h2
            id="summary-heading"
            className="mb-4 font-mono text-xs uppercase tracking-widest text-muted"
          >
            产品故事
          </h2>
          <div className="space-y-4">
            {work.summary.map((para, i) => (
              <p key={i} className="text-lg leading-relaxed text-foreground/80">
                {para}
              </p>
            ))}
          </div>
        </section>

        {/* 关键指标 */}
        <section aria-labelledby="metrics-heading">
          <h2
            id="metrics-heading"
            className="mb-6 font-mono text-xs uppercase tracking-widest text-muted"
          >
            关键指标
          </h2>
          <div className="flex flex-wrap gap-10">
            {work.metrics.map((m) => (
              <div key={m.label} className="space-y-1">
                <MetricValue value={m.value} />
                <p className="text-sm text-muted">{m.label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 轮播 + Lens 放大 */}
        <section aria-labelledby="shots-heading">
          <h2
            id="shots-heading"
            className="mb-6 font-mono text-xs uppercase tracking-widest text-muted"
          >
            截图
          </h2>
          <Carousel
            autoplay
            loop
            aria-label={`${work.name} 截图`}
            className="w-full overflow-hidden rounded-[var(--radius)] border border-border"
          >
            {work.shots.map((shot, i) => (
              <div key={i} className="relative">
                <Lens zoom={2} className="w-full">
                  <img
                    src={workShot(shot, work.hue)}
                    alt={shot.caption}
                    className="block w-full"
                    style={{ aspectRatio: "16/10", objectFit: "cover" }}
                  />
                </Lens>
                <span className="absolute bottom-3 left-4 rounded-full bg-black/50 px-3 py-1 text-xs text-white/80 backdrop-blur-sm">
                  {shot.caption}
                </span>
              </div>
            ))}
          </Carousel>
        </section>

        {/* 演示视频 */}
        <section aria-labelledby="video-heading">
          <h2
            id="video-heading"
            className="mb-6 font-mono text-xs uppercase tracking-widest text-muted"
          >
            演示视频
          </h2>
          <HeroVideoDialog
            thumbnailSrc={workShot(work.shots[0], work.hue)}
            thumbnailAlt={`${work.name} 演示预览`}
            videoSrc="/demo/sample-video.mp4"
            className="w-full max-w-2xl"
          />
        </section>

        {/* 亮点功能 */}
        <section aria-labelledby="highlights-heading">
          <h2
            id="highlights-heading"
            className="mb-6 font-mono text-xs uppercase tracking-widest text-muted"
          >
            核心功能
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {work.highlights.map((h) => (
              <div
                key={h.title}
                className={cn(
                  "rounded-[var(--radius)] border border-border bg-surface/60 p-5",
                  "transition-all duration-200 hover:border-border/80 hover:bg-surface",
                )}
              >
                <div className="mb-2 flex items-center gap-2">
                  <span
                    className="flex size-7 items-center justify-center rounded-md"
                    style={{ background: `hsl(${work.hue} 70% 55% / 0.15)` }}
                    aria-hidden
                  >
                    <Code2
                      className="size-4"
                      style={{ color: `hsl(${work.hue} 70% 60%)` }}
                    />
                  </span>
                  <h3 className="font-semibold text-foreground">{h.title}</h3>
                </div>
                <p className="text-sm leading-relaxed text-muted">{h.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 安装命令 */}
        {work.install && (
          <section aria-labelledby="install-heading">
            <h2
              id="install-heading"
              className="mb-4 font-mono text-xs uppercase tracking-widest text-muted"
            >
              快速安装
            </h2>
            <Snippet>{work.install}</Snippet>
          </section>
        )}

        {/* 关键代码 */}
        {work.codeSample && (
          <section aria-labelledby="code-heading">
            <h2
              id="code-heading"
              className="mb-4 font-mono text-xs uppercase tracking-widest text-muted"
            >
              {work.codeSample.title}
            </h2>
            <pre
              className={cn(
                "overflow-x-auto rounded-[var(--radius)] border border-border bg-surface p-5",
                "text-sm leading-relaxed text-foreground/85",
                "font-mono",
              )}
            >
              <code>{work.codeSample.code}</code>
            </pre>
          </section>
        )}

        {/* 上/下一篇 */}
        {nav && (
          <nav aria-label="作品导航" className="border-t border-border pt-10">
            <div className="grid grid-cols-2 gap-4">
              {/* 上一篇 */}
              <Link
                href={`${BASE}/work/${nav.prev.slug}`}
                className={cn(
                  "group flex flex-col gap-1 rounded-[var(--radius)] border border-border bg-surface/60 p-5",
                  "transition-all duration-200 hover:border-border/80 hover:bg-surface hover:-translate-y-0.5",
                )}
              >
                <span className="flex items-center gap-1 text-xs text-muted">
                  <ArrowLeft className="size-3.5" aria-hidden />
                  上一个
                </span>
                <span
                  className="font-mono text-[10px] uppercase tracking-wider"
                  style={{ color: `hsl(${nav.prev.hue} 65% 58%)` }}
                >
                  {nav.prev.nameEn}
                </span>
                <span className="font-semibold text-foreground group-hover:text-primary transition-colors">
                  {nav.prev.name}
                </span>
              </Link>

              {/* 下一篇 */}
              <Link
                href={`${BASE}/work/${nav.next.slug}`}
                className={cn(
                  "group flex flex-col items-end gap-1 rounded-[var(--radius)] border border-border bg-surface/60 p-5",
                  "transition-all duration-200 hover:border-border/80 hover:bg-surface hover:-translate-y-0.5",
                )}
              >
                <span className="flex items-center gap-1 text-xs text-muted">
                  下一个
                  <ArrowRight className="size-3.5" aria-hidden />
                </span>
                <span
                  className="font-mono text-[10px] uppercase tracking-wider"
                  style={{ color: `hsl(${nav.next.hue} 65% 58%)` }}
                >
                  {nav.next.nameEn}
                </span>
                <span className="font-semibold text-foreground group-hover:text-primary transition-colors">
                  {nav.next.name}
                </span>
              </Link>
            </div>
          </nav>
        )}
      </div>
    </article>
  );
}

// ---------------------------------------------------------------------------
// 导出：带 useMockData 加载态
// ---------------------------------------------------------------------------
export function WorkDetail({ slug }: { slug: string }) {
  const work = workBySlug(slug);
  const { data, loading } = useMockData(work, { delay: 350 });

  if (loading) return <WorkDetailSkeleton />;

  if (!data) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-6">
        <Empty
          title="作品不存在"
          description={`找不到 slug 为 "${slug}" 的作品。`}
        />
      </div>
    );
  }

  return <WorkDetailContent work={data} />;
}
