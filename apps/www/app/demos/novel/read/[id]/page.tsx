import { Suspense } from "react";
import { notFound } from "next/navigation";
import { novelBooks } from "../../_data/books";
import { ReaderClient } from "../../_components/reader-client";

export function generateStaticParams() {
  return novelBooks().map((book) => ({ id: book.id }));
}

export default async function NovelReadPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const book = novelBooks().find((item) => item.id === id);
  if (!book) notFound();
  // ReaderClient 读 ?c= 章节参数（useSearchParams）：静态导出时它必须包在 Suspense 里，
  // 否则 prerender 直接抛 missing-suspense-with-csr-bailout，整个 /demos/novel 构建失败。
  return (
    <Suspense fallback={null}>
      <ReaderClient book={book} />
    </Suspense>
  );
}
