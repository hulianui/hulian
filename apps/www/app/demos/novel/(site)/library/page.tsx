"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  Button,
  Container,
  Heading,
  Progress,
  Segmented,
  Text,
} from "@hulianui/ui";
import { bookWordCount, novelBooks, type NovelDemoBook } from "../../_data/books";
import { savedChapterId } from "../../_lib/reading-progress";
import { BookCover } from "../../_components/book-cover";
import { formatWords } from "../../_lib/format";
import { copy } from "./page.content";

const NOVEL_BASE = "/demos/novel";

/** 读到的章在第几章（0 起）；没读过返回 -1。 */
function resumeIndex(book: NovelDemoBook, chapterId: string | null): number {
  if (!chapterId) return -1;
  return book.chapters.findIndex((chapter) => chapter.id === chapterId);
}

function ShelfCard({ book, resumable }: { book: NovelDemoBook; resumable: string | null }) {
  const index = resumeIndex(book, resumable);
  const started = index >= 0;
  const percent = started ? Math.round(((index + 1) / book.chapters.length) * 100) : 0;

  return (
    <article className="group flex flex-col">
      <div className="flex justify-start">
        <BookCover
          book={book}
          compact
          href={`${NOVEL_BASE}/books/${book.id}`}
          className="w-40 transition-transform duration-300 group-hover:-translate-y-1.5 motion-reduce:transition-none"
        />
      </div>

      <div className="mt-6 flex flex-1 flex-col">
        <div className="flex items-center gap-2">
          <Text size="xs" tone="muted" className="novel-serif tracking-[0.24em]">
            {book.genre}
          </Text>
          <span aria-hidden className="h-px w-6 bg-border" />
          <Text size="xs" tone="muted" numeric>
            {book.year}
          </Text>
        </div>

        <Heading level={3} size="lg" weight="normal" className="novel-serif mt-2">
          {book.title}
        </Heading>
        <Text size="sm" tone="muted" className="mt-1">
          {book.author}
        </Text>
        <Text size="sm" className="mt-3 leading-relaxed" lineClamp={2}>
          {book.tagline}
        </Text>

        {started ? (
          <div className="mt-4">
            <div className="mb-1.5 flex items-baseline justify-between gap-3">
              <Text size="xs" tone="muted" truncate>
                {copy("progress")} · {book.chapters[index]?.title}
              </Text>
              <Text size="xs" tone="muted" numeric>
                {percent}%
              </Text>
            </div>
            <Progress value={percent} aria-label={copy("progress")} />
          </div>
        ) : (
          <div className="mt-4 flex items-center gap-2">
            <Text size="xs" tone="muted" numeric>
              {book.chapters.length}
              {copy("unitChapters")}
            </Text>
            <span aria-hidden className="size-1 rounded-full bg-border" />
            <Text size="xs" tone="muted" numeric>
              {formatWords(bookWordCount(book))}
              {copy("unitWords")}
            </Text>
          </div>
        )}

        <div className="mt-5 flex items-center gap-2">
          <Button size="sm" render={<Link href={`${NOVEL_BASE}/read/${book.id}`} />}>
            {started ? copy("continueReading") : copy("read")}
          </Button>
          <Button
            size="sm"
            variant="ghost"
            muted
            render={<Link href={`${NOVEL_BASE}/books/${book.id}`} />}
          >
            {copy("details")}
          </Button>
        </div>
      </div>
    </article>
  );
}

export default function NovelLibraryPage() {
  const books = useMemo(() => novelBooks(), []);
  const [filter, setFilter] = useState("all");
  const [resume, setResume] = useState<Record<string, string | null>>({});

  // 进度只存在这台浏览器里，首屏不能读 —— 先渲染未读态，挂载后再补。
  useEffect(() => {
    const next: Record<string, string | null> = {};
    for (const book of books) next[book.id] = savedChapterId(book.id);
    setResume(next);
  }, [books]);

  const genres = useMemo(() => Array.from(new Set(books.map((book) => book.genre))), [books]);
  const shown = filter === "all" ? books : books.filter((book) => book.genre === filter);
  const featured = books[0];
  const totalChapters = books.reduce((total, book) => total + book.chapters.length, 0);
  const totalWords = books.reduce((total, book) => total + bookWordCount(book), 0);

  return (
    <div className="w-full">
      <section className="relative overflow-hidden border-b border-hairline">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_80%_at_80%_20%,var(--color-primary)/0.08,transparent)]"
        />
        <Container size="2xl" className="relative py-16 md:py-24">
          <div className="grid items-center gap-14 lg:grid-cols-[1.15fr_0.85fr]">
            <div>
              <Text size="xs" tone="muted" className="novel-serif tracking-[0.42em]">
                {copy("eyebrow")}
              </Text>
              <Heading
                level={1}
                size="4xl"
                weight="normal"
                balance
                className="novel-serif mt-6 leading-[1.18]"
              >
                {copy("heroLine1")}
                <br />
                {copy("heroLine2")}
              </Heading>
              <Text size="lg" tone="muted" className="mt-7 max-w-xl leading-relaxed">
                {copy("heroLead")}
              </Text>
              <div className="mt-9 flex flex-wrap items-center gap-3">
                <Button size="lg" render={<Link href={`${NOVEL_BASE}/read/${featured.id}`} />}>
                  {copy("startReading", featured.title)}
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  render={<Link href={`${NOVEL_BASE}/studio`} />}
                >
                  {copy("authorStudio")}
                </Button>
              </div>
              <div className="mt-12 flex flex-wrap items-baseline gap-x-8 gap-y-3">
                {[
                  [String(books.length), copy("unitPieces")],
                  [String(totalChapters), copy("unitChapters")],
                  [formatWords(totalWords), copy("unitWords")],
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
              </div>
            </div>

            <div className="flex justify-center lg:justify-end">
              <div className="relative">
                <div
                  aria-hidden
                  className="absolute -inset-10 -z-10 rounded-full bg-[radial-gradient(closest-side,var(--color-primary)/0.10,transparent)] blur-2xl"
                />
                <BookCover book={featured} className="w-40 sm:w-52" href={`${NOVEL_BASE}/books/${featured.id}`} />
                <div className="mt-6 max-w-[13rem]">
                  <Text size="sm" className="novel-serif italic leading-relaxed" tone="muted">
                    「{featured.excerpt}」
                  </Text>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      <Container size="2xl" className="py-14 md:py-20">
        <div className="flex flex-wrap items-end justify-between gap-5">
          <div>
            <Heading level={2} size="xl" weight="normal" className="novel-serif">
              {copy("shelfTitle")}
            </Heading>
            <Text size="sm" tone="muted" className="mt-2">
              {copy("shelfLead")}
            </Text>
          </div>
          <Segmented
            aria-label={copy("shelfTitle")}
            value={filter}
            onValueChange={setFilter}
            items={[
              { value: "all", label: copy("filterAll") },
              ...genres.map((genre) => ({ value: genre, label: genre })),
            ]}
          />
        </div>

        <div className="mt-10 grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
          {shown.map((book) => (
            <ShelfCard key={book.id} book={book} resumable={resume[book.id] ?? null} />
          ))}
        </div>

        <div className="mt-14 flex flex-wrap items-center justify-between gap-4 border-t border-hairline pt-6">
          <Text size="xs" tone="muted" className="novel-serif">
            {copy("finished")} · {totalChapters}
            {copy("unitChapters")} · {formatWords(totalWords)}
            {copy("unitWords")}
          </Text>
          <Button variant="ghost" size="sm" muted render={<Link href={`${NOVEL_BASE}/studio`} />}>
            {copy("authorStudio")}
          </Button>
        </div>
      </Container>
    </div>
  );
}
