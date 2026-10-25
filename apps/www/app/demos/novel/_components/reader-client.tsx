"use client";

import { copy } from "./reader-client.content";
import Link from "next/link";
import { Button, NovelReader } from "@hulianui/ui";
import type { NovelDemoBook } from "../_data/books";
import { useManuscript } from "../_lib/use-manuscript";

export function ReaderClient({ book }: { book: NovelDemoBook }) {
  const [chapters] = useManuscript(book.id, book.chapters);
  return (
    <NovelReader
      className="h-dvh"
      title={book.title}
      author={book.author}
      chapters={chapters}
      persistKey={book.id}
      leading={
        <>
          <Button variant="ghost" size="sm" muted render={<Link href={`/demos/novel/books/${book.id}`} />}>
            {copy("book")}
          </Button>
          <Button variant="ghost" size="sm" muted render={<Link href="/demos" />}>
            {copy("gallery")}
          </Button>
        </>
      }
      trailing={
        <Button variant="ghost" size="sm" muted render={<Link href={`/demos/novel/studio/${book.id}`} />}>
          {copy("write")}
        </Button>
      }
    />
  );
}
