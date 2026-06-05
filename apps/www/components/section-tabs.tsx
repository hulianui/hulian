"use client";
import { usePathname, useRouter } from "next/navigation";
import { Segmented } from "@hulianui/ui";

const TABS = [
  { value: "/components", label: "组件" },
  { value: "/theme", label: "主题" },
];

// 侧栏顶部「组件 / 主题」切换 —— dogfood 自家 Segmented（radio 语义 + 滑块指示器）。
// Segmented 是 value 受控、渲染 <button>（不能塞 <a>），故用 value=当前分区 + onValueChange→router.push 桥接导航。
// 注：区块/页面/模板 是独立画廊（/blocks /pages /demos），不在此组件文档切换器内。
export function SectionTabs() {
  const pathname = usePathname();
  const router = useRouter();
  const active = pathname.startsWith("/theme") ? "/theme" : "/components";
  return (
    <Segmented
      aria-label="文档分区"
      size="sm"
      items={TABS}
      value={active}
      onValueChange={(v) => router.push(v)}
      className="w-full"
    />
  );
}
