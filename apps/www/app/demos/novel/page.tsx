import { novelBooks } from "./_data/books";
import { ReaderClient } from "./_components/reader-client";

export default function NovelEntryPage() {
  const book = novelBooks().find((item) => item.id === "ferry");
  if (!book) return null;
  return <ReaderClient book={book} />;
}
