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
  examples: [
    {
      title: "基础用法",
      description: "把指针移到文字上，半径内的字符逐个翻滚乱码再收敛回原字。",
      code: `<ScrambledText>
  把指针移到这段文字上 — Hover scrambles the glyphs.
</ScrambledText>`,
      render: () => (
        <Stage>
          <ScrambledText>{SAMPLE}</ScrambledText>
        </Stage>
      ),
    },
    {
      title: "生效半径",
      description: "radius 控制指针靠近多少 px 内的字符才触发翻滚，越大波及范围越广。",
      code: `<ScrambledText radius={160}>
  HULIAN UI · Scramble On Hover
</ScrambledText>`,
      render: () => (
        <Stage>
          <ScrambledText radius={160}>HULIAN UI · Scramble On Hover</ScrambledText>
        </Stage>
      ),
    },
    {
      title: "自定义字符集",
      description: "scrambleChars 决定乱码过程中随机替换用的字符，换成全角块字符更有解构感。",
      code: `<ScrambledText scrambleChars="█▓▒░">
  HULIAN UI · Scramble On Hover
</ScrambledText>`,
      render: () => (
        <Stage>
          <ScrambledText scrambleChars="█▓▒░">HULIAN UI · Scramble On Hover</ScrambledText>
        </Stage>
      ),
    },
    {
      title: "快收敛",
      description: "speed 调高、duration 调短，乱码闪烁更快、回字更急促，像二进制衰变。",
      code: `<ScrambledText duration={0.6} speed={0.9} scrambleChars="01">
  0101 binary decay 1010
</ScrambledText>`,
      render: () => (
        <Stage>
          <ScrambledText duration={0.6} speed={0.9} scrambleChars="01">
            0101 binary decay 1010
          </ScrambledText>
        </Stage>
      ),
    },
  ],

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
