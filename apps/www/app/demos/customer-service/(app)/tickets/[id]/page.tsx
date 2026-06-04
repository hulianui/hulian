import { TicketDetail } from "../../../_components/ticket-detail";
import { tickets } from "../../../_data/tickets";

// www 为 output:export 静态导出，动态路由须枚举所有 id（generateStaticParams 仅服务端）。
export function generateStaticParams() {
  return tickets.map((t) => ({ id: t.id }));
}

export default async function TicketDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <TicketDetail id={id} />;
}
