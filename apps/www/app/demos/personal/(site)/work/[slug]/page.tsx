import { works } from "../../../_data/works";
import { WorkDetail } from "../../../_components/work-detail";

export function generateStaticParams() {
  return works.map((w: { slug: string }) => ({ slug: w.slug }));
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <WorkDetail slug={slug} />;
}
