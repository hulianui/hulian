"use client";

import { copy } from "./editor-client.content";
import Link from "next/link";
import { Button, NovelEditor, Text } from "@hulianui/ui";
import { ArrowLeft } from "lucide-react";
import type { NovelDemoBook } from "../_data/books";
import { useManuscript } from "../_lib/use-manuscript";

const NOVEL_BASE = "/demos/novel";

export function EditorClient({ book }: { book: NovelDemoBook }) {
  const [chapters, setChapters] = useManuscript(book.id, book.chapters);
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex items-center justify-between gap-3 border-b border-hairline px-4 py-2.5">
        <Button
          variant="ghost"
          size="sm"
          muted
          render={<Link href={`${NOVEL_BASE}/read/${book.id}`} />}
        >
          <ArrowLeft aria-hidden className="size-3.5" />
          {copy("backToReading")}
        </Button>

        <div className="flex min-w-0 items-baseline gap-2">
          <Text size="xs" tone="muted" className="shrink-0">
            {copy("writing")}
          </Text>
          <Text weight="medium" truncate className="novel-serif text-base">
            {book.title}
          </Text>
        </div>

        <Button
          variant="ghost"
          size="sm"
          muted
          render={<Link href={`${NOVEL_BASE}/studio`} />}
        >
          {copy("backToStudio")}
        </Button>
      </div>
      <NovelEditor className="min-h-0 flex-1" chapters={chapters} onChaptersChange={setChapters} />
    </div>
  );
}
