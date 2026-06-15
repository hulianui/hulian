"use client";
import type { ShowcaseSpec } from "../showcase/types";
import { Magnet } from "./magnet";

/** 展示用居中舞台，给磁吸目标留出感应余量 */
function Stage({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-56 w-full max-w-xl items-center justify-center rounded-xl border border-border bg-surface">
      {children}
    </div>
  );
}

/** 复用的磁吸目标外观（瑚琏 token：primary 实心按钮） */
function Pill({ label = "把我拉过来" }: { label?: string }) {
  return (
    <span className="inline-flex items-center rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground shadow-md">
      {label}
    </span>
  );
}

export const magnetShowcase: ShowcaseSpec = {
  examples: [
    {
      title: "基础用法",
      description: "包裹任意内容，指针靠近感应区即磁吸跟随，离开平滑归位。",
      code: `<Magnet padding={100} magnetStrength={2}>
  <button className="rounded-full bg-primary px-6 py-3 text-primary-foreground">
    把我拉过来
  </button>
</Magnet>`,
      render: () => (
        <Stage>
          <Magnet padding={100} magnetStrength={2}>
            <Pill />
          </Magnet>
        </Stage>
      ),
    },
    {
      title: "强吸力",
      description: "magnetStrength 越小吸力越强；为 1 时内容几乎贴住指针。",
      code: `<Magnet padding={140} magnetStrength={1}>
  <button className="rounded-full bg-primary px-6 py-3 text-primary-foreground">
    强磁吸
  </button>
</Magnet>`,
      render: () => (
        <Stage>
          <Magnet padding={140} magnetStrength={1}>
            <Pill label="强磁吸" />
          </Magnet>
        </Stage>
      ),
    },
    {
      title: "大感应区 + 弱吸力",
      description: "padding 调大「远距离感应」，magnetStrength 调大让位移更克制。",
      code: `<Magnet padding={180} magnetStrength={5}>
  <span className="inline-flex h-16 w-16 items-center justify-center rounded-2xl border bg-surface shadow-md">
    ✦
  </span>
</Magnet>`,
      render: () => (
        <Stage>
          <Magnet padding={180} magnetStrength={5}>
            <span className="inline-flex h-16 w-16 items-center justify-center rounded-2xl border border-border bg-surface text-foreground shadow-md">
              ✦
            </span>
          </Magnet>
        </Stage>
      ),
    },
    {
      title: "禁用磁吸",
      description: "disabled 时停止牵引、内容静止居中，DOM 结构不变。",
      code: `<Magnet disabled>
  <button className="rounded-full bg-primary px-6 py-3 text-primary-foreground">
    已禁用
  </button>
</Magnet>`,
      render: () => (
        <Stage>
          <Magnet disabled>
            <Pill label="已禁用" />
          </Magnet>
        </Stage>
      ),
    },
  ],

  controls: [
    { prop: "padding", type: "number", defaultValue: 100, label: "感应半径 px" },
    { prop: "magnetStrength", type: "number", defaultValue: 2, label: "强度除数" },
    { prop: "disabled", type: "boolean", defaultValue: false, label: "禁用磁吸" },
  ],

  states: [
    {
      name: "default（默认参数·移动指针靠近）",
      render: () => (
        <Stage>
          <Magnet padding={100} magnetStrength={2}>
            <Pill />
          </Magnet>
        </Stage>
      ),
    },
    {
      name: "强吸力（strength=1·几乎贴住指针）",
      render: () => (
        <Stage>
          <Magnet padding={140} magnetStrength={1}>
            <Pill label="强磁吸" />
          </Magnet>
        </Stage>
      ),
    },
    {
      name: "弱吸力 + 大感应区（strength=5）",
      render: () => (
        <Stage>
          <Magnet padding={180} magnetStrength={5}>
            <span className="inline-flex h-16 w-16 items-center justify-center rounded-2xl border border-border bg-surface text-foreground shadow-md">
              ✦
            </span>
          </Magnet>
        </Stage>
      ),
    },
    {
      name: "disabled（不跟随·静止居中）",
      render: () => (
        <Stage>
          <Magnet disabled>
            <Pill label="已禁用" />
          </Magnet>
        </Stage>
      ),
    },
  ],

  renderWithProps: (p) => (
    <Stage>
      <Magnet
        padding={p.padding as number}
        magnetStrength={p.magnetStrength as number}
        disabled={p.disabled as boolean}
      >
        <Pill />
      </Magnet>
    </Stage>
  ),

  toCode: (p) =>
    [
      `<Magnet`,
      `  padding={${p.padding}}`,
      `  magnetStrength={${p.magnetStrength}}`,
      `  disabled={${p.disabled}}`,
      `>`,
      `  <button className="rounded-full bg-primary px-6 py-3 text-primary-foreground">`,
      `    把我拉过来`,
      `  </button>`,
      `</Magnet>`,
    ].join("\n"),
};
