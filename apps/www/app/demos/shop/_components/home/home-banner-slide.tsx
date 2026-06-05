"use client";
import Link from "next/link";
import { Button } from "@hulianui/ui";

interface BannerSlideProps {
  imgSrc: string;
  title: string;
  subtitle: string;
  ctaLabel: string;
  ctaHref: string;
}

/** Hero 轮播单张：程序化 banner 图 + 覆盖层文字 + CTA 按钮 */
export function HomeBannerSlide({ imgSrc, title, subtitle, ctaLabel, ctaHref }: BannerSlideProps) {
  return (
    <div className="relative w-full overflow-hidden" style={{ height: 380 }}>
      {/* 程序化 SVG banner，data-URI 零外链 */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={imgSrc} alt={title} className="size-full object-cover" />
      {/* 左侧内容覆盖层 */}
      <div className="absolute inset-0 flex flex-col justify-center px-8 md:px-16">
        <div className="max-w-xs md:max-w-sm">
          <h2 className="text-2xl font-bold text-white drop-shadow-md md:text-4xl">{title}</h2>
          <p className="mt-2 text-sm text-white/90 drop-shadow-sm md:text-base">{subtitle}</p>
          <div className="mt-5">
            <Button
              render={<Link href={ctaHref} />}
              variant="outline"
              className="border-white/80 bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm"
            >
              {ctaLabel}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
