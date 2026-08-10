"use client";
import type { ShowcaseSpec } from "../showcase/types";
import { TextCursor } from "./text-cursor";

/** 展示用容器：给足高度让光标拖尾有空间，深色底凸显字形。 */
function Stage({
  children,
  dark = false,
}: {
  children?: React.ReactNode;
  dark?: boolean;
}) {
  return (
    <div
      className="relative h-64 w-full max-w-xl overflow-hidden rounded-xl"
      style={{ background: dark ? "oklch(0.14 0.02 255)" : undefined }}
    >
      {children}
    </div>
  );
}

const hint = (label: string, dark = false) => (
  <p
    className={
      dark
        ? "text-sm font-medium text-white/50"
        : "text-sm font-medium text-muted-foreground"
    }
  >
    {label}
  </p>
);

export const textCursorShowcase: ShowcaseSpec = {
  examples: [
    {
      title: "基础用法",
      description: "在容器内移动光标，沿轨迹按固定间距落下一串文本字形并随时间淡出。",
      code: `<div className="relative h-64 overflow-hidden rounded-xl">
  <TextCursor />
</div>`,
      render: () => (
        <Stage>
          <TextCursor className="rounded-xl">{hint("在此区域内移动光标 →")}</TextCursor>
        </Stage>
      ),
    },
    {
      title: "自定义字形 + 间距",
      description: "text 可传任意短字符串或 emoji，spacing 调大让拖尾更稀疏。",
      code: `<div className="relative h-64 overflow-hidden rounded-xl">
  <TextCursor text="✨" spacing={130} />
</div>`,
      render: () => (
        <Stage dark>
          <TextCursor text="✨" spacing={130} className="rounded-xl">
            {hint("✨ 划过留痕", true)}
          </TextCursor>
        </Stage>
      ),
    },
    {
      title: "字形保持水平",
      description: "followMouseDirection=false 时字形不随移动方向旋转，始终水平。",
      code: `<div className="relative h-64 overflow-hidden rounded-xl">
  <TextCursor text="瑚琏" followMouseDirection={false} spacing={60} />
</div>`,
      render: () => (
        <Stage>
          <TextCursor
            text="瑚琏"
            followMouseDirection={false}
            spacing={60}
            className="rounded-xl"
          >
            {hint("字形保持水平")}
          </TextCursor>
        </Stage>
      ),
    },
    {
      title: "静态长拖尾",
      description: "关闭 randomFloat 去掉微浮动，maxPoints 调大形成更长的稳定拖尾。",
      code: `<div className="relative h-64 overflow-hidden rounded-xl">
  <TextCursor text="●" randomFloat={false} maxPoints={12} spacing={45} />
</div>`,
      render: () => (
        <Stage dark>
          <TextCursor
            text="●"
            randomFloat={false}
            maxPoints={12}
            spacing={45}
            className="rounded-xl"
          >
            {hint("● 稳定拖尾", true)}
          </TextCursor>
        </Stage>
      ),
    },
  ],

  controls: [
    { prop: "text", type: "text", defaultValue: "瑚", label: "字形" },
    { prop: "spacing", type: "number", defaultValue: 80, label: "字形间距 px" },
    {
      prop: "followMouseDirection",
      type: "boolean",
      defaultValue: true,
      label: "沿方向旋转",
    },
    {
      prop: "randomFloat",
      type: "boolean",
      defaultValue: true,
      label: "随机浮动",
    },
    { prop: "maxPoints", type: "number", defaultValue: 5, label: "拖尾上限" },
  ],

  states: [
    {
      name: "default（在区域内移动光标）",
      render: () => (
        <Stage>
          <TextCursor className="rounded-xl">
            {hint("在此区域内移动光标 →")}
          </TextCursor>
        </Stage>
      ),
    },
    {
      name: "emoji + 大间距（稀疏拖尾）",
      render: () => (
        <Stage dark>
          <TextCursor text="✨" spacing={130} className="rounded-xl">
            {hint("✨ 划过留痕", true)}
          </TextCursor>
        </Stage>
      ),
    },
    {
      name: "水平字形（不随方向旋转）",
      render: () => (
        <Stage>
          <TextCursor
            text="瑚琏"
            followMouseDirection={false}
            spacing={60}
            className="rounded-xl"
          >
            {hint("字形保持水平")}
          </TextCursor>
        </Stage>
      ),
    },
    {
      name: "静态拖尾（关闭浮动 · 长拖尾）",
      render: () => (
        <Stage dark>
          <TextCursor
            text="●"
            randomFloat={false}
            maxPoints={12}
            spacing={45}
            className="rounded-xl"
          >
            {hint("● 稳定拖尾", true)}
          </TextCursor>
        </Stage>
      ),
    },
  ],

  renderWithProps: (p) => (
    <Stage>
      <TextCursor
        text={p.text as string}
        spacing={p.spacing as number}
        followMouseDirection={p.followMouseDirection as boolean}
        randomFloat={p.randomFloat as boolean}
        maxPoints={p.maxPoints as number}
        className="rounded-xl"
      >
        {hint("在此区域内移动光标 →")}
      </TextCursor>
    </Stage>
  ),

  toCode: (p) =>
    [
      `<div className="relative h-64 overflow-hidden rounded-xl">`,
      `  <TextCursor`,
      `    text=${JSON.stringify(p.text)}`,
      `    spacing={${p.spacing}}`,
      `    followMouseDirection={${p.followMouseDirection}}`,
      `    randomFloat={${p.randomFloat}}`,
      `    maxPoints={${p.maxPoints}}`,
      `  />`,
      `</div>`,
    ].join("\n"),
};
