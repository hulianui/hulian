"use client";
import type { ShowcaseSpec } from "../showcase/types";
import { OrbitImages } from "./orbit-images";
import type { OrbitShape } from "./orbit-images.types";

/** 展示用中性底容器，给轨道流转留出对比与呼吸空间 */
function Stage({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative mx-auto w-full max-w-lg overflow-hidden rounded-xl border border-border bg-surface p-4">
      {children}
    </div>
  );
}

/** 一组示意性的彩色圆牌作为轨道子项（无外链图片依赖） */
function chips(n: number) {
  const tones = [
    "var(--color-chart-1)",
    "var(--color-chart-2)",
    "var(--color-chart-3)",
    "var(--color-chart-4)",
    "var(--color-chart-5)",
  ];
  return Array.from({ length: n }, (_, i) => (
    <div
      key={i}
      className="grid h-full w-full place-items-center rounded-full text-xs font-semibold text-background shadow-sm"
      style={{ background: tones[i % tones.length] }}
    >
      {i + 1}
    </div>
  ));
}

export const orbitImagesShowcase: ShowcaseSpec = {
  examples: [
    {
      title: "基础用法",
      description: "椭圆轨道等距铺满子项，匀速环绕；centerContent 叠静态中心。",
      code: `<OrbitImages
  items={images.map((src) => (
    <img key={src} src={src} alt="" className="h-full w-full rounded-full object-cover" />
  ))}
  shape="ellipse"
  duration={24}
  itemSize={48}
  showPath
  centerContent={<span className="text-sm font-semibold">瑚琏</span>}
/>`,
      render: () => (
        <Stage>
          <OrbitImages
            items={chips(6)}
            shape="ellipse"
            duration={24}
            itemSize={48}
            showPath
            centerContent={
              <span className="text-sm font-semibold text-foreground">瑚琏</span>
            }
          />
        </Stage>
      ),
    },
    {
      title: "圆形轨道",
      description: "shape=circle 配 radius 控制圈径，更多子项均匀分布。",
      code: `<OrbitImages
  items={avatars}
  shape="circle"
  radius={260}
  duration={30}
  itemSize={44}
/>`,
      render: () => (
        <Stage>
          <OrbitImages
            items={chips(8)}
            shape="circle"
            radius={260}
            duration={30}
            itemSize={44}
          />
        </Stage>
      ),
    },
    {
      title: "星形轨道·反向",
      description: "shape=star 走星形路径，direction=reverse 让子项反向流转。",
      code: `<OrbitImages
  items={avatars}
  shape="star"
  radius={300}
  duration={28}
  itemSize={40}
  direction="reverse"
  showPath
/>`,
      render: () => (
        <Stage>
          <OrbitImages
            items={chips(5)}
            shape="star"
            radius={300}
            duration={28}
            itemSize={40}
            direction="reverse"
            showPath
          />
        </Stage>
      ),
    },
    {
      title: "无穷符号·鱼贯出发",
      description: "shape=infinity 走 ∞ 路径；fill=false 让子项从同一起点鱼贯出发。",
      code: `<OrbitImages
  items={avatars}
  shape="infinity"
  radiusX={620}
  radiusY={220}
  duration={20}
  itemSize={44}
  fill={false}
  showPath
/>`,
      render: () => (
        <Stage>
          <OrbitImages
            items={chips(4)}
            shape="infinity"
            radiusX={620}
            radiusY={220}
            duration={20}
            itemSize={44}
            fill={false}
            showPath
          />
        </Stage>
      ),
    },
  ],

  controls: [
    {
      prop: "shape",
      type: "select",
      options: [
        "ellipse",
        "circle",
        "square",
        "triangle",
        "star",
        "heart",
        "infinity",
        "wave",
      ],
      defaultValue: "ellipse",
      label: "轨道形状",
    },
    { prop: "duration", type: "number", defaultValue: 24, label: "一圈秒数" },
    { prop: "itemSize", type: "number", defaultValue: 48, label: "子项尺寸 px" },
    { prop: "rotation", type: "number", defaultValue: -8, label: "倾斜角 deg" },
    { prop: "showPath", type: "boolean", defaultValue: false, label: "描出轨道" },
    { prop: "fill", type: "boolean", defaultValue: true, label: "等距铺满" },
  ],

  states: [
    {
      name: "default（椭圆轨道·等距铺满）",
      render: () => (
        <Stage>
          <OrbitImages
            items={chips(6)}
            shape="ellipse"
            duration={24}
            itemSize={48}
            showPath
            centerContent={
              <span className="text-sm font-semibold text-foreground">瑚琏</span>
            }
          />
        </Stage>
      ),
    },
    {
      name: "圆形轨道",
      render: () => (
        <Stage>
          <OrbitImages
            items={chips(8)}
            shape="circle"
            radius={260}
            duration={30}
            itemSize={44}
          />
        </Stage>
      ),
    },
    {
      name: "星形轨道·反向",
      render: () => (
        <Stage>
          <OrbitImages
            items={chips(5)}
            shape="star"
            radius={300}
            duration={28}
            itemSize={40}
            direction="reverse"
            showPath
          />
        </Stage>
      ),
    },
    {
      name: "无穷符号·鱼贯出发",
      render: () => (
        <Stage>
          <OrbitImages
            items={chips(4)}
            shape="infinity"
            radiusX={620}
            radiusY={220}
            duration={20}
            itemSize={44}
            fill={false}
            showPath
          />
        </Stage>
      ),
    },
  ],

  renderWithProps: (p) => (
    <Stage>
      <OrbitImages
        items={chips(6)}
        shape={p.shape as OrbitShape}
        duration={p.duration as number}
        itemSize={p.itemSize as number}
        rotation={p.rotation as number}
        showPath={p.showPath as boolean}
        fill={p.fill as boolean}
      />
    </Stage>
  ),

  toCode: (p) =>
    [
      `<OrbitImages`,
      `  items={images.map((src) => (`,
      `    <img key={src} src={src} alt="" className="h-full w-full rounded-full object-cover" />`,
      `  ))}`,
      `  shape="${p.shape}"`,
      `  duration={${p.duration}}`,
      `  itemSize={${p.itemSize}}`,
      `  rotation={${p.rotation}}`,
      `  showPath={${p.showPath}}`,
      `  fill={${p.fill}}`,
      `/>`,
    ].join("\n"),
};
