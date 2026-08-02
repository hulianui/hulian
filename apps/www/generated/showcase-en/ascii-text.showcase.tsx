"use client";
import type { ShowcaseSpec } from "../../../../packages/ui/src/showcase/types";
import { ASCIIText } from "../../../../packages/ui/src/ascii-text/ascii-text";
function Stage({ children }: {
    children: React.ReactNode;
}) {
    return (<div className="relative h-64 w-full max-w-xl overflow-hidden rounded-xl border border-border" style={{ background: "oklch(0.14 0.02 255)" }}>
      {children}
    </div>);
}
export const asciiTextShowcase: ShowcaseSpec = {
    examples: [
        {
            title: "Basic usage",
            description: "Render text into character paintings, with fluctuating displacement and mouse-driven hue turned on by default. It needs to be placed in a relatively positioned container with a fixed width and height.",
            code: `<div className="relative h-64 overflow-hidden rounded-xl">
  <ASCIIText text="Hulian" />
</div>`,
            render: () => (<Stage>
          <ASCIIText text="Hulian" className="text-[color:var(--color-chart-1)]"/>
        </Stage>),
        },
        {
            title: "English text",
            description: "asciiFontSize Adjusting the size can increase the character grid density and make long English text clearer.",
            code: `<div className="relative h-64 overflow-hidden rounded-xl">
  <ASCIIText text="HULIAN UI" asciiFontSize={7} />
</div>`,
            render: () => (<Stage>
          <ASCIIText text="HULIAN UI" asciiFontSize={7}/>
        </Stage>),
        },
        {
            title: "Static character painting",
            description: "Close enableWaves and enableHue to get pure character paintings without animation.",
            code: `<div className="relative h-64 overflow-hidden rounded-xl">
  <ASCIIText text="ASCII" enableWaves={false} enableHue={false} />
</div>`,
            render: () => (<Stage>
          <ASCIIText text="ASCII" enableWaves={false} enableHue={false} className="text-[color:var(--color-chart-2)]"/>
        </Stage>),
        },
        {
            title: "High density details",
            description: "The smaller asciiFontSize is paired with the larger textFontSize sample to depict more details.",
            code: `<div className="relative h-64 overflow-hidden rounded-xl">
  <ASCIIText text="code" asciiFontSize={6} textFontSize={200} />
</div>`,
            render: () => (<Stage>
          <ASCIIText text="Code" asciiFontSize={6} textFontSize={200}/>
        </Stage>),
        },
    ],
    controls: [
        { prop: "text", type: "text", defaultValue: "Hulian", label: "Text" },
        { prop: "asciiFontSize", type: "number", defaultValue: 8, label: "Character size px" },
        { prop: "textFontSize", type: "number", defaultValue: 160, label: "Source font size px" },
        { prop: "enableWaves", type: "boolean", defaultValue: true, label: "Fluctuation displacement" },
        { prop: "enableHue", type: "boolean", defaultValue: true, label: "Mouse Hue" },
    ],
    states: [
        {
            name: "default (Hulian\u00B7fluctuation+hue)",
            render: () => (<Stage>
          <ASCIIText text="Hulian" className="text-[color:var(--color-chart-1)]"/>
        </Stage>),
        },
        {
            name: "English long text",
            render: () => (<Stage>
          <ASCIIText text="HULIAN UI" asciiFontSize={7}/>
        </Stage>),
        },
        {
            name: "Static (Off Wave\u00B7Off Hue)",
            render: () => (<Stage>
          <ASCIIText text="ASCII" enableWaves={false} enableHue={false} className="text-[color:var(--color-chart-2)]"/>
        </Stage>),
        },
        {
            name: "High density details",
            render: () => (<Stage>
          <ASCIIText text="Code" asciiFontSize={6} textFontSize={200}/>
        </Stage>),
        },
    ],
    renderWithProps: (p) => (<Stage>
      <ASCIIText text={p.text as string} asciiFontSize={p.asciiFontSize as number} textFontSize={p.textFontSize as number} enableWaves={p.enableWaves as boolean} enableHue={p.enableHue as boolean}/>
    </Stage>),
    toCode: (p) => [
        `<div className="relative h-64 overflow-hidden rounded-xl"`,
        `     style={{ background: "oklch(0.14 0.02 255)" }}>`,
        `  <ASCIIText`,
        `    text=${JSON.stringify(p.text)}`,
        `    asciiFontSize={${p.asciiFontSize}}`,
        `    textFontSize={${p.textFontSize}}`,
        `    enableWaves={${p.enableWaves}}`,
        `    enableHue={${p.enableHue}}`,
        `  />`,
        `</div>`,
    ].join("\n"),
};
