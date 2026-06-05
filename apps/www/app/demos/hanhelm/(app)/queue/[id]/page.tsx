import { TaskDetail } from "../../../_components/task-detail";
import { TASKS } from "../../../_data/tasks";

// www 为 output:export 静态导出，动态路由须枚举所有 id（generateStaticParams 仅服务端）。
export function generateStaticParams() {
  return TASKS.map((t) => ({ id: t.id }));
}

export default async function TaskDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <TaskDetail id={id} />;
}
