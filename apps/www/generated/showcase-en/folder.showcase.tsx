"use client";
import type { ShowcaseSpec } from "../../../../packages/ui/src/showcase/types";
import { Folder } from "../../../../packages/ui/src/folder/folder";
function Stage({ children }: {
    children: React.ReactNode;
}) {
    return (<div className="flex h-56 w-full max-w-xl items-center justify-center rounded-xl border border-border bg-surface">
      {children}
    </div>);
}
export const folderShowcase: ShowcaseSpec = {
    examples: [
        {
            title: "Basic usage",
            description: "Click on the folder to expand/collapse, and the paper will spread out in a fan shape. After unfolding, the paper will magnetically follow the mouse.",
            code: `<Folder />`,
            render: () => (<Stage>
          <Folder />
        </Stage>),
        },
        {
            title: "Paper with content",
            description: "items Up to 3 sheets of paper (excessive truncation, insufficient filling), each unfolded to carry the content.",
            code: `<Folder
  size={1.4}
  items={[
    <span key="1" className="flex h-full w-full items-center justify-center text-[8px] text-foreground">Document</span>,
    <span key="2" className="flex h-full w-full items-center justify-center text-[8px] text-foreground">Picture</span>,
    <span key="3" className="flex h-full w-full items-center justify-center text-[8px] text-foreground">Video</span>,
  ]}
/>`,
            render: () => (<Stage>
          <Folder size={1.4} items={[
                    <span key="1" className="flex h-full w-full items-center justify-center text-[8px] text-foreground">
                Documentation
              </span>,
                    <span key="2" className="flex h-full w-full items-center justify-center text-[8px] text-foreground">
                Pictures
              </span>,
                    <span key="3" className="flex h-full w-full items-center justify-center text-[8px] text-foreground">
                Video
              </span>,
                ]}/>
        </Stage>),
        },
        {
            title: "Customize body color",
            description: "color Feed any CSS color (token is recommended), defaultOpen lets the folder expand initially.",
            code: `<Folder color="var(--color-chart-4)" defaultOpen size={1.2} />`,
            render: () => (<Stage>
          <Folder color="var(--color-chart-4)" defaultOpen size={1.2}/>
        </Stage>),
        },
        {
            title: "Turn off magnetic suction",
            description: "disableMagnet is expanded, the paper will no longer shift with the mouse, and only hover magnification will be retained.",
            code: `<Folder size={1.4} disableMagnet defaultOpen />`,
            render: () => (<Stage>
          <Folder size={1.4} disableMagnet defaultOpen/>
        </Stage>),
        },
    ],
    controls: [
        { prop: "size", type: "number", defaultValue: 1, label: "Zoom factor" },
        {
            prop: "color",
            type: "select",
            options: [
                "var(--color-primary)",
                "var(--color-chart-1)",
                "var(--color-chart-2)",
                "var(--color-chart-4)",
            ],
            defaultValue: "var(--color-primary)",
            label: "Main color token",
        },
        {
            prop: "disableMagnet",
            type: "boolean",
            defaultValue: false,
            label: "Turn off magnetic suction",
        },
    ],
    states: [
        {
            name: "default (click to expand)",
            render: () => (<Stage>
          <Folder />
        </Stage>),
        },
        {
            name: "With content (max. 3 sheets)",
            render: () => (<Stage>
          <Folder size={1.4} items={[
                    <span key="1" className="flex h-full w-full items-center justify-center text-[8px] text-foreground">
                Documentation
              </span>,
                    <span key="2" className="flex h-full w-full items-center justify-center text-[8px] text-foreground">
                Pictures
              </span>,
                    <span key="3" className="flex h-full w-full items-center justify-center text-[8px] text-foreground">
                Video
              </span>,
                ]}/>
        </Stage>),
        },
        {
            name: "Custom color + default expansion",
            render: () => (<Stage>
          <Folder color="var(--color-chart-4)" defaultOpen size={1.2}/>
        </Stage>),
        },
    ],
    renderWithProps: (p) => (<Stage>
      <Folder size={p.size as number} color={p.color as string} disableMagnet={p.disableMagnet as boolean} items={[<i key="a"/>, <i key="b"/>, <i key="c"/>]}/>
    </Stage>),
    toCode: (p) => [
        `<Folder`,
        `  size={${p.size}}`,
        `  color="${p.color}"`,
        `  disableMagnet={${p.disableMagnet}}`,
        `  items={[<DocIcon />, <ImgIcon />, <VideoIcon />]}`,
        `/>`,
    ].join("\n"),
};
