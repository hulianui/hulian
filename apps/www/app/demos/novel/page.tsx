import { Suspense } from "react";
import { novelBooks } from "./_data/books";
import { ReaderClient } from "./_components/reader-client";

export default function NovelEntryPage() {
  const book = novelBooks().find((item) => item.id === "ferry");
  if (!book) return null;
  // 与 /read/[id] 同理：ReaderClient 读 ?c=，静态导出必须包 Suspense。
  return (
    <Suspense fallback={null}>
      <ReaderClient book={book} />
    </Suspense>
  );
}
