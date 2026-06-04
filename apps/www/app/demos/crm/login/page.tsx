import Link from "next/link";
import { Button, Empty } from "@hulian/ui";

// 登录页占位（slice 5 用 @hulian/ui 的 LoginForm 替换为真实登录页）。无后台外壳。
export default function CrmLoginPage() {
  return (
    <main className="grid h-dvh place-items-center bg-bg px-6">
      <Empty title="登录 · 建设中" description="该页面将用 LoginForm 组件搭建。">
        <Button render={<Link href="/demos/crm" />}>进入后台</Button>
      </Empty>
    </main>
  );
}
