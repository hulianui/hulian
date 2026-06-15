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
  examples: [
    {
      title: "基础用法",
      description: "点击文件夹展开/收起，纸张扇形铺开，展开后纸张磁吸跟随鼠标。",
      code: `<Folder />`,
      render: () => (
        <Stage>
          <Folder />
        </Stage>
      ),
    },
    {
      title: "带内容纸张",
      description: "items 最多 3 张纸（多余截断、不足补空），展开后各自铺开承载内容。",
      code: `<Folder
  size={1.4}
  items={[
    <span key="1" className="flex h-full w-full items-center justify-center text-[8px] text-foreground">文档</span>,
    <span key="2" className="flex h-full w-full items-center justify-center text-[8px] text-foreground">图片</span>,
    <span key="3" className="flex h-full w-full items-center justify-center text-[8px] text-foreground">视频</span>,
  ]}
/>`,
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
      title: "自定义主体色",
      description: "color 喂任意 CSS 颜色（推荐 token），defaultOpen 让文件夹初始即展开。",
      code: `<Folder color="var(--color-chart-4)" defaultOpen size={1.2} />`,
      render: () => (
        <Stage>
          <Folder color="var(--color-chart-4)" defaultOpen size={1.2} />
        </Stage>
      ),
    },
    {
      title: "关闭磁吸",
      description: "disableMagnet 时展开后纸张不再随鼠标偏移，仅保留悬停放大。",
      code: `<Folder size={1.4} disableMagnet defaultOpen />`,
      render: () => (
        <Stage>
          <Folder size={1.4} disableMagnet defaultOpen />
        </Stage>
      ),
    },
  ],

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
