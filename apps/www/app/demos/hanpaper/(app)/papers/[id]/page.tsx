import { PaperWorkspace } from "../../../_components/paper-workspace";
import { papers } from "../../../_data/papers";

export function generateStaticParams() {
  return papers.map((p) => ({ id: p.id }));
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <PaperWorkspace id={id} />;
}
