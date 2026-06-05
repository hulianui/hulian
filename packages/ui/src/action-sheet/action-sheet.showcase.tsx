"use client";
import type { ShowcaseSpec } from "../showcase/types";
import { ActionSheet, ActionSheetContent, ActionSheetTrigger } from "./action-sheet";

function Demo() {
  return (
    <ActionSheet>
      <ActionSheetTrigger className="rounded-[var(--radius)] border border-border bg-surface px-4 py-2 text-sm text-foreground outline-none hover:bg-surface-hover focus-visible:ring-2 focus-visible:ring-ring">
        打开动作面板
      </ActionSheetTrigger>
      <ActionSheetContent
        title="图片操作"
        description="选择对这张图片的操作"
        actions={[
          { key: "save", label: "保存到相册" },
          { key: "share", label: "分享", description: "发送给好友或朋友圈" },
          { key: "delete", label: "删除", danger: true },
        ]}
      />
    </ActionSheet>
  );
}

export const actionSheetShowcase: ShowcaseSpec = {
  controls: [],
  states: [{ name: "标题 + 危险动作 + 取消", render: () => <Demo /> }],
  renderWithProps: () => <Demo />,
  toCode: () =>
    `<ActionSheet>\n  <ActionSheetTrigger>打开</ActionSheetTrigger>\n  <ActionSheetContent\n    title="图片操作"\n    actions={[\n      { key: "save", label: "保存" },\n      { key: "delete", label: "删除", danger: true },\n    ]}\n  />\n</ActionSheet>`,
};
