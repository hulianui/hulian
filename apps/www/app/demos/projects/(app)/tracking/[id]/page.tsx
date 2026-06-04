import { ProjectDetail } from "../../../_components/project-detail";
import { projects } from "../../../_data/projects";

// www 为 output:export 静态导出，动态路由须枚举所有 id（generateStaticParams 仅服务端可导出，故本页保持 server）。
export function generateStaticParams() {
  return projects.map((p) => ({ id: p.id }));
}

export default async function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ProjectDetail id={id} />;
}
