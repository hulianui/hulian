"use client";
import type { ShowcaseSpec } from "../showcase/types";
import { ScrambledText } from "./scrambled-text";

/** 展示用中性底容器，提示「把指针移到文字上」 */
function Stage({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-full max-w-xl rounded-xl border border-border bg-surface p-8">
      {children}
    </div>
  );
}

const SAMPLE = "把指针移到这段文字上 — Hover scrambles the glyphs.";

export const scrambledTextShowcase: ShowcaseSpec = {
  controls: [
    { prop: "radius", type: "number", defaultValue: 100, label: "生效半径 px" },
    { prop: "duration", type: "number", defaultValue: 1.2, label: "翻滚时长 s" },
    { prop: "speed", type: "number", defaultValue: 0.5, label: "翻滚速度 0~1" },
    { prop: "scrambleChars", type: "text", defaultValue: ".:", label: "乱码字符集" },
  ],

  states: [
    {
      name: "default（默认 .: 字符集）",
      render: () => (
        <Stage>
          <ScrambledText>{SAMPLE}</ScrambledText>
        </Stage>
      ),
    },
    {
      name: "大半径 · 全角符号集",
      render: () => (
        <Stage>
          <ScrambledText radius={160} scrambleChars="█▓▒░">
            HULIAN UI · Scramble On Hover
          </ScrambledText>
        </Stage>
      ),
    },
    {
      name: "快收敛（speed 高 · 时长短）",
      render: () => (
        <Stage>
          <ScrambledText duration={0.6} speed={0.9} scrambleChars="01">
            0101 binary decay 1010
          </ScrambledText>
        </Stage>
      ),
    },
  ],

  renderWithProps: (p) => (
    <Stage>
      <ScrambledText
        radius={p.radius as number}
        duration={p.duration as number}
        speed={p.speed as number}
        scrambleChars={p.scrambleChars as string}
      >
        {SAMPLE}
      </ScrambledText>
    </Stage>
  ),

  toCode: (p) =>
    [
      `<ScrambledText`,
      `  radius={${p.radius}}`,
      `  duration={${p.duration}}`,
      `  speed={${p.speed}}`,
      `  scrambleChars=${JSON.stringify(p.scrambleChars)}`,
      `>`,
      `  把指针移到这段文字上 — Hover scrambles the glyphs.`,
      `</ScrambledText>`,
    ].join("\n"),
};
