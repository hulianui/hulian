import { notFound } from "next/navigation";
import { getService, services } from "../../../_data/services";
import { BookingClient } from "./_booking-client";

// 静态导出：generateStaticParams 导出全部 service id（hulian-output-export-dynamic-route）
export function generateStaticParams(): { id: string }[] {
  return services.map((s) => ({ id: s.id }));
}

interface Props {
  params: Promise<{ id: string }>;
}

// server page：只做数据查找 + 渲染 client 子组件
export default async function ServiceDetailPage({ params }: Props) {
  const { id } = await params;
  const service = getService(id);
  if (!service) notFound();
  return <BookingClient service={service} />;
}
