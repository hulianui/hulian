"use client";

import { copy } from "./editor-client.content";
import Link from "next/link";
import { Button, NovelEditor, Text } from "@hulianui/ui";
import type { NovelDemoBook } from "../_data/books";
import { useManuscript } from "../_lib/use-manuscript";

export function EditorClient({ book }: { book: NovelDemoBook }) {
  const [chapters, setChapters] = useManuscript(book.id, book.chapters);
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex items-center justify-between gap-2 px-3 py-2">
        <Button variant="ghost" size="sm" muted render={<Link href={`/demos/novel/read/${book.id}`} />}>
          {copy("backToReading")}
        </Button>
        <Text size="sm" weight="medium" truncate className="min-w-0 flex-1 text-center">
          {book.title}
        </Text>
        <Button variant="ghost" size="sm" muted render={<Link href="/demos/novel/studio" />}>
          {copy("allBooks")}
        </Button>
      </div>
      <NovelEditor className="min-h-0 flex-1" chapters={chapters} onChaptersChange={setChapters} />
    </div>
  );
}
