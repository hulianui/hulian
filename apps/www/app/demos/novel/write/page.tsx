"use client";

import Link from "next/link";
import { Button, NovelEditor } from "@hulianui/ui";
import { ferryBook } from "../_data/books";
import { useManuscript } from "../use-manuscript";
import { copy } from "./page.content";

export default function NovelWritePage() {
  const book = ferryBook();
  const [chapters, setChapters] = useManuscript(book.chapters);
  return (
    <div className="flex h-dvh flex-col">
      <div className="flex justify-start px-3 py-2">
        <Button variant="ghost" size="sm" muted render={<Link href="/demos/novel" />}>
          {copy("backToReading")}
        </Button>
      </div>
      <NovelEditor className="min-h-0 flex-1" chapters={chapters} onChaptersChange={setChapters} />
    </div>
  );
}
