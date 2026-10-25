"use client";

import { copy } from "./book-detail-client.content";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Button, Heading, Stack, Text } from "@hulianui/ui";
import type { NovelDemoBook } from "../_data/books";
import { savedChapterId } from "../_lib/reading-progress";

export function BookDetailClient({ book }: { book: NovelDemoBook }) {
  const [resume, setResume] = useState(false);

  useEffect(() => {
    const chapterId = savedChapterId(book.id);
    setResume(Boolean(chapterId && book.chapters.some((chapter) => chapter.id === chapterId)));
  }, [book.id, book.chapters]);

  return (
    <div className="mx-auto w-full max-w-3xl px-6 py-8">
      <Button variant="ghost" size="sm" muted render={<Link href="/demos/novel" />}>
        {copy("backToLibrary")}
      </Button>
      <header className="mt-4">
        <Heading level={1}>{book.title}</Heading>
        <Text tone="muted" className="mt-2">
          {book.author}
        </Text>
        <Text className="mt-4">{book.blurb}</Text>
      </header>
      <Stack direction="row" gap={2} className="mt-6" wrap>
        <Button render={<Link href={`/demos/novel/read/${book.id}`} />}>
          {resume ? copy("continueReading") : copy("read")}
        </Button>
        <Button variant="outline" render={<Link href={`/demos/novel/studio/${book.id}`} />}>
          {copy("edit")}
        </Button>
      </Stack>
      <section className="mt-10">
        <Heading level={2} size="lg">
          {copy("chapterList")}
        </Heading>
        <ul className="mt-4 divide-y divide-border rounded-[var(--radius)] border border-border">
          {book.chapters.map((chapter, index) => (
            <li key={chapter.id} className="px-4 py-3">
              <Text>{copy("numbered", index + 1, chapter.title)}</Text>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
