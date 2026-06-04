import { CustomerDetail } from "../../../_components/customer-detail";
import { customers } from "../../../_data/customers";

// www 为 output:export 静态导出，动态路由须枚举所有 id（generateStaticParams 仅服务端可导出，故本页保持 server）。
export function generateStaticParams() {
  return customers.map((c) => ({ id: c.id }));
}

export default async function CustomerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <CustomerDetail id={id} />;
}
