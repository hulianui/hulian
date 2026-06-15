import type { ShowcaseSpec } from "../showcase/types";
import { QRCode } from "./qrcode";

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
          logo={{ src: "/demo/avatar-12.jpg", size: 36 }}
        />
      ),
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
