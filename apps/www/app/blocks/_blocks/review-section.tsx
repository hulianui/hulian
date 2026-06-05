"use client";

// 商品评价区块 —— 左侧总评分（大数字 + Rating + 各星级占比 Meter）+ 右侧用户评论列表（Avatar + 名 + Rating + 评论文 + 时间）。
// 使用 Card/CardBody、Meter、Rating、Avatar（fallback 文字），全部内联 mock，复制即独立运行。

import { useState } from "react";
import { ThumbsUp } from "lucide-react";
import { Avatar, Card, CardBody, Heading, Meter, Rating, Tag, Text } from "@hulianui/ui";

interface Review {
  id: string;
  author: string;
  authorInitial: string;
  rating: number;
  content: string;
  date: string;
  spec: string;
  likes: number;
  avatarColor: string;
}

const REVIEWS: Review[] = [
  {
    id: "r1",
    author: "林**",
    authorInitial: "林",
    rating: 5,
    content: "质量超出预期，手感丝滑，颜色也很正，完全值得这个价格！物流很快，当天就到了。强烈推荐给大家，已经在回购了。",
    date: "2026-05-28",
    spec: "玫瑰红 · M",
    likes: 128,
    avatarColor: "bg-rose-400",
  },
  {
    id: "r2",
    author: "张**",
    authorInitial: "张",
    rating: 5,
    content: "这是我买过最好的同类产品，做工精细，设计也很美观。用了一周，越用越喜欢，客服服务态度也很好。",
    date: "2026-05-20",
    spec: "宝石蓝 · L",
    likes: 84,
    avatarColor: "bg-blue-400",
  },
  {
    id: "r3",
    author: "王**",
    authorInitial: "王",
    rating: 4,
    content: "整体不错，颜色和图片基本一致。唯一小建议是包装盒可以再精致一点，其他方面都很满意，会推荐给朋友。",
    date: "2026-05-15",
    spec: "琥珀黄 · S",
    likes: 56,
    avatarColor: "bg-amber-400",
  },
  {
    id: "r4",
    author: "陈**",
    authorInitial: "陈",
    rating: 5,
    content: "买来送给父母的，他们都说很好用！材质很舒适，细节处理得很好，下次还会来这家店购买。",
    date: "2026-05-10",
    spec: "薄荷绿 · XL",
    likes: 42,
    avatarColor: "bg-emerald-400",
  },
  {
    id: "r5",
    author: "刘**",
    authorInitial: "刘",
    rating: 4,
    content: "品质挺好的，价格实惠，性价比高。快递包装完好，没有任何损坏，整体很满意这次购物体验。",
    date: "2026-05-05",
    spec: "午夜黑 · XL",
    likes: 37,
    avatarColor: "bg-violet-400",
  },
];

const STAR_DIST = [
  { star: 5, count: 68 },
  { star: 4, count: 19 },
  { star: 3, count: 8 },
  { star: 2, count: 3 },
  { star: 1, count: 2 },
];

const TOTAL_REVIEWS = STAR_DIST.reduce((s, d) => s + d.count, 0);
const AVG_RATING =
  STAR_DIST.reduce((s, d) => s + d.star * d.count, 0) / TOTAL_REVIEWS;

export function ReviewSectionBlock() {
  const [likedIds, setLikedIds] = useState<string[]>([]);

  function toggleLike(id: string) {
    setLikedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  }

  return (
    <div className="mx-auto w-full max-w-3xl">
      <Heading level={2} size="lg" weight="semibold" className="mb-5">
        用户评价
      </Heading>

      {/* 评分概览卡 */}
      <Card variant="outline" className="mb-6">
        <CardBody className="flex flex-col gap-6 p-6 sm:flex-row sm:items-start">
          {/* 左：大分 + 星级 + 总数 */}
          <div className="flex shrink-0 flex-col items-center gap-2 sm:w-36">
            <span className="text-5xl font-bold text-foreground">{AVG_RATING.toFixed(1)}</span>
            <Rating value={AVG_RATING} readOnly size="sm" />
            <Text size="xs" tone="muted">{TOTAL_REVIEWS} 条评价</Text>
          </div>

          {/* 右：各星级 Meter 条 */}
          <div className="flex-1 space-y-2">
            {STAR_DIST.map(({ star, count }) => (
              <div key={star} className="flex items-center gap-3">
                <span className="w-8 shrink-0 text-right text-sm text-muted">{star} 星</span>
                <div className="flex-1">
                  <Meter value={count} max={Math.max(...STAR_DIST.map((d) => d.count))} />
                </div>
                <span className="w-6 shrink-0 text-xs text-muted">{count}</span>
              </div>
            ))}
          </div>
        </CardBody>
      </Card>

      {/* 评论列表 */}
      <div className="space-y-5">
        {REVIEWS.map((r) => {
          const liked = likedIds.includes(r.id);
          return (
            <div key={r.id} className="flex gap-3">
              {/* 头像 */}
              <Avatar
                fallback={r.authorInitial}
                size="md"
                className={r.avatarColor}
              />

              {/* 内容 */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-medium text-foreground">{r.author}</span>
                  <Rating value={r.rating} readOnly size="sm" />
                  <Tag tone="neutral" size="sm" variant="soft">{r.spec}</Tag>
                </div>

                <p className="mt-2 text-sm leading-relaxed text-foreground">{r.content}</p>

                <div className="mt-2 flex items-center gap-4">
                  <Text size="xs" tone="muted">{r.date}</Text>
                  <button
                    type="button"
                    onClick={() => toggleLike(r.id)}
                    className={`flex items-center gap-1 text-xs transition-colors ${
                      liked ? "text-primary" : "text-muted hover:text-foreground"
                    }`}
                    aria-label={liked ? "取消点赞" : "点赞"}
                  >
                    <ThumbsUp className="size-3" aria-hidden />
                    {liked ? r.likes + 1 : r.likes}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
