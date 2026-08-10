"use client";
import { useState } from "react";
import type { ShowcaseSpec } from "../showcase/types";
import { ImageCropper } from "./image-cropper";

// 示例图：内联 SVG 人像剪影（无外网依赖，可被 canvas 同源导出）
const SAMPLE = `data:image/svg+xml;utf8,${encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="800">
    <defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#cdd9ff"/><stop offset="1" stop-color="#8fa8e8"/>
    </linearGradient></defs>
    <rect width="600" height="800" fill="url(#g)"/>
    <circle cx="300" cy="300" r="120" fill="#5b6b8c"/>
    <ellipse cx="300" cy="620" rx="210" ry="170" fill="#5b6b8c"/>
  </svg>`,
)}`;

function IdPhotoDemo({ aspect = 5 / 7, maxZoom = 3 }: { aspect?: number; maxZoom?: number }) {
  const [result, setResult] = useState<string | null>(null);
  return (
    <div className="flex w-96 max-w-full flex-col gap-3">
      <ImageCropper
        image={SAMPLE}
        aspect={aspect}
        maxZoom={maxZoom}
        maxBytes={200 * 1024}
        onCropped={(blob) => setResult(`已出图 ${blob.type} · ${(blob.size / 1024).toFixed(1)} KB`)}
        onCancel={() => setResult("已取消")}
      />
      {result && <div className="text-sm text-muted-foreground">{result}</div>}
    </div>
  );
}

export const imageCropperShowcase: ShowcaseSpec = {
  examples: [
    {
      title: "证件照 5:7",
      description: "默认宽高比 5:7（1/2 寸证件照同比例）。拖拽对位、滑杆缩放，确认后产出目标尺寸 Blob，存储/上传由消费者接管。",
      code: `<ImageCropper
  image={objectUrl}
  aspect={5 / 7}
  maxBytes={200 * 1024}
  onCropped={(blob) => /* 存储 / 上传 */}
  onCancel={() => /* 关闭 */}
/>`,
      render: () => (
        <div className="w-96 max-w-full">
          <ImageCropper image={SAMPLE} aspect={5 / 7} maxBytes={200 * 1024} onCropped={() => {}} onCancel={() => {}} />
        </div>
      ),
    },
    {
      title: "方形 1:1",
      description: "aspect=1 适合头像；outputWidth 控制出图边长。",
      code: `<ImageCropper
  image={objectUrl}
  aspect={1}
  outputWidth={320}
  onCropped={(blob) => upload(blob)}
/>`,
      render: () => (
        <div className="w-96 max-w-full">
          <ImageCropper image={SAMPLE} aspect={1} outputWidth={320} onCropped={() => {}} onCancel={() => {}} />
        </div>
      ),
    },
    {
      title: "提高缩放上限",
      description: "maxZoom 放大可裁更近的局部；滑杆量程随之变化。",
      code: `<ImageCropper image={objectUrl} aspect={1} maxZoom={5} onCropped={save} />`,
      render: () => (
        <div className="w-96 max-w-full">
          <ImageCropper image={SAMPLE} aspect={1} maxZoom={5} onCropped={() => {}} />
        </div>
      ),
    },
  ],
  controls: [
    { prop: "aspect", type: "select", options: ["5/7", "1", "4/3"], defaultValue: "5/7" },
    { prop: "maxZoom", type: "number", defaultValue: 3 },
  ],
  states: [
    { name: "证件照 5:7", render: () => <IdPhotoDemo /> },
    { name: "方形 1:1", render: () => <IdPhotoDemo aspect={1} /> },
  ],
  renderWithProps: (p) => {
    const aspect =
      (p.aspect as string) === "1" ? 1 : (p.aspect as string) === "4/3" ? 4 / 3 : 5 / 7;
    return <IdPhotoDemo aspect={aspect} maxZoom={(p.maxZoom as number) || 3} />;
  },
  toCode: (p) =>
    `<ImageCropper\n  image={objectUrl}\n  aspect={${(p.aspect as string) ?? "5/7"}}\n  maxZoom={${
      (p.maxZoom as number) || 3
    }}\n  maxBytes={200 * 1024}\n  onCropped={(blob) => /* 存储/上传 */}\n  onCancel={() => /* 关闭 */}\n/>`,
};
