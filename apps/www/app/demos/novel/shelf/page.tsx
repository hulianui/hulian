"use client";

import Link from "next/link";
import { Button, Card, CardBody, CardFooter, CardHeader, Heading, Text } from "@hulianui/ui";
import { ferryBook } from "../_data/books";
import { copy } from "./page.content";

export default function NovelShelfPage() {
  const book = ferryBook();
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-xl flex-col gap-6 px-6 py-10">
      <Heading level={1}>{copy("shelfTitle")}</Heading>
      <Card>
        <CardHeader title={book.title} description={book.author} />
        <CardBody>
          <Text>{book.blurb}</Text>
        </CardBody>
        <CardFooter className="flex gap-2">
          <Button render={<Link href="/demos/novel" />}>{copy("read")}</Button>
          <Button variant="outline" render={<Link href="/demos/novel/write" />}>
            {copy("write")}
          </Button>
        </CardFooter>
      </Card>
    </main>
  );
}
