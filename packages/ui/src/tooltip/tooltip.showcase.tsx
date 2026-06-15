"use client";
import type { ShowcaseSpec } from "../showcase/types";
import { Tooltip, TooltipTrigger, TooltipProvider, TooltipContent } from "./tooltip";
import { Button } from "../button/button";

type Side = "top" | "right" | "bottom" | "left";
type Align = "start" | "center" | "end";

function Demo({ side = "top", align = "center", text = "瑚琏提示" }: { side?: Side; align?: Align; text?: string }) {
  // delay=0 让 hover 即开，截图/实看稳态（delay 在 Provider 不在 Root）。
  return (
    <TooltipProvider delay={0} closeDelay={0}>
      <Tooltip>
        <TooltipTrigger render={<Button variant="outline">悬停查看</Button>} />
        <TooltipContent side={side} align={align}>
          {text}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export const tooltipShowcase: ShowcaseSpec = {
  examples: [
    {
      title: "基础用法",
      description: "悬停 / 聚焦触发器即显示简短提示；TooltipProvider 统一管理打开延迟。",
      code: `<TooltipProvider>
  <Tooltip>
    <TooltipTrigger render={<Button variant="outline">悬停查看</Button>} />
    <TooltipContent>瑚琏提示</TooltipContent>
  </Tooltip>
</TooltipProvider>`,
      render: () => <Demo />,
    },
    {
      title: "提示方位",
      description: "side 控制提示出现的方向，箭头自动指向触发器。",
      code: `<>
  <Tooltip>
    <TooltipTrigger render={<Button variant="outline">向右</Button>} />
    <TooltipContent side="right">向右</TooltipContent>
  </Tooltip>
  <Tooltip>
    <TooltipTrigger render={<Button variant="outline">向下</Button>} />
    <TooltipContent side="bottom">向下</TooltipContent>
  </Tooltip>
</>`,
      render: () => (
        <div className="flex flex-wrap gap-3">
          <Demo side="right" text="向右" />
          <Demo side="bottom" text="向下" />
        </div>
      ),
    },
    {
      title: "长文案",
      description: "较长提示自动按最大宽度换行。",
      code: `<TooltipProvider>
  <Tooltip>
    <TooltipTrigger render={<Button variant="outline">悬停查看</Button>} />
    <TooltipContent>较长的提示文案验证最大宽度与换行表现</TooltipContent>
  </Tooltip>
</TooltipProvider>`,
      render: () => <Demo text="较长的提示文案验证最大宽度与换行表现" />,
    },
  ],
  controls: [
    { prop: "side", type: "select", options: ["top", "right", "bottom", "left"], defaultValue: "top" },
    { prop: "align", type: "select", options: ["start", "center", "end"], defaultValue: "center" },
    { prop: "text", type: "text", defaultValue: "瑚琏提示", label: "提示文案" },
  ],
  states: [
    { name: "top", render: () => <Demo side="top" /> },
    { name: "right", render: () => <Demo side="right" text="向右" /> },
    { name: "bottom", render: () => <Demo side="bottom" text="向下" /> },
    { name: "left", render: () => <Demo side="left" text="向左" /> },
    { name: "长文案", render: () => <Demo text="较长的提示文案验证最大宽度与换行表现" /> },
  ],
  renderWithProps: (p) => <Demo side={p.side as Side} align={p.align as Align} text={p.text as string} />,
  toCode: (p) =>
    `<Tooltip>\n  <TooltipTrigger render={<Button>悬停查看</Button>} />\n  <TooltipContent side="${p.side}" align="${p.align}">${p.text}</TooltipContent>\n</Tooltip>`,
};
