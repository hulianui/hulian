"use client";
import type { ShowcaseSpec } from "../showcase/types";
import { DecryptedText } from "./decrypted-text";

export const decryptedTextShowcase: ShowcaseSpec = {
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
