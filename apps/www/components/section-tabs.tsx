"use client";
import { usePathname, useRouter } from "next/navigation";
import { Segmented } from "@hulianui/ui";
import { useIntlayer } from "next-intlayer";
import { stripDocsBasePath, withDocsBasePath } from "../lib/docs-locale";

// 侧栏顶部「组件 / 主题」切换 —— dogfood 自家 Segmented（radio 语义 + 滑块指示器）。
// Segmented 是 value 受控、渲染 <button>（不能塞 <a>），故用 value=当前分区 + onValueChange→router.push 桥接导航。
// 注：区块/页面/模板 是独立画廊（/blocks /pages /demos），不在此组件文档切换器内。
export function SectionTabs() {
  const content = useIntlayer("shared-chrome");
  const tabs = [
    { value: "/components", label: content.components },
    { value: "/theme", label: content.theme },
  ];
  const pathname = usePathname();
  const router = useRouter();
  const active = stripDocsBasePath(pathname).startsWith("/theme") ? "/theme" : "/components";
  return (
    <Segmented
      aria-label={content.docsSections}
      size="sm"
      items={tabs}
      value={active}
      onValueChange={(v) => router.push(stripDocsBasePath(withDocsBasePath(v)))}
      className="w-full"
    />
  );
}
