"use client";
import { copy } from "./page.content";
import { useState } from "react";
import {
  Carousel,
  Divider,
  Heading,
  Marquee,
  Skeleton,
  SparklesText,
  WordRotate,
  AnimatedGradientText,
  ShineBorder,
  Text,
  Card,
  CardBody,
  Tag,
} from "@hulianui/ui";
import { heroBg } from "../_data/art";
import { products } from "../_data/products";
import { categories } from "../_data/categories";
import { coupons } from "../_data/coupons";
import { brand, SHOP_BASE } from "../_components/nav-config";
import { useMockData } from "../../lib/async";
import { HomeBannerSlide } from "../_components/home/home-banner-slide";
import { HomeFlashSale } from "../_components/home/home-flash-sale";
import { HomeCategoryGrid } from "../_components/home/home-category-grid";
import { HomeCouponCenter } from "../_components/home/home-coupon-center";
import { HomeProductGrid } from "../_components/home/home-product-grid";

// 程序化 banner 数据（编译期生成，零外链）
const BANNERS = [
  {
    imgSrc: heroBg(212),
    title: copy("text618SaleTechDeals"),
    subtitle: copy("save120OnHeadphonesWatchesAndLaptopsOver599"),
    ctaLabel: copy("shopDeals"),
    ctaHref: `${SHOP_BASE}/products?cat=digital`,
  },
  {
    imgSrc: heroBg(332),
    title: copy("beautyCareSpecialOffers"),
    subtitle: copy("text15OffSerumsLipstickAndSkinCareSets"),
    ctaLabel: copy("exploreOffers"),
    ctaHref: `${SHOP_BASE}/products?cat=beauty`,
  },
  {
    imgSrc: heroBg(152),
    title: copy("outdoorAdventureSummerStartsHere"),
    subtitle: copy("specialPricesOnTentsTrailShoesAndInsulatedBottles"),
    ctaLabel: copy("exploreOutdoors"),
    ctaHref: `${SHOP_BASE}/products?cat=outdoor`,
  },
  {
    imgSrc: heroBg(28),
    title: copy("homeLivingEditorSPicks"),
    subtitle: copy("limitedTimeOffersOnCookersFloorLampsAndAllSeasonQuilts"),
    ctaLabel: copy("shopHome"),
    ctaHref: `${SHOP_BASE}/products?cat=home`,
  },
];

// 品牌滚动条文案
const BRAND_MARQUEE = [
  copy("hansound"), copy("hanbook"), copy("hanwatch"), copy("hanphone"),
  copy("hanhome"), copy("hanlab"), copy("hanfield"), copy("hantaste"), copy("hanwear"),
];

// 轮换词（首屏 hero 副标题用）
const ROTATE_WORDS = [copy("tech"), copy("homeEssentials"), copy("beautyCare"), copy("outdoorGear"), copy("fineFoods"), copy("fashion")];

// 秒杀商品（flashSale=true）
const flashProducts = products.filter((p) => p.flashSale);

export default function ShopHomePage() {
  // 秒杀倒计时：客户端 useState 初始化避免 hydration mismatch（deadline 不在 SSR 渲染）
  const [deadline] = useState<number>(() => Date.now() + 4 * 60 * 60 * 1000); // 4 小时后

  // 首屏数据用 useMockData 模拟网络加载（delay 600ms · failOnce 模拟一次失败）
  const { data, loading, error, reload } = useMockData(
    { products, categories, coupons },
    { delay: 600, failOnce: true },
  );

  return (
    <div className="mx-auto w-full max-w-6xl space-y-10 px-4 py-6 md:px-6">

      {/* ── 1. Hero Banner 轮播 ── */}
      <section aria-label={copy("promotions")}>
        <div className="relative overflow-hidden rounded-[var(--radius-lg)]">
          <ShineBorder borderWidth={2} />
          {loading ? (
            <Skeleton className="h-[380px] w-full" />
          ) : (
            <Carousel
              showArrows
              showDots
              loop
              autoplay
              autoplayInterval={4000}
              aria-label={copy("promotionalCarousel")}
              slideClassName="rounded-[var(--radius-lg)] overflow-hidden"
            >
              {BANNERS.map((b) => (
                <HomeBannerSlide key={b.ctaHref} {...b} />
              ))}
            </Carousel>
          )}
        </div>

        {/* Hero 副标题：品牌名 + 轮换词 */}
        <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-center">
          <AnimatedGradientText>
            <span className="font-bold">{brand.name} {brand.nameEn}</span>
          </AnimatedGradientText>
          <Text tone="muted" size="sm">{copy("curated")}</Text>
          <WordRotate
            words={ROTATE_WORDS}
            className="font-semibold text-primary"
          />
          <Text tone="muted" size="sm">{copy("andOther")}{" "}
            <SparklesText sparklesCount={4}>{copy("greatFinds")}</SparklesText>
            {" "}—— {brand.slogan}
          </Text>
        </div>
      </section>

      <Divider />

      {/* ── 2. 品牌滚动条 ── */}
      <section aria-label={copy("featuredBrands")}>
        <Marquee pauseOnHover duration={30} gap="2rem" className="py-1">
          {BRAND_MARQUEE.map((b) => (
            <span
              key={b}
              className="rounded-full bg-surface-hover px-4 py-1.5 text-sm font-medium text-muted-foreground"
            >
              {b}
            </span>
          ))}
        </Marquee>
      </section>

      <Divider />

      {/* ── 3. 分类入口 ── */}
      {loading ? (
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="aspect-[3/4] w-full rounded-[var(--radius)]" />
          ))}
        </div>
      ) : (
        <HomeCategoryGrid categories={data?.categories ?? categories} />
      )}

      <Divider />

      {/* ── 4. 限时秒杀专区 ── */}
      <HomeFlashSale
        products={data ? flashProducts : []}
        deadline={deadline}
        loading={loading}
      />

      <Divider />

      {/* ── 5. 领券中心 ── */}
      <section aria-labelledby="home-coupon-section">
        <div className="rounded-[var(--radius-lg)] bg-surface-hover p-5">
          {loading ? (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-24 w-full rounded-[var(--radius)]" />
              ))}
            </div>
          ) : (
            <HomeCouponCenter coupons={data?.coupons ?? coupons} />
          )}
        </div>
      </section>

      <Divider />

      {/* ── 7. 猜你喜欢 / 全部好物 ── */}
      <HomeProductGrid
        products={data?.products ?? []}
        loading={loading}
        error={error}
        onReload={reload}
      />

      {/* ── 8. 底部信任背书 ── */}
      {!loading && (
        <section aria-label={copy("shoppingPromises")}>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { icon: "🛡️", title: copy("authenticityGuaranteed"), desc: copy("text100DirectFromBrands") },
              { icon: "🚚", title: copy("fastDelivery"), desc: copy("nextDayDeliveryFreeNationwideShipping") },
              { icon: "↩️", title: copy("easyReturns"), desc: copy("text15DayFreeReturns") },
              { icon: "🎁", title: copy("memberBenefits"), desc: copy("redeemPointsMemberOnlyOffers") },
            ].map((item) => (
              <Card key={item.title} variant="outline">
                <CardBody className="flex items-center gap-3 p-4">
                  <span className="text-2xl" aria-hidden>{item.icon}</span>
                  <div>
                    <Text weight="semibold" size="sm">{item.title}</Text>
                    <Text size="xs" tone="muted">{item.desc}</Text>
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
