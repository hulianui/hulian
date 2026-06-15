"use client";
import type { ShowcaseSpec } from "../showcase/types";
import { Popover, PopoverTrigger, PopoverClose, PopoverContent } from "./popover";
import { Button } from "../button/button";

type Side = "top" | "right" | "bottom" | "left";
type Align = "start" | "center" | "end";

function Demo({
  side = "bottom",
  align = "center",
  title = "瑚琏弹层",
  withClose = true,
}: { side?: Side; align?: Align; title?: string; withClose?: boolean }) {
  return (
    <Popover>
      <PopoverTrigger render={<Button>打开弹层</Button>} />
      <PopoverContent side={side} align={align} title={title} description="点击外部或 Esc 关闭。">
        <div className="flex justify-end gap-2">
          {withClose && <PopoverClose render={<Button variant="ghost">取消</Button>} />}
          <PopoverClose render={<Button>确定</Button>} />
        </div>
      </PopoverContent>
    </Popover>
  );
}

export const popoverShowcase: ShowcaseSpec = {
  examples: [
    {
      title: "基础用法",
      description: "点击触发器弹出浮层，点外部或 Esc 关闭；带标题 + 说明 + 操作区。",
      code: `<Popover>
  <PopoverTrigger render={<Button>打开弹层</Button>} />
  <PopoverContent title="瑚琏弹层" description="点击外部或 Esc 关闭。">
    <div className="flex justify-end gap-2">
      <PopoverClose render={<Button variant="ghost">取消</Button>} />
      <PopoverClose render={<Button>确定</Button>} />
    </div>
  </PopoverContent>
</Popover>`,
      render: () => <Demo />,
    },
    {
      title: "弹出方位",
      description: "side 控制相对触发器的方位（top / right / bottom / left），箭头自动指向触发器。",
      code: `<>
  <Popover>
    <PopoverTrigger render={<Button>向上弹</Button>} />
    <PopoverContent side="top" title="向上弹" description="side=\\"top\\"。" />
  </Popover>
  <Popover>
    <PopoverTrigger render={<Button>向右弹</Button>} />
    <PopoverContent side="right" title="向右弹" description="side=\\"right\\"。" />
  </Popover>
</>`,
      render: () => (
        <div className="flex flex-wrap gap-3">
          <Demo side="top" title="向上弹" />
          <Demo side="right" title="向右弹" />
        </div>
      ),
    },
    {
      title: "对齐方式",
      description: "align 控制沿边对齐（start / center / end），配合 side 微调浮层落点。",
      code: `<Popover>
  <PopoverTrigger render={<Button>底部左对齐</Button>} />
  <PopoverContent side="bottom" align="start" title="左对齐" description="align=\\"start\\"。" />
</Popover>`,
      render: () => <Demo side="bottom" align="start" title="左对齐" />,
    },
  ],
  controls: [
    { prop: "side", type: "select", options: ["top", "right", "bottom", "left"], defaultValue: "bottom" },
    { prop: "align", type: "select", options: ["start", "center", "end"], defaultValue: "center" },
    { prop: "title", type: "text", defaultValue: "瑚琏弹层", label: "标题" },
    { prop: "withClose", type: "boolean", defaultValue: true, label: "含取消按钮" },
  ],
  states: [
    { name: "default", render: () => <Demo /> },
    { name: "含交互", render: () => <Demo withClose title="确认操作" /> },
    { name: "top", render: () => <Demo side="top" title="向上弹" /> },
    { name: "right", render: () => <Demo side="right" title="向右弹" /> },
  ],
  renderWithProps: (p) => (
    <Demo
      side={p.side as Side}
      align={p.align as Align}
      title={p.title as string}
      withClose={p.withClose as boolean}
    />
  ),
  toCode: (p) =>
    `<Popover>\n  <PopoverTrigger render={<Button>打开弹层</Button>} />\n  <PopoverContent side="${p.side}" align="${p.align}" title="${p.title}">\n    {/* 内容 + <PopoverClose/> */}\n  </PopoverContent>\n</Popover>`,
};
