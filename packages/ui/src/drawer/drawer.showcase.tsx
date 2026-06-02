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
      >
        <div className="mt-auto flex justify-end gap-2 pt-4">
          <DrawerClose render={<Button variant="ghost">取消</Button>} />
          <DrawerClose render={<Button>保存</Button>} />
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
    `<Drawer>\n  <DrawerTrigger render={<Button>打开</Button>} />\n  <DrawerContent side="${p.side}" title="设置面板">\n    {/* 内容 */}\n  </DrawerContent>\n</Drawer>`,
};
