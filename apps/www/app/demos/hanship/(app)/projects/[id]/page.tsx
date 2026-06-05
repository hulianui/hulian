import { ProjectOverview } from "../../../_components/project-overview";
import { projects } from "../../../_data/store";

// www 为 output:export 静态导出，动态路由须枚举所有 id（generateStaticParams 仅服务端）。
export function generateStaticParams() {
  return projects.map((p) => ({ id: p.id }));
}

export default async function ProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ProjectOverview id={id} />;
}
