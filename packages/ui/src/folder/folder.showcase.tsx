"use client";
import type { ShowcaseSpec } from "../showcase/types";
import { Folder } from "./folder";

/** 居中留白的中性底，让文件夹展开时纸张有空间铺开 */
function Stage({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-56 w-full max-w-xl items-center justify-center rounded-xl border border-border bg-surface">
      {children}
    </div>
  );
}

export const folderShowcase: ShowcaseSpec = {
  controls: [
    { prop: "size", type: "number", defaultValue: 1, label: "缩放倍数" },
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
      label: "主体色 token",
    },
    {
      prop: "disableMagnet",
      type: "boolean",
      defaultValue: false,
      label: "关闭磁吸",
    },
  ],

  states: [
    {
      name: "default（点击展开）",
      render: () => (
        <Stage>
          <Folder />
        </Stage>
      ),
    },
    {
      name: "带内容（最多 3 张纸）",
      render: () => (
        <Stage>
          <Folder
            size={1.4}
            items={[
              <span
                key="1"
                className="flex h-full w-full items-center justify-center text-[8px] text-foreground"
              >
                文档
              </span>,
              <span
                key="2"
                className="flex h-full w-full items-center justify-center text-[8px] text-foreground"
              >
                图片
              </span>,
              <span
                key="3"
                className="flex h-full w-full items-center justify-center text-[8px] text-foreground"
              >
                视频
              </span>,
            ]}
          />
        </Stage>
      ),
    },
    {
      name: "自定义色 + 默认展开",
      render: () => (
        <Stage>
          <Folder color="var(--color-chart-4)" defaultOpen size={1.2} />
        </Stage>
      ),
    },
  ],

  renderWithProps: (p) => (
    <Stage>
      <Folder
        size={p.size as number}
        color={p.color as string}
        disableMagnet={p.disableMagnet as boolean}
        items={[<i key="a" />, <i key="b" />, <i key="c" />]}
      />
    </Stage>
  ),

  toCode: (p) =>
    [
      `<Folder`,
      `  size={${p.size}}`,
      `  color="${p.color}"`,
      `  disableMagnet={${p.disableMagnet}}`,
      `  items={[<DocIcon />, <ImgIcon />, <VideoIcon />]}`,
      `/>`,
    ].join("\n"),
};
