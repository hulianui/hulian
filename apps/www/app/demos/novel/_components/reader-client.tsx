"use client";

import { copy } from "./reader-client.content";
import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Button, NovelReader } from "@hulianui/ui";
import type { NovelDemoBook } from "../_data/books";
import { useManuscript } from "../_lib/use-manuscript";

const NOVEL_BASE = "/demos/novel";

export function ReaderClient({ book }: { book: NovelDemoBook }) {
  const [chapters] = useManuscript(book.id, book.chapters);
  // 目录里点「第 3 章」带 ?c=chapterId 进来。带了这个参数就用受控章号（否则本地进度优先，
  // 点哪章都跳回上次读到的地方）；不带则整条交给组件，刷新能续读。
  const requested = useSearchParams().get("c");
  const [chapterId, setChapterId] = useState<string | null>(requested);
  const controlled = chapterId && chapters.some((chapter) => chapter.id === chapterId);

  return (
    <NovelReader
      autoFocus
      className="novel-theme h-dvh"
      articleClassName="novel-serif"
      title={book.title}
      author={book.author}
      chapters={chapters}
      {...(controlled
        ? { chapterId, onChapterChange: (id: string) => setChapterId(id) }
        : {})}
      persistKey={book.id}
      defaultChromeOpen
      defaultPaper="day"
      leading={
        <>
          <Button variant="ghost" size="sm" muted render={<Link href={`${NOVEL_BASE}/library`} />}>
            {copy("library")}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            muted
            render={<Link href={`${NOVEL_BASE}/books/${book.id}`} />}
          >
            {copy("book")}
          </Button>
        </>
      }
      trailing={
        <Button
          variant="ghost"
          size="sm"
          muted
          render={<Link href={`${NOVEL_BASE}/studio/${book.id}`} />}
        >
          {copy("write")}
        </Button>
      }
    />
  );
}
