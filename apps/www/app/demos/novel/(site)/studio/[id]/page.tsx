import { notFound } from "next/navigation";
import { novelBooks } from "../../../_data/books";
import { EditorClient } from "../../../_components/editor-client";

export function generateStaticParams() {
  return novelBooks().map((book) => ({ id: book.id }));
}

export default async function NovelStudioBookPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const book = novelBooks().find((item) => item.id === id);
  if (!book) notFound();
  return <EditorClient book={book} />;
}
