"use client";
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
        author: "Lin**",
        authorInitial: "Lin",
        rating: 5,
        content: "Better than expected: silky smooth, true to color, and worth the price. It arrived the same day, and I've already ordered another one.",
        date: "2026-05-28",
        spec: "Rose Red \u00B7 M",
        likes: 128,
        avatarColor: "bg-rose-400",
    },
    {
        id: "r2",
        author: "Zhang**",
        authorInitial: "Zhang",
        rating: 5,
        content: "The best product of its kind I've bought: beautifully designed and well made. I like it even more after a week, and customer support was excellent too.",
        date: "2026-05-20",
        spec: "Sapphire Blue \u00B7 L",
        likes: 84,
        avatarColor: "bg-blue-400",
    },
    {
        id: "r3",
        author: "Wang**",
        authorInitial: "Wang",
        rating: 4,
        content: "Very good overall, and the color matches the photos. The box could feel a little more premium, but I'm happy with everything else and would recommend it.",
        date: "2026-05-15",
        spec: "Amber Yellow \u00B7 S",
        likes: 56,
        avatarColor: "bg-amber-400",
    },
    {
        id: "r4",
        author: "Chen**",
        authorInitial: "Chen",
        rating: 5,
        content: "I bought this for my parents and they both love it. The material is comfortable, the finishing is excellent, and I'll gladly shop here again.",
        date: "2026-05-10",
        spec: "Mint Green \u00B7 XL",
        likes: 42,
        avatarColor: "bg-emerald-400",
    },
    {
        id: "r5",
        author: "Liu**",
        authorInitial: "Liu",
        rating: 4,
        content: "Good quality at a fair price. The package arrived intact, and I'm very happy with the purchase overall.",
        date: "2026-05-05",
        spec: "Midnight Black \u00B7 XL",
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
const AVG_RATING = STAR_DIST.reduce((s, d) => s + d.star * d.count, 0) / TOTAL_REVIEWS;
export function ReviewSectionBlock() {
    const [likedIds, setLikedIds] = useState<string[]>([]);
    function toggleLike(id: string) {
        setLikedIds((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
    }
    return (<div className="mx-auto w-full max-w-3xl">
      <Heading level={2} size="lg" weight="semibold" className="mb-5">
        User reviews
      </Heading>


      <Card variant="outline" className="mb-6">
        <CardBody className="flex flex-col gap-6 p-6 sm:flex-row sm:items-start">

          <div className="flex shrink-0 flex-col items-center gap-2 sm:w-36">
            <span className="text-5xl font-bold text-foreground">{AVG_RATING.toFixed(1)}</span>
            <Rating value={AVG_RATING} readOnly size="sm"/>
            <Text size="xs" tone="muted">{TOTAL_REVIEWS} reviews</Text>
          </div>


          <div className="flex-1 space-y-2">
            {STAR_DIST.map(({ star, count }) => (<div key={star} className="flex items-center gap-3">
                <span className="w-8 shrink-0 text-right text-sm text-muted-foreground">{star} star</span>
                <div className="flex-1">
                  <Meter value={count} max={Math.max(...STAR_DIST.map((d) => d.count))}/>
                </div>
                <span className="w-6 shrink-0 text-xs text-muted-foreground">{count}</span>
              </div>))}
          </div>
        </CardBody>
      </Card>


      <div className="space-y-5">
        {REVIEWS.map((r) => {
            const liked = likedIds.includes(r.id);
            return (<div key={r.id} className="flex gap-3">

              <Avatar fallback={r.authorInitial} size="md" className={r.avatarColor}/>


              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-medium text-foreground">{r.author}</span>
                  <Rating value={r.rating} readOnly size="sm"/>
                  <Tag tone="neutral" size="sm" variant="soft">{r.spec}</Tag>
                </div>

                <p className="mt-2 text-sm leading-relaxed text-foreground">{r.content}</p>

                <div className="mt-2 flex items-center gap-4">
                  <Text size="xs" tone="muted">{r.date}</Text>
                  <button type="button" onClick={() => toggleLike(r.id)} className={`flex items-center gap-1 text-xs transition-colors ${liked ? "text-primary" : "text-muted-foreground hover:text-foreground"}`} aria-label={liked ? "Cancel like" : "Like"}>
                    <ThumbsUp className="size-3" aria-hidden/>
                    {liked ? r.likes + 1 : r.likes}
                  </button>
                </div>
              </div>
            </div>);
        })}
      </div>
    </div>);
}
