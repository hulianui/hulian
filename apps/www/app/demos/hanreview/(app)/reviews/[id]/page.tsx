import { ReviewDetail } from "../../../_components/review-detail";
import { REVIEWS } from "../../../_data/reviews";
import { MODELS } from "../../../_data/models";
import { REPOS } from "../../../_data/repos";

// www 为 output:export 静态导出，动态路由须枚举所有 id（generateStaticParams 仅服务端可导出，故本页保持 server）。
export function generateStaticParams() {
  return REVIEWS.map((r) => ({ id: r.id }));
}

export default async function ReviewDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const review = REVIEWS.find((r) => r.id === id);

  if (!review) {
    return (
      <div className="p-12 text-center text-sm text-muted">未找到审查记录 {id}</div>
    );
  }

  return <ReviewDetail review={review} repos={REPOS} models={MODELS} />;
}
