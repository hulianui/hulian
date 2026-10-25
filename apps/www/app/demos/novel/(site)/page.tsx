"use client";

import Link from "next/link";
import { Button, Card, CardBody, CardFooter, CardHeader, Heading, Text } from "@hulianui/ui";
import { novelBooks } from "../_data/books";
import { copy } from "./page.content";

export default function NovelLibraryPage() {
  const books = novelBooks();
  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-8">
      <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div className="max-w-2xl">
          <Heading level={1}>{copy("libraryTitle")}</Heading>
          <Text tone="muted" className="mt-2">
            {copy("libraryLead")}
          </Text>
        </div>
        <Button variant="outline" render={<Link href="/demos/novel/studio" />}>
          {copy("authorStudio")}
        </Button>
      </header>
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
        {books.map((book) => (
          <Card key={book.id} variant="outline" className="flex h-full flex-col">
            <CardHeader title={book.title} description={book.author} />
            <CardBody className="flex flex-1 flex-col gap-3">
              <Text>{book.blurb}</Text>
              <Text size="sm" tone="muted">
                {copy("chapters", book.chapters.length)}
              </Text>
            </CardBody>
            <CardFooter className="flex gap-2">
              <Button render={<Link href={`/demos/novel/read/${book.id}`} />}>{copy("read")}</Button>
              <Button variant="outline" render={<Link href={`/demos/novel/books/${book.id}`} />}>
                {copy("details")}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
