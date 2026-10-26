"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import type { NovelChapter } from "@hulianui/ui";

function storageKey(bookId: string) {
  return `hulian-demo-novel-manuscript:${bookId}`;
}

function isChapterList(value: unknown): value is NovelChapter[] {
  return (
    Array.isArray(value) &&
    value.every(
      (item) =>
        item &&
        typeof item === "object" &&
        typeof (item as NovelChapter).id === "string" &&
        typeof (item as NovelChapter).title === "string" &&
        typeof (item as NovelChapter).content === "string",
    )
  );
}

/** 同一本书的阅读和写作共用一份文稿。首屏先用种子，避免刷新时正文空白。 */
export function useManuscript(bookId: string, seed: NovelChapter[]) {
  const seedRef = useRef(seed);
  seedRef.current = seed;
  const [chapters, setChapters] = useState(seed);
  const [storeId, setStoreId] = useState<string | null>(null);

  useLayoutEffect(() => {
    let next = seedRef.current;
    try {
      const raw = localStorage.getItem(storageKey(bookId));
      if (raw) {
        const parsed: unknown = JSON.parse(raw);
        if (isChapterList(parsed) && parsed.length > 0) next = parsed;
      }
    } catch {
      // 本地稿坏了就继续用种子，不打断阅读。
    }
    setChapters(next);
    setStoreId(bookId);
  }, [bookId]);

  useEffect(() => {
    if (storeId !== bookId) return;
    localStorage.setItem(storageKey(bookId), JSON.stringify(chapters));
  }, [storeId, chapters, bookId]);

  return [chapters, setChapters] as const;
}
