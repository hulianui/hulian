"use client";
import type { ShowcaseSpec } from "../../../../packages/ui/src/showcase/types";
import { BounceCards } from "../../../../packages/ui/src/bounce-cards/bounce-cards";
function Stage({ children }: {
    children: React.ReactNode;
}) {
    return (<div className="flex h-72 w-full max-w-2xl items-center justify-center overflow-hidden rounded-xl border border-border bg-muted/30">
      {children}
    </div>);
}
function Swatch({ from, to, label }: {
    from: string;
    to: string;
    label: string;
}) {
    return (<div className="flex h-full w-full items-center justify-center text-sm font-semibold text-white" style={{ background: `linear-gradient(135deg, ${from}, ${to})` }}>
      {label}
    </div>);
}
const SWATCHES = [
    <Swatch key="1" from="var(--color-chart-1)" to="var(--color-chart-2)" label="01"/>,
    <Swatch key="2" from="var(--color-chart-2)" to="var(--color-chart-3)" label="02"/>,
    <Swatch key="3" from="var(--color-chart-3)" to="var(--color-chart-4)" label="03"/>,
    <Swatch key="4" from="var(--color-chart-4)" to="var(--color-chart-5)" label="04"/>,
    <Swatch key="5" from="var(--color-chart-5)" to="var(--color-primary)" label="05"/>,
];
export const bounceCardsShowcase: ShowcaseSpec = {
    examples: [
        {
            title: "Basic usage (pictures)",
            description: "Pass the images array. Each picture is rendered as a card. When entering, the cards will be popped in one by one and pushed to give way by hovering.",
            code: `<BounceCards
  images={["/1.jpg", "/2.jpg", "/3.jpg", "/4.jpg", "/5.jpg"]}
  containerWidth={460}
  containerHeight={240}
/>`,
            render: () => (<Stage>
          <BounceCards containerWidth={460} containerHeight={240}>
            {SWATCHES}
          </BounceCards>
        </Stage>),
        },
        {
            title: "Customize card content",
            description: "Replace images with children, and each child node is rendered into a card (the number determines the number).",
            code: `<BounceCards containerWidth={460} containerHeight={240}>
  <Swatch label="01" />
  <Swatch label="02" />
  <Swatch label="03" />
  <Swatch label="04" />
  <Swatch label="05" />
</BounceCards>`,
            render: () => (<Stage>
          <BounceCards containerWidth={460} containerHeight={240}>
            {SWATCHES}
          </BounceCards>
        </Stage>),
        },
        {
            title: "Custom sector + Close hover",
            description: "transformStyles Customize the rotation/displacement of each card, enableHover={false} turns off push interaction.",
            code: `<BounceCards
  containerWidth={420}
  containerHeight={220}
  enableHover={false}
  transformStyles={[
    "rotate(8deg) translate(-110px)",
    "rotate(-2deg)",
    "rotate(-8deg) translate(110px)",
  ]}
>
  {cards.slice(0, 3)}
</BounceCards>`,
            render: () => (<Stage>
          <BounceCards containerWidth={420} containerHeight={220} enableHover={false} transformStyles={[
                    "rotate(8deg) translate(-110px)",
                    "rotate(-2deg)",
                    "rotate(-8deg) translate(110px)",
                ]}>
            {SWATCHES.slice(0, 3)}
          </BounceCards>
        </Stage>),
        },
        {
            title: "More exaggerated pushing distance",
            description: "pushDistance Increase the size to make it more obvious for the cards on both sides to give way when hovering.",
            code: `<BounceCards
  containerWidth={460}
  containerHeight={240}
  pushDistance={220}
>
  {cards}
</BounceCards>`,
            render: () => (<Stage>
          <BounceCards containerWidth={460} containerHeight={240} pushDistance={220}>
            {SWATCHES}
          </BounceCards>
        </Stage>),
        },
    ],
    controls: [
        { prop: "animationDelay", type: "number", defaultValue: 0.5, label: "Delay in admission s" },
        { prop: "animationStagger", type: "number", defaultValue: 0.06, label: "Peak shifting interval s" },
        { prop: "pushDistance", type: "number", defaultValue: 160, label: "hover Push px" },
        { prop: "enableHover", type: "boolean", defaultValue: true, label: "hover Push" },
    ],
    states: [
        {
            name: "default (five fan-shaped spreads \u00B7 hover push)",
            render: () => (<Stage>
          <BounceCards containerWidth={460} containerHeight={240}>
            {SWATCHES}
          </BounceCards>
        </Stage>),
        },
        {
            name: "Three \u00B7 Close hover",
            render: () => (<Stage>
          <BounceCards containerWidth={420} containerHeight={220} enableHover={false} transformStyles={[
                    "rotate(8deg) translate(-110px)",
                    "rotate(-2deg)",
                    "rotate(-8deg) translate(110px)",
                ]}>
            {SWATCHES.slice(0, 3)}
          </BounceCards>
        </Stage>),
        },
        {
            name: "Large pushing distance (hover giving way is even more exaggerated)",
            render: () => (<Stage>
          <BounceCards containerWidth={460} containerHeight={240} pushDistance={220}>
            {SWATCHES}
          </BounceCards>
        </Stage>),
        },
    ],
    renderWithProps: (p) => (<Stage>
      <BounceCards containerWidth={460} containerHeight={240} animationDelay={p.animationDelay as number} animationStagger={p.animationStagger as number} pushDistance={p.pushDistance as number} enableHover={p.enableHover as boolean}>
        {SWATCHES}
      </BounceCards>
    </Stage>),
    toCode: (p) => [
        `<BounceCards`,
        `  images={["/1.jpg", "/2.jpg", "/3.jpg", "/4.jpg", "/5.jpg"]}`,
        `  containerWidth={460}`,
        `  containerHeight={240}`,
        `  animationDelay={${p.animationDelay}}`,
        `  animationStagger={${p.animationStagger}}`,
        `  pushDistance={${p.pushDistance}}`,
        `  enableHover={${p.enableHover}}`,
        `/>`,
    ].join("\n"),
};
