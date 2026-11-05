"use client";

import { copy } from "./book-detail-client.content";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Button, Container, Heading, Text } from "@hulianui/ui";
import { ChevronRight } from "lucide-react";
import { bookWordCount, chapterWordCount, type NovelDemoBook } from "../_data/books";
import { savedChapterId } from "../_lib/reading-progress";
import { chapterNumeral, formatWords } from "../_lib/format";
import { BookCover } from "./book-cover";

const NOVEL_BASE = "/demos/novel";

/** 中文阅读速度按 400 字/分钟估，只用来给一个「大概多久读完」的量级。 */
function readingMinutes(words: number): number {
  return Math.max(1, Math.round(words / 400));
}

function MetaRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-4 py-2.5">
      <Text size="xs" tone="muted" className="tracking-[0.12em]">
        {label}
      </Text>
      <Text size="sm">{value}</Text>
    </div>
  );
}

export function BookDetailClient({ book }: { book: NovelDemoBook }) {
  const [resume, setResume] = useState<string | null>(null);

  useEffect(() => {
    const chapterId = savedChapterId(book.id);
    setResume(chapterId && book.chapters.some((chapter) => chapter.id === chapterId) ? chapterId : null);
  }, [book.id, book.chapters]);

  const words = bookWordCount(book);
  const readHref = `${NOVEL_BASE}/read/${book.id}`;

  return (
    <Container size="xl" className="py-10 md:py-16">
      <Button
        variant="ghost"
        size="sm"
        muted
        render={<Link href={`${NOVEL_BASE}/library`} />}
      >
        ← {copy("backToLibrary")}
      </Button>

      <div className="mt-8 grid items-start gap-10 md:mt-12 md:grid-cols-[minmax(0,15rem)_minmax(0,1fr)] md:gap-16">
        <aside>
          <BookCover book={book} thickness="1.75rem" className="w-full max-w-[15rem]" />
          <div className="mt-8 divide-y divide-hairline border-y border-hairline">
            <MetaRow label={copy("author")} value={book.author} />
            <MetaRow label={copy("genre")} value={book.genre} />
            <MetaRow label={copy("year")} value={book.year} />
            <MetaRow
              label={copy("length")}
              value={`${copy("chapters", book.chapters.length)} · ${copy("words", formatWords(words))}`}
            />
            <MetaRow
              label={copy("status")}
              value={
                <>
                  {copy("finished")} · {copy("minutes", readingMinutes(words))}
                </>
              }
            />
          </div>
        </aside>

        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <Text size="xs" tone="muted" className="novel-serif tracking-[0.3em]">
              {book.genre}
            </Text>
            <span aria-hidden className="h-px w-8 bg-border" />
            <Text size="xs" tone="muted" numeric>
              {book.year}
            </Text>
          </div>

          <Heading
            level={1}
            size="3xl"
            weight="normal"
            balance
            className="novel-serif mt-4 leading-[1.2]"
          >
            {book.title}
          </Heading>
          <Text tone="muted" className="mt-3">
            {book.author}
          </Text>

          <blockquote className="novel-serif mt-9 border-l-2 border-foreground/25 pl-5 text-lg leading-loose text-muted-foreground">
            「{book.excerpt}」
          </blockquote>

          <Text className="mt-7 max-w-2xl leading-loose">{book.blurb}</Text>

          <div className="mt-9 flex flex-wrap items-center gap-3">
            <Button
              size="lg"
              render={<Link href={resume ? `${readHref}?c=${resume}` : readHref} />}
            >
              {resume ? copy("continueReading") : copy("read")}
            </Button>
            <Button
              size="lg"
              variant="outline"
              render={<Link href={`${NOVEL_BASE}/studio/${book.id}`} />}
            >
              {copy("edit")}
            </Button>
          </div>

          <section className="mt-14">
            <div className="flex items-baseline justify-between gap-4 border-b border-hairline pb-3">
              <Heading level={2} size="lg" weight="normal" className="novel-serif">
                {copy("chapterList")}
              </Heading>
              <Text size="xs" tone="muted" numeric>
                {copy("chapters", book.chapters.length)}
              </Text>
            </div>

            <ol className="divide-y divide-hairline">
              {book.chapters.map((chapter, index) => {
                const here = resume === chapter.id;
                return (
                  <li key={chapter.id}>
                    <Link
                      href={`${readHref}?c=${chapter.id}`}
                      className="group flex items-center gap-4 py-4 transition-colors hover:text-foreground"
                    >
                      <Text
                        as="span"
                        size="sm"
                        tone="muted"
                        className="novel-serif w-6 shrink-0 tabular-nums"
                      >
                        {chapterNumeral(index + 1)}
                      </Text>
                      <Text
                        as="span"
                        weight={here ? "medium" : "normal"}
                        className="novel-serif min-w-0 flex-1 truncate text-base"
                      >
                        {chapter.title}
                      </Text>
                      {here ? (
                        <Text as="span" size="xs" tone="muted" className="shrink-0">
                          {copy("continueReading")}
                        </Text>
                      ) : null}
                      <Text as="span" size="xs" tone="muted" numeric className="shrink-0">
                        {formatWords(chapterWordCount(chapter))}
                      </Text>
                      <ChevronRight
                        aria-hidden
                        className="size-4 shrink-0 text-muted-foreground/50 transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none"
                      />
                    </Link>
                  </li>
                );
              })}
            </ol>
          </section>
        </div>
      </div>
    </Container>
  );
}
