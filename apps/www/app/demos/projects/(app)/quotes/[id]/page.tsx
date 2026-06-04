import { QuoteEditor } from "../../../_components/quote-editor";
import { quotes } from "../../../_data/quotes";

// www 为 output:export 静态导出，动态路由须枚举所有 id。
export function generateStaticParams() {
  return quotes.map((q) => ({ id: q.id }));
}

export default async function QuoteDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <QuoteEditor id={id} />;
}
