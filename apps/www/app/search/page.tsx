import { Suspense } from "react";
import type { Metadata } from "next";
import { SearchClient } from "./search-client";

export const metadata: Metadata = {
  title: "搜索 · 瑚琏 Hulian",
  description: "跨页面、区块、组件、模版与指南的全站搜索 —— 描述你的任务，直接拿到可复用的积木。",
  // 结果页由 URL 参数驱动、内容随 query 变化，不该被索引成一堆近似重复页。
  robots: { index: false, follow: true },
};

// useSearchParams 需要 Suspense 边界；output:export 下缺了它构建会直接报错。
export default function SearchPage() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-5xl px-6 py-16 text-sm text-muted">加载中…</div>}>
      <SearchClient />
    </Suspense>
  );
}
