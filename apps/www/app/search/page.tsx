import { Suspense } from "react";
import type { Metadata } from "next";
import { getIntlayer } from "next-intlayer";
import { SearchClient } from "./search-client";
import { DOCS_LOCALE } from "../../lib/docs-locale";

const content = getIntlayer("docs-search", DOCS_LOCALE);

export const metadata: Metadata = {
  title: `${content.metadataTitle}`,
  description: `${content.metadataDescription}`,
  // 结果页由 URL 参数驱动、内容随 query 变化，不该被索引成一堆近似重复页。
  robots: { index: false, follow: true },
};

// useSearchParams 需要 Suspense 边界；output:export 下缺了它构建会直接报错。
export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-5xl px-6 py-16 text-sm text-muted">{content.loading}</div>
      }
    >
      <SearchClient />
    </Suspense>
  );
}
