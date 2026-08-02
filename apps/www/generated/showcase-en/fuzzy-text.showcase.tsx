"use client";
import type { ShowcaseSpec } from "../../../../packages/ui/src/showcase/types";
import { FuzzyText } from "../../../../packages/ui/src/fuzzy-text/fuzzy-text";
function Stage({ children }: {
    children: React.ReactNode;
}) {
    return (<div data-theme="dark" className="flex min-h-44 w-full max-w-xl items-center justify-center overflow-hidden rounded-xl border border-border p-6" style={{ background: "var(--color-bg)" }}>
      {children}
    </div>);
}
export const fuzzyTextShowcase: ShowcaseSpec = {
    examples: [
        {
            title: "Basic usage",
            description: "The text is randomly misaligned line by line, causing scanning noise, and the jitter increases when hovering. The default color is var (--color-foreground) according to the theme.",
            code: `<FuzzyText fontSize="clamp(2rem, 8vw, 5rem)">Hulian</FuzzyText>`,
            render: () => (<Stage>
          <FuzzyText fontSize="clamp(2rem, 8vw, 5rem)">Hulian</FuzzyText>
        </Stage>),
        },
        {
            title: "404 signal noise",
            description: "Increase fuzzRange and baseIntensity to create a sense of signal distortion, suitable for error page titles.",
            code: `<FuzzyText
  fontSize="clamp(3rem, 14vw, 8rem)"
  fuzzRange={42}
  baseIntensity={0.3}
  color="var(--color-chart-1)"
>
  404
</FuzzyText>`,
            render: () => (<Stage>
          <FuzzyText fontSize="clamp(3rem, 14vw, 8rem)" fuzzRange={42} baseIntensity={0.3} color="var(--color-chart-1)">
            404
          </FuzzyText>
        </Stage>),
        },
        {
            title: "Longitudinal misalignment",
            description: "direction=\"vertical\" is changed to column-by-column up and down misalignment.",
            code: `<FuzzyText direction="vertical" color="var(--color-chart-2)">GLITCH</FuzzyText>`,
            render: () => (<Stage>
          <FuzzyText fontSize="clamp(2rem, 8vw, 4.5rem)" direction="vertical" color="var(--color-chart-2)">
            GLITCH
          </FuzzyText>
        </Stage>),
        },
        {
            title: "Two-way superposition",
            description: "direction=\"both\" horizontal and vertical misalignment superposition, the strongest noise; hoverIntensity controls the hover gain.",
            code: `<FuzzyText direction="both" hoverIntensity={0.8} color="var(--color-chart-4)">NOISE</FuzzyText>`,
            render: () => (<Stage>
          <FuzzyText fontSize="clamp(2rem, 8vw, 4.5rem)" direction="both" hoverIntensity={0.8} color="var(--color-chart-4)">
            NOISE
          </FuzzyText>
        </Stage>),
        },
    ],
    controls: [
        { prop: "baseIntensity", type: "number", defaultValue: 0.18, label: "Resting Strength 0\u20131" },
        { prop: "hoverIntensity", type: "number", defaultValue: 0.5, label: "Hover Strength 0\u20131" },
        { prop: "fuzzRange", type: "number", defaultValue: 30, label: "Displacement amplitude px" },
        {
            prop: "direction",
            type: "select",
            options: ["horizontal", "vertical", "both"],
            defaultValue: "horizontal",
            label: "Jitter direction",
        },
        { prop: "enableHover", type: "boolean", defaultValue: true, label: "Hover enhancement" },
    ],
    states: [
        {
            name: "default (default horizontal scan)",
            render: () => (<Stage>

          <FuzzyText fontSize="clamp(2rem, 8vw, 5rem)">Hulian</FuzzyText>
        </Stage>),
        },
        {
            name: "404 (high displacement\u00B7signal noise)",
            render: () => (<Stage>
          <FuzzyText fontSize="clamp(3rem, 14vw, 8rem)" fuzzRange={42} baseIntensity={0.3} color="var(--color-chart-1)">
            404
          </FuzzyText>
        </Stage>),
        },
        {
            name: "vertical (vertical misalignment)",
            render: () => (<Stage>
          <FuzzyText fontSize="clamp(2rem, 8vw, 4.5rem)" direction="vertical" color="var(--color-chart-2)">
            GLITCH
          </FuzzyText>
        </Stage>),
        },
        {
            name: "both (two-way \u00B7 the strongest snowflake)",
            render: () => (<Stage>
          <FuzzyText fontSize="clamp(2rem, 8vw, 4.5rem)" direction="both" hoverIntensity={0.8} color="var(--color-chart-4)">
            NOISE
          </FuzzyText>
        </Stage>),
        },
    ],
    renderWithProps: (p) => (<Stage>
      <FuzzyText fontSize="clamp(2rem, 8vw, 5rem)" baseIntensity={p.baseIntensity as number} hoverIntensity={p.hoverIntensity as number} fuzzRange={p.fuzzRange as number} direction={p.direction as "horizontal" | "vertical" | "both"} enableHover={p.enableHover as boolean}>
        Hulian
      </FuzzyText>
    </Stage>),
    toCode: (p) => [
        `<FuzzyText`,
        `  baseIntensity={${p.baseIntensity}}`,
        `  hoverIntensity={${p.hoverIntensity}}`,
        `  fuzzRange={${p.fuzzRange}}`,
        `  direction="${p.direction}"`,
        `  enableHover={${p.enableHover}}`,
        `>`,
        `  Hulian`,
        `</FuzzyText>`,
    ].join("\n"),
};
