import { DeployDetail } from "../../../_components/deploy-detail";
import { deploys } from "../../../_data/store";

export function generateStaticParams() {
  return deploys.map((d) => ({ id: d.id }));
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <DeployDetail id={id} />;
}
