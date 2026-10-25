"use client";

import Link from "next/link";
import { Button, NovelReader } from "@hulianui/ui";
import { ferryBook } from "./_data/books";
import { copy } from "./page.content";
import { useManuscript } from "./use-manuscript";

export default function NovelDemoPage() {
  const book = ferryBook();
  const [chapters] = useManuscript(book.chapters);
  return (
    <NovelReader
      className="h-dvh"
      title={book.title}
      author={book.author}
      chapters={chapters}
      persistKey="ferry-light"
      leading={
        <>
          <Button variant="ghost" size="sm" muted render={<Link href="/demos/novel/shelf" />}>
            {copy("shelf")}
          </Button>
          <Button variant="ghost" size="sm" muted render={<Link href="/demos" />}>
            {copy("gallery")}
          </Button>
        </>
      }
      trailing={
        <Button variant="ghost" size="sm" muted render={<Link href="/demos/novel/write" />}>
          {copy("write")}
        </Button>
      }
    />
  );
}
