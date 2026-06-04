import { CheckoutCashier } from "../../../_components/checkout-cashier";
import { checkouts } from "../../../_data/checkouts";

// www 为 output:export 静态导出，动态路由须枚举所有 id。
export function generateStaticParams() {
  return checkouts.map((c) => ({ id: c.id }));
}

export default async function CheckoutCashierPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <CheckoutCashier id={id} />;
}
