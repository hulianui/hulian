"use client";
import type { ShowcaseSpec } from "../../../../packages/ui/src/showcase/types";
import { TextCursor } from "../../../../packages/ui/src/text-cursor/text-cursor";
function Stage({ children, dark = false, }: {
    children?: React.ReactNode;
    dark?: boolean;
}) {
    return (<div className="relative h-64 w-full max-w-xl overflow-hidden rounded-xl" style={{ background: dark ? "oklch(0.14 0.02 255)" : undefined }}>
      {children}
    </div>);
}
const hint = (label: string, dark = false) => (<p className={dark
        ? "text-sm font-medium text-white/50" : "text-sm font-medium text-muted"}>
    {label}
  </p>);
export const textCursorShowcase: ShowcaseSpec = {
    examples: [
        {
            title: "Basic usage",
            description: "Move the cursor within the container, and a string of text glyphs will drop along the track at fixed intervals and fade out over time.",
            code: `<div className="relative h-64 overflow-hidden rounded-xl">
  <TextCursor />
</div>`,
            render: () => (<Stage>
          <TextCursor className="rounded-xl">{hint("Move the cursor within this area \u2192")}</TextCursor>
        </Stage>),
        },
        {
            title: "Custom font + spacing",
            description: "text can pass any short string or emoji, spacing can be increased to make the tail sparser.",
            code: `<div className="relative h-64 overflow-hidden rounded-xl">
  <TextCursor text="\u2728" spacing={130} />
</div>`,
            render: () => (<Stage dark>
          <TextCursor text="✨" spacing={130} className="rounded-xl">
            {hint("\u2728 Scratches left behind", true)}
          </TextCursor>
        </Stage>),
        },
        {
            title: "Keep the font horizontal",
            description: "When followMouseDirection=false, the font does not rotate with the moving direction and is always horizontal.",
            code: `<div className="relative h-64 overflow-hidden rounded-xl">
  <TextCursor text="Hulian" followMouseDirection={false} spacing={60} />
</div>`,
            render: () => (<Stage>
          <TextCursor text="Hulian" followMouseDirection={false} spacing={60} className="rounded-xl">
            {hint("Keep the font horizontal")}
          </TextCursor>
        </Stage>),
        },
        {
            title: "Static long tail",
            description: "Turn off randomFloat to remove the micro-floating, and increase maxPoints to form a longer stable tail.",
            code: `<div className="relative h-64 overflow-hidden rounded-xl">
  <TextCursor text="\u25CF" randomFloat={false} maxPoints={12} spacing={45} />
</div>`,
            render: () => (<Stage dark>
          <TextCursor text="●" randomFloat={false} maxPoints={12} spacing={45} className="rounded-xl">
            {hint("\u25CF Stable tailing", true)}
          </TextCursor>
        </Stage>),
        },
    ],
    controls: [
        { prop: "text", type: "text", defaultValue: "Hu", label: "Font" },
        { prop: "spacing", type: "number", defaultValue: 80, label: "Font spacing px" },
        {
            prop: "followMouseDirection",
            type: "boolean",
            defaultValue: true,
            label: "Rotate in direction",
        },
        {
            prop: "randomFloat",
            type: "boolean",
            defaultValue: true,
            label: "Random float",
        },
        { prop: "maxPoints", type: "number", defaultValue: 5, label: "Trailing upper limit" },
    ],
    states: [
        {
            name: "default (move cursor within area)",
            render: () => (<Stage>
          <TextCursor className="rounded-xl">
            {hint("Move the cursor within this area \u2192")}
          </TextCursor>
        </Stage>),
        },
        {
            name: "emoji + large spacing (sparse tailing)",
            render: () => (<Stage dark>
          <TextCursor text="✨" spacing={130} className="rounded-xl">
            {hint("\u2728 Scratches left behind", true)}
          </TextCursor>
        </Stage>),
        },
        {
            name: "Horizontal glyph (does not rotate with direction)",
            render: () => (<Stage>
          <TextCursor text="Hulian" followMouseDirection={false} spacing={60} className="rounded-xl">
            {hint("Keep the font horizontal")}
          </TextCursor>
        </Stage>),
        },
        {
            name: "Static trailing (turn off floating \u00B7 long trailing)",
            render: () => (<Stage dark>
          <TextCursor text="●" randomFloat={false} maxPoints={12} spacing={45} className="rounded-xl">
            {hint("\u25CF Stable tailing", true)}
          </TextCursor>
        </Stage>),
        },
    ],
    renderWithProps: (p) => (<Stage>
      <TextCursor text={p.text as string} spacing={p.spacing as number} followMouseDirection={p.followMouseDirection as boolean} randomFloat={p.randomFloat as boolean} maxPoints={p.maxPoints as number} className="rounded-xl">
        {hint("Move the cursor within this area \u2192")}
      </TextCursor>
    </Stage>),
    toCode: (p) => [
        `<div className="relative h-64 overflow-hidden rounded-xl">`,
        `  <TextCursor`,
        `    text=${JSON.stringify(p.text)}`,
        `    spacing={${p.spacing}}`,
        `    followMouseDirection={${p.followMouseDirection}}`,
        `    randomFloat={${p.randomFloat}}`,
        `    maxPoints={${p.maxPoints}}`,
        `  />`,
        `</div>`,
    ].join("\n"),
};
