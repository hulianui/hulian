import { Empty } from "@hulianui/ui";

/** 切片未完成页面的临时占位（后续用 @hulianui/ui 组件替换为真实页面）。 */
export function Placeholder({ title }: { title: string }) {
  return (
    <div className="grid min-h-[60vh] place-items-center">
      <Empty title={`${title} · 建设中`} description="该页面将在后续切片用 @hulianui/ui 组件搭建。" />
    </div>
  );
}
