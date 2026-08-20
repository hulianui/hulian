"use client";
import { useState } from "react";
import type { ShowcaseSpec } from "../showcase/types";
import { QRCode } from "./qrcode";
import { qrCodeSvgString } from "./qrcode-core";
import { qrCodeToPngDataUrl } from "./qrcode-png";
import { demoAsset } from "../lib/demo-asset";

const LOGO = demoAsset("/demo/avatar-12.jpg");

const EXPORT_VALUE = "https://hulian.dev/components/qrcode";

/** 导出演示：SVG 串直接可下载，PNG 走 canvas 转一道。 */
function ExportDemo() {
  const [png, setPng] = useState<string | null>(null);
  const svg = qrCodeSvgString({ value: EXPORT_VALUE, size: 120 });
  return (
    <div className="flex flex-wrap items-center gap-6">
      <QRCode value={EXPORT_VALUE} size={120} />
      <div className="flex flex-col gap-2">
        <button
          type="button"
          className="w-fit cursor-pointer rounded-[var(--radius)] border border-border px-3 py-1.5 text-xs font-medium hover:bg-surface-hover"
          onClick={() => qrCodeToPngDataUrl({ value: EXPORT_VALUE, pixelSize: 240 }).then(setPng)}
        >
          转成 PNG
        </button>
        <p className="max-w-xs break-all font-mono text-[10px] text-muted-foreground">
          {png ? `${png.slice(0, 48)}…（${Math.round(png.length / 1024)} KB）` : `SVG 串 ${svg.length} 字符`}
        </p>
        {png && <img src={png} alt="导出的 PNG" className="size-24 rounded-[var(--radius)] border border-border" />}
      </div>
    </div>
  );
}

export const qrcodeShowcase: ShowcaseSpec = {
  examples: [
    {
      title: "基础用法",
      description: "传入 value 即可，暗块默认继承 currentColor 吃主题。",
      code: `<QRCode value="https://hulian.dev" size={160} />`,
      render: () => <QRCode value="https://hulian.dev" size={160} />,
    },
    {
      title: "纠错级别",
      description: "level L/M/Q/H 逐级提高冗余（带 logo 建议 H）。",
      code: `<>
  <QRCode value="https://hulian.dev" size={120} level="L" />
  <QRCode value="https://hulian.dev" size={120} level="H" />
</>`,
      render: () => (
        <div className="flex items-center gap-6">
          <QRCode value="https://hulian.dev" size={120} level="L" />
          <QRCode value="https://hulian.dev" size={120} level="H" />
        </div>
      ),
    },
    {
      title: "中文内容",
      description: "内核已覆写为 UTF-8 编码，可直接编码中文。",
      code: `<QRCode value="瑚琏组件库 · 移动端二维码" size={140} level="H" />`,
      render: () => <QRCode value="瑚琏组件库 · 移动端二维码" size={140} level="H" />,
    },
    {
      title: "自定义配色",
      description: "color/background 显式指定，或用 text-* 工具类换暗块色。",
      code: `<QRCode
  value="https://hulian.dev"
  size={140}
  color="#0f172a"
  background="#f1f5f9"
/>`,
      render: () => (
        <QRCode
          value="https://hulian.dev"
          size={140}
          color="#0f172a"
          background="#f1f5f9"
        />
      ),
    },
    {
      title: "中心 Logo",
      description: "传 logo 在二维码中心嵌图，务必配 level=\"H\" 留足冗余。",
      code: `<QRCode
  value="https://hulian.dev"
  size={160}
  level="H"
  logo={{ src: "/logo.png", size: 36 }}
/>`,
      render: () => (
        <QRCode
          value="https://hulian.dev"
          size={160}
          level="H"
          logo={{ src: LOGO, size: 36 }}
        />
      ),
    },
    {
      title: "水印式 Logo",
      description: "excavate={false} 不抠空、配 opacity 做水印；不透明的 logo 不抠空会盖掉模块扫不出来。",
      code: `<QRCode
  value="https://hulian.dev"
  level="H"
  logo={{ src: "/logo.png", size: 60, excavate: false, opacity: 0.25 }}
/>`,
      render: () => (
        <QRCode
          value="https://hulian.dev"
          size={160}
          level="H"
          logo={{ src: LOGO, size: 60, excavate: false, opacity: 0.25 }}
        />
      ),
    },
    {
      title: "密度稳定 · 自动提级",
      description:
        "minVersion 钉住版本下限，让一组码密度一致（内容变长也不跳）；boostLevel 默认开，在不升版本的前提下白拿更高纠错。",
      code: `<>
  <QRCode value="A" minVersion={4} />
  <QRCode value="https://hulian.dev/components/qrcode" minVersion={4} />
</>`,
      render: () => (
        <div className="flex items-end gap-4">
          <QRCode value="A" size={120} minVersion={4} />
          <QRCode value="https://hulian.dev/components/qrcode" size={120} minVersion={4} />
        </div>
      ),
    },
    {
      title: "导出 SVG / PNG",
      description:
        "qrCodeSvgString 出独立 SVG 串（服务端也能用），qrCodeToPngDataUrl 出 PNG data URL（自动按 DPR 放大、默认白底）。",
      code: `import { qrCodeSvgString, qrCodeToPngDataUrl } from "@hulianui/ui"

// 下载 SVG
const svg = qrCodeSvgString({ value: url, size: 512 })
download(new Blob([svg], { type: "image/svg+xml" }), "qr.svg")

// 下载 PNG
const png = await qrCodeToPngDataUrl({ value: url, pixelSize: 512 })
Object.assign(document.createElement("a"), { href: png, download: "qr.png" }).click()`,
      render: () => <ExportDemo />,
    },
  ],
  controls: [],
  states: [
    {
      name: "基础（吃 token 色）",
      render: () => <QRCode value="https://hulian.dev" size={140} />,
    },
    {
      name: "高纠错 + 中文",
      render: () => <QRCode value="瑚琏组件库 · 移动端二维码" size={140} level="H" />,
    },
    {
      name: "主色暗块",
      render: () => (
        <QRCode value="https://hulian.dev" size={140} className="text-primary" />
      ),
    },
  ],
  renderWithProps: () => <QRCode value="https://hulian.dev" size={140} />,
  toCode: () => `<QRCode value="https://hulian.dev" size={160} level="M" />`,
};
