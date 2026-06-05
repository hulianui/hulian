"use client";
import type { ShowcaseSpec } from "../showcase/types";
import { Drawer, DrawerTrigger, DrawerClose, DrawerContent } from "./drawer";
import type { DrawerSide } from "./drawer.types";
import { Button } from "../button/button";

function Demo({ side }: { side: DrawerSide }) {
  return (
    <Drawer>
      <DrawerTrigger render={<Button variant="outline">{`打开 ${side} 抽屉`}</Button>} />
      <DrawerContent
        side={side}
        title="设置面板"
        description="Esc / 点遮罩 / 关闭按钮均可收起；焦点锁在抽屉内。"
        footer={
          <>
            <DrawerClose render={<Button variant="outline">取消</Button>} />
            <DrawerClose render={<Button>保存</Button>} />
          </>
        }
      >
        {/* 长内容演示：正文区独立滚动，footer 始终钉底可见 */}
        <div className="flex flex-col gap-3 text-sm text-muted">
          {Array.from({ length: 12 }, (_, i) => (
            <p key={i}>配置项 {i + 1}：这里是一段较长的说明文案，用于演示正文超出时的滚动行为。</p>
          ))}
        </div>
      </DrawerContent>
    </Drawer>
  );
}

export const drawerShowcase: ShowcaseSpec = {
  controls: [
    {
      prop: "side",
      type: "select",
      options: ["left", "right", "top", "bottom"],
      defaultValue: "right",
      label: "side",
    },
  ],
  states: [
    { name: "right（默认）", render: () => <Demo side="right" /> },
    { name: "left", render: () => <Demo side="left" /> },
    { name: "top", render: () => <Demo side="top" /> },
    { name: "bottom", render: () => <Demo side="bottom" /> },
  ],
  renderWithProps: (p) => <Demo side={(p.side as DrawerSide) ?? "right"} />,
  toCode: (p) =>
    `<Drawer>\n  <DrawerTrigger render={<Button>打开</Button>} />\n  <DrawerContent\n    side="${p.side}"\n    title="设置面板"\n    footer={<>\n      <DrawerClose render={<Button variant="outline">取消</Button>} />\n      <DrawerClose render={<Button>保存</Button>} />\n    </>}\n  >\n    {/* 正文（超长自动滚动，footer 钉底） */}\n  </DrawerContent>\n</Drawer>`,
};
