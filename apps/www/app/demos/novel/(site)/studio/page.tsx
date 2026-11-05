"use client";

import Link from "next/link";
import { Button, Container, Heading, Text } from "@hulianui/ui";
import { bookWordCount, novelBooks } from "../../_data/books";
import { formatWords } from "../../_lib/format";
import { copy } from "./page.content";

const NOVEL_BASE = "/demos/novel";

export default function NovelStudioPage() {
  const books = novelBooks();
  const totalChapters = books.reduce((total, book) => total + book.chapters.length, 0);
  const totalWords = books.reduce((total, book) => total + bookWordCount(book), 0);

  return (
    <Container size="2xl" className="py-12 md:py-16">
      <header className="flex flex-wrap items-end justify-between gap-x-12 gap-y-8 border-b border-hairline pb-10">
        <div className="max-w-xl">
          <Text size="xs" tone="muted" className="novel-serif tracking-[0.42em]">
            {copy("eyebrow")}
          </Text>
          <Heading level={1} size="3xl" weight="normal" className="novel-serif mt-4">
            {copy("studioTitle")}
          </Heading>
          <Text size="sm" tone="muted" className="mt-3 leading-relaxed">
            {copy("studioLead")}
          </Text>
        </div>

        <dl className="flex flex-wrap items-baseline gap-x-10 gap-y-4">
          {[
            [String(books.length), copy("works")],
            [String(totalChapters), copy("unitChapters")],
            [formatWords(totalWords), copy("totalWords")],
          ].map(([value, unit]) => (
            <div key={unit} className="flex items-baseline gap-1.5">
              <Text as="span" size="xl" weight="medium" numeric className="novel-serif">
                {value}
              </Text>
              <Text as="span" size="xs" tone="muted">
                {unit}
              </Text>
            </div>
          ))}
        </dl>
      </header>

      <div className="mt-8 hidden grid-cols-[1fr_auto_auto_auto] items-center gap-x-8 border-b border-hairline pb-3 md:grid">
        <Text size="xs" tone="muted" className="tracking-[0.16em]">
          {copy("colWork")}
        </Text>
        <Text size="xs" tone="muted" className="w-16 text-right tracking-[0.16em]">
          {copy("colChapters")}
        </Text>
        <Text size="xs" tone="muted" className="w-20 text-right tracking-[0.16em]">
          {copy("colWords")}
        </Text>
        <Text size="xs" tone="muted" className="w-32 text-right tracking-[0.16em]">
          {copy("colActions")}
        </Text>
      </div>

      <ul className="divide-y divide-hairline">
        {books.map((book) => (
          <li
            key={book.id}
            className="group grid grid-cols-1 items-center gap-x-8 gap-y-3 py-6 md:grid-cols-[1fr_auto_auto_auto]"
          >
            <div className="flex min-w-0 items-center gap-4">
              {/* 书脊：这是书架，不是卡片墙 —— 一列竖条比缩到 64px 的假书封更清楚 */}
              <span
                aria-hidden
                className="h-12 w-1 shrink-0 rounded-full"
                style={{ background: `linear-gradient(180deg, ${book.cover.from}, ${book.cover.to})` }}
              />
              <div className="min-w-0">
                <Heading level={2} size="base" weight="medium" className="novel-serif">
                  {book.title}
                </Heading>
                <Text size="xs" tone="muted" className="mt-1">
                  {book.author} · {book.genre} · {book.year}
                </Text>
              </div>
            </div>

            <Text size="sm" tone="muted" numeric className="md:w-16 md:text-right">
              {book.chapters.length}
              {copy("unitChapters")}
            </Text>
            <Text size="sm" tone="muted" numeric className="md:w-20 md:text-right">
              {formatWords(bookWordCount(book))}
              {copy("unitWords")}
            </Text>

            <div className="flex items-center gap-1 md:w-32 md:justify-end">
              <Button
                variant="ghost"
                size="sm"
                muted
                render={<Link href={`${NOVEL_BASE}/read/${book.id}`} />}
              >
                {copy("read")}
              </Button>
              <Button size="sm" render={<Link href={`${NOVEL_BASE}/studio/${book.id}`} />}>
                {copy("edit")}
              </Button>
            </div>
          </li>
        ))}
      </ul>

      {books.length === 0 ? (
        <Text tone="muted" className="py-16 text-center">
          {copy("emptyHint")}
        </Text>
      ) : null}

      <div className="mt-12 flex items-center justify-between gap-4 border-t border-hairline pt-6">
        <Text size="xs" tone="muted" className="novel-serif">
          {copy("lastUpdate")} · {books.at(-1)?.year}
        </Text>
        <Button variant="ghost" size="sm" muted render={<Link href={`${NOVEL_BASE}/library`} />}>
          {copy("colWork")}
        </Button>
      </div>
    </Container>
  );
}
