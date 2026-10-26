import { notFound } from "next/navigation";
import { novelBooks } from "../../_data/books";
import { ReaderClient } from "../../_components/reader-client";

export function generateStaticParams() {
  return novelBooks().map((book) => ({ id: book.id }));
}

export default async function NovelReadPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const book = novelBooks().find((item) => item.id === id);
  if (!book) notFound();
  return <ReaderClient book={book} />;
}
