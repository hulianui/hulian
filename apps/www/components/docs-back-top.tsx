"use client";
import { BackTop } from "@hulianui/ui";

// dogfood：文档站的滚动体是 <main overflow-y-auto>（非 window），
// 故 target 指向它。function prop 不能跨 RSC 边界传，这层客户端包装承接。
export function DocsBackTop() {
  return <BackTop target={() => document.querySelector("main")} visibilityHeight={300} />;
}
