"use client";
import { copy } from "./hero.content";

import {
  Aurora,
  SparklesText,
  WordRotate,
  AnimatedGradientText,
  NumberTicker,
  AvatarCircles,
  Button,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  cn,
} from "@hulianui/ui";
import { ArrowDown, MessageCircle, MapPin, Sparkles } from "lucide-react";
import { profile } from "../../_data/profile";
import { works } from "../../_data/works";
import { avatarArt } from "../../_lib/art";
import { SOCIAL_ICON } from "../site-shell";

// 访客头像组：复用作品 hue 生成确定性渐变头像，营造「被 N 人 star / 关注」的社交气场。
const visitorAvatars = works.map((w) => ({
  src: avatarArt(w.nameEn, w.hue, 72),
  alt: `${w.name}${copy("followers")}`,
}));

export function Hero() {
  return (
    <section
      id="hero"
      className="relative isolate flex min-h-dvh scroll-mt-0 items-center justify-center overflow-hidden"
    >
      {/* 全屏极光背景：深色底 + chart token 极光，营造 premium maker 氛围 */}
      <Aurora
        speed={26}
        blur={48}
        className="absolute inset-0 bg-[#070710]"
      />
      {/* 顶/底渐隐遮罩，让极光与上方导航、下方 about 平滑衔接 */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_120%_80%_at_50%_-10%,transparent_40%,rgba(7,7,16,0.4)_100%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-background"
      />

      <div className="relative z-10 mx-auto flex w-full max-w-4xl flex-col items-center px-6 py-32 text-center">
        {/* kicker 徽标 */}
        <span className="mb-7 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 backdrop-blur-sm">
          <Sparkles className="size-3.5 text-[var(--color-chart-1)]" aria-hidden />
          <AnimatedGradientText className="text-sm font-medium">
            {profile.kicker}
          </AnimatedGradientText>
        </span>

        {/* 主标题：中文名 SparklesText + 英文名 */}
        <h1 className="flex flex-col items-center gap-1">
          <SparklesText
            sparklesCount={10}
            className="text-6xl font-bold tracking-tight text-white sm:text-7xl md:text-8xl"
          >
            {profile.name}
          </SparklesText>
          <span className="mt-2 font-mono text-base font-medium uppercase tracking-[0.4em] text-white/40 sm:text-lg">
            {profile.nameEn}
          </span>
        </h1>

        {/* 角色轮播 */}
        <div className="mt-7 flex items-center gap-2 text-xl text-white/70 sm:text-2xl">
          <span className="text-white/40">{copy("iAmA")}</span>
          <WordRotate
            words={profile.roles}
            className="font-semibold text-[var(--color-chart-1)]"
          />
        </div>

        {/* tagline */}
        <p className="mt-5 max-w-xl text-balance text-lg leading-relaxed text-white/55">
          {profile.tagline}
          <span className="mt-2 flex items-center justify-center gap-1.5 text-sm text-white/40">
            <MapPin className="size-3.5" aria-hidden />
            {profile.location}
          </span>
        </p>

        {/* CTA：看作品 / 联系我（同页锚点平滑滚动，scroll-behavior 由 html smooth 提供） */}
        <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
          <Button size="lg" render={<a href="#work" />}>

            {copy("exploreMyWork")}
            <ArrowDown className="size-4" aria-hidden />
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="border-white/20 bg-white/5 text-white backdrop-blur-sm hover:bg-white/10"
            render={<a href="#contact" />}
          >
            <MessageCircle className="size-4" aria-hidden />

            {copy("contactMe")}
          </Button>
        </div>

        {/* 社交图标排 + Tooltip */}
        <div className="mt-8 flex items-center gap-1.5">
          {profile.socials.map((s) => (
            <Tooltip key={s.kind}>
              <TooltipTrigger
                render={
                  <a
                    href={s.href}
                    target={s.href.startsWith("http") ? "_blank" : undefined}
                    rel="noreferrer"
                    aria-label={s.label}
                    className="flex size-10 items-center justify-center rounded-full border border-white/12 text-white/55 transition-colors hover:border-[var(--color-chart-1)]/60 hover:bg-white/5 hover:text-white"
                  >
                    {SOCIAL_ICON[s.kind]}
                  </a>
                }
              />
              <TooltipContent>{`${s.label} · ${s.handle}`}</TooltipContent>
            </Tooltip>
          ))}
        </div>

        {/* 访客头像 + 数据指标 */}
        <div className="mt-14 flex flex-col items-center gap-6">
          <div className="flex items-center gap-3">
            <AvatarCircles avatars={visitorAvatars} extraCount={42} size="md" />
            <span className="text-sm text-white/45">

              {copy("savedBy")} <span className="font-semibold text-white/70">12.4k+</span>  {copy("developerSaves")}
            </span>
          </div>

          <dl className="grid grid-cols-2 gap-x-10 gap-y-6 sm:grid-cols-4 sm:gap-x-12">
            {profile.stats.map((stat) => (
              <div key={stat.label} className="flex flex-col items-center gap-1">
                <dd className="flex items-baseline font-mono text-2xl font-bold text-white sm:text-3xl">
                  {stat.prefix}
                  <NumberTicker value={stat.value} className="text-white" />
                  {stat.suffix && <span className="text-[var(--color-chart-1)]">{stat.suffix}</span>}
                </dd>
                <dt className="text-xs tracking-wide text-white/45">{stat.label}</dt>
              </div>
            ))}
          </dl>
        </div>

        {/* 向下滚动提示 */}
        <a
          href="#about"
          aria-label={copy("scrollDown")}
          className={cn(
            "absolute bottom-8 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-1.5 text-white/35",
            "transition-colors hover:text-white/70 md:flex",
          )}
        >
          <span className="text-[10px] uppercase tracking-[0.3em]">Scroll</span>
          <ArrowDown className="size-4 animate-bounce" aria-hidden />
        </a>
      </div>
    </section>
  );
}
