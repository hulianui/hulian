"use client";
import type { ShowcaseSpec } from "../showcase/types";
import { Lens } from "./lens";

const IMG = "/demo/photo-lens.jpg";

function Demo({ zoom = 1.8 }: { zoom?: number }) {
  return (
    <Lens zoom={zoom} className="w-80 rounded-[var(--radius)] border border-border">
      <img src={IMG} alt="森林" className="block aspect-[4/3] w-full object-cover" />
    </Lens>
  );
}

export const lensShowcase: ShowcaseSpec = {
  examples: [
    {
      title: "基础用法",
      description: "包裹图片，悬停时在光标处显示圆形放大镜。",
      code: `<Lens className="w-80 rounded-[var(--radius)] border border-border">
  <img src="/photo.jpg" alt="森林" className="block aspect-[4/3] w-full object-cover" />
</Lens>`,
      render: () => <Demo />,
    },
    {
      title: "放大倍数",
      description: "zoom 控制放大镜下的缩放比例，倍数越大细节越突出。",
      code: `<Lens zoom={2.6} className="w-80 rounded-[var(--radius)] border border-border">
  <img src="/photo.jpg" alt="森林" className="block aspect-[4/3] w-full object-cover" />
</Lens>`,
      render: () => <Demo zoom={2.6} />,
    },
    {
      title: "镜片尺寸",
      description: "size 设定放大镜直径(px)，搭配 zoom 调出合适的观察窗。",
      code: `<Lens zoom={2} size={200} className="w-80 rounded-[var(--radius)] border border-border">
  <img src="/photo.jpg" alt="森林" className="block aspect-[4/3] w-full object-cover" />
</Lens>`,
      render: () => (
        <Lens zoom={2} size={200} className="w-80 rounded-[var(--radius)] border border-border">
          <img src={IMG} alt="森林" className="block aspect-[4/3] w-full object-cover" />
        </Lens>
      ),
    },
  ],
  controls: [{ prop: "zoom", type: "number", defaultValue: 1.8 }],
  states: [{ name: "default", render: () => <Demo /> }],
  renderWithProps: (p) => <Demo zoom={(p.zoom as number) ?? 1.8} />,
  toCode: (p) => `<Lens zoom={${(p.zoom as number) ?? 1.8}}>\n  <img src="/photo.jpg" />\n</Lens>`,
};
