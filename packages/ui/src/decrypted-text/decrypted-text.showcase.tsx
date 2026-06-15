"use client";
import type { ShowcaseSpec } from "../showcase/types";
import { DecryptedText } from "./decrypted-text";

export const decryptedTextShowcase: ShowcaseSpec = {
  examples: [
    {
      title: "基础用法",
      description: "滚入视口后字符乱码翻滚，逐位解码到明文。",
      code: `<DecryptedText
  text="Decrypting access..."
  className="text-2xl font-semibold text-foreground"
/>`,
      render: () => (
        <DecryptedText
          text="Decrypting access..."
          className="text-2xl font-semibold text-foreground"
        />
      ),
    },
    {
      title: "悬停解码",
      description: "animateOn=\"hover\" 悬停时解码、移出复位为乱码。",
      code: `<DecryptedText
  text="Hover to decrypt"
  animateOn="hover"
  className="text-2xl font-semibold text-primary"
/>`,
      render: () => (
        <DecryptedText
          text="Hover to decrypt"
          animateOn="hover"
          className="text-2xl font-semibold text-primary"
        />
      ),
    },
    {
      title: "解码速度",
      description: "speed 是每次乱码刷新间隔毫秒，越小翻滚越快。",
      code: `<DecryptedText
  text="Fast scramble"
  speed={25}
  className="text-2xl font-semibold text-foreground"
/>`,
      render: () => (
        <DecryptedText
          text="Fast scramble"
          speed={25}
          className="text-2xl font-semibold text-foreground"
        />
      ),
    },
    {
      title: "自定义字符集",
      description: "characters 指定乱码取样字符集，例如只用 0/1 做二进制流观感。",
      code: `<DecryptedText
  text="BINARY MODE"
  characters="01"
  className="text-2xl font-semibold text-primary"
/>`,
      render: () => (
        <DecryptedText
          text="BINARY MODE"
          characters="01"
          className="text-2xl font-semibold text-primary"
        />
      ),
    },
  ],
  controls: [
    { prop: "animateOn", type: "select", options: ["view", "hover"], defaultValue: "view" },
    { prop: "speed", type: "number", defaultValue: 55 },
  ],
  states: [
    {
      name: "view（滚入解码）",
      render: () => (
        <DecryptedText
          text="Decrypting access..."
          className="text-2xl font-semibold text-foreground"
        />
      ),
    },
    {
      name: "hover（悬停解码）",
      render: () => (
        <DecryptedText
          text="Hover to decrypt"
          animateOn="hover"
          className="text-2xl font-semibold text-primary"
        />
      ),
    },
  ],
  renderWithProps: (p) => (
    <DecryptedText
      key={`${p.animateOn}-${p.speed}`}
      text="Decrypting the secret"
      animateOn={p.animateOn as "view" | "hover"}
      speed={p.speed as number}
      className="text-2xl font-semibold text-foreground"
    />
  ),
  toCode: (p) =>
    `<DecryptedText text="Decrypting the secret" animateOn="${p.animateOn}" speed={${p.speed}} />`,
};
