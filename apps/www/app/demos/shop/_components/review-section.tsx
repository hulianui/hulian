"use client";
import { copy } from "./review-section.content";
import { useState } from "react";
import { ThumbsUp } from "lucide-react";
import { AvatarCircles, Card, CardBody, Comment, CommentAction, Meter, Rating, Tag } from "@hulianui/ui";
import { reviewsOf, ratingDistribution } from "../_data/reviews";
import { productImage } from "../_data/products";
import { avatarArt } from "../_data/art";
import { productById } from "../_data/products";

export function ReviewSection({ productId }: { productId: string }) {
  const reviews = reviewsOf(productId);
  const dist = ratingDistribution(productId);
  const product = productById[productId];

  const [likedIds, setLikedIds] = useState<string[]>([]);

  const totalReviews = reviews.length;
  const avgRating =
    totalReviews > 0
      ? reviews.reduce((s, r) => s + r.rating, 0) / totalReviews
      : 0;

  const avatarList = reviews.slice(0, 4).map((r) => ({
    src: avatarArt(r.author),
    alt: r.author,
  }));

  if (reviews.length === 0) {
    return (
      <section id="reviews" className="scroll-mt-20 py-8">
        <h2 className="mb-4 text-lg font-semibold text-foreground">{copy("customerReviews")}</h2>
        <p className="text-sm text-muted-foreground">{copy("noReviewsYetBeTheFirstToReviewThisProduct")}</p>
      </section>
    );
  }

  return (
    <section id="reviews" className="scroll-mt-20 py-8">
      <h2 className="mb-6 text-lg font-semibold text-foreground">{copy("customerReviews")}</h2>

      {/* 评分概览 */}
      <Card variant="outline" className="mb-6">
        <CardBody className="flex flex-col gap-6 p-6 sm:flex-row sm:items-start">
          {/* 大分 + 头像堆叠 */}
          <div className="flex shrink-0 flex-col items-center gap-2 sm:w-40">
            <span className="text-5xl font-bold text-foreground">{avgRating.toFixed(1)}</span>
            <Rating value={avgRating} readOnly size="sm" />
            <AvatarCircles
              avatars={avatarList}
              extraCount={Math.max(0, totalReviews - 4)}
              size="sm"
            />
            <p className="text-xs text-muted-foreground">{totalReviews}  {copy("reviews")}</p>
          </div>

          {/* 评分分布 Meter */}
          <div className="flex-1 space-y-2">
            {dist.map(({ star, count }) => (
              <div key={star} className="flex items-center gap-3">
                <span className="w-8 shrink-0 text-right text-sm text-muted-foreground">{star}  {copy("stars")}</span>
                <div className="flex-1">
                  <Meter
                    value={count}
                    max={Math.max(totalReviews, 1)}
                  />
                </div>
                <span className="w-6 shrink-0 text-xs text-muted-foreground">{count}</span>
              </div>
            ))}
          </div>
        </CardBody>
      </Card>

      {/* 评价列表 */}
      <div className="space-y-4">
        {reviews.map((r) => (
          <Comment
            key={r.id}
            author={r.author}
            avatar={{ src: avatarArt(r.author), alt: r.author.slice(0, 1) }}
            datetime={r.date}
            content={
              <div className="space-y-2">
                <Rating value={r.rating} readOnly size="sm" />
                <p className="text-sm text-foreground">{r.content}</p>
                {r.spec && (
                  <Tag tone="neutral" size="sm" variant="soft">
                    {r.spec}
                  </Tag>
                )}
                {/* 晒图（用商品变体图占位） */}
                {r.withImage && product && (
                  <div className="flex gap-2">
                    {[0, 1].map((v) => (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        key={v}
                        src={productImage(product, v, 120, 120)}
                        alt={copy("customerPhotoAlt", r.author, v + 1)}
                        className="size-20 rounded-[var(--radius)] object-cover"
                      />
                    ))}
                  </div>
                )}
              </div>
            }
            actions={
              <CommentAction
                onClick={() =>
                  setLikedIds((prev) =>
                    prev.includes(r.id) ? prev.filter((x) => x !== r.id) : [...prev, r.id],
                  )
                }
                className={likedIds.includes(r.id) ? "text-primary" : ""}
              >
                <ThumbsUp className="mr-1 inline size-3" />
                {likedIds.includes(r.id) ? r.likes + 1 : r.likes}
              </CommentAction>
            }
          />
        ))}
      </div>
    </section>
  );
}
