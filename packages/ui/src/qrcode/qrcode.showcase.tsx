import type { ShowcaseSpec } from "../showcase/types";
import { QRCode } from "./qrcode";

export const qrcodeShowcase: ShowcaseSpec = {
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
