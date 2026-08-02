"use client";
import { useState } from "react";
import type { ShowcaseSpec } from "../../../../packages/ui/src/showcase/types";
import { Tilt } from "../../../../packages/ui/src/tilt/tilt";
function Card({ children }: {
    children?: React.ReactNode;
}) {
    return (<div className="grid h-44 w-64 place-items-center rounded-[calc(var(--radius)+0.25rem)] border border-hairline bg-surface p-6 text-center shadow-lg">
      {children}
    </div>);
}
function DarkCard({ children }: {
    children?: React.ReactNode;
}) {
    return (<div className="grid h-44 w-64 place-items-center rounded-[calc(var(--radius)+0.25rem)] p-6 text-center text-sm text-white shadow-lg" style={{ background: "linear-gradient(145deg, var(--color-chart-5), var(--color-chart-2))" }}>
      {children}
    </div>);
}
function ManualDemo() {
    const [x, setX] = useState(0);
    const [y, setY] = useState(18);
    return (<div className="flex flex-wrap items-center gap-8">
      <Tilt manualAngleX={x} manualAngleY={y} glare glareBorderRadius="calc(var(--radius) + 0.25rem)">
        <DarkCard>Slider drive</DarkCard>
      </Tilt>
      <div className="flex w-56 flex-col gap-3 text-xs text-muted">
        <label className="flex flex-col gap-1">
          rotateX {x}°
          <input type="range" min={-30} max={30} value={x} onChange={(e) => setX(Number(e.target.value))}/>
        </label>
        <label className="flex flex-col gap-1">
          rotateY {y}°
          <input type="range" min={-30} max={30} value={y} onChange={(e) => setY(Number(e.target.value))}/>
        </label>
      </div>
    </div>);
}
function ReadoutDemo() {
    const [state, setState] = useState({ rx: 0, ry: 0, op: 0 });
    return (<div className="flex flex-wrap items-center gap-8">
      <Tilt maxAngleX={16} maxAngleY={16} glare glareBorderRadius="calc(var(--radius) + 0.25rem)" onTiltMove={({ angles, glare }) => setState({ rx: Math.round(angles.rotateX), ry: Math.round(angles.rotateY), op: glare.opacity })}>
        <DarkCard>Move on top of me</DarkCard>
      </Tilt>
      <p className="font-mono text-xs text-muted">
        rotateX {state.rx}° · rotateY {state.ry}° · glare {state.op.toFixed(2)}
      </p>
    </div>);
}
export const tiltShowcase: ShowcaseSpec = {
    examples: [
        {
            title: "Basic usage",
            description: "Wrap any content to get pointer parallax tilt; leave it and it will automatically return to its original position.",
            code: `<Tilt>
  <Card>Any content</Card>
</Tilt>`,
            render: () => (<Tilt>
          <Card>
            <span className="text-sm text-muted">Try hovering</span>
          </Card>
        </Tilt>),
        },
        {
            title: "Reflective Highlight",
            description: "glare Turn on the highlight layer that follows the pointer; glareBorderRadius must be consistent with the rounded corners of the wrapped element, otherwise the highlight will overflow the rounded corners.",
            code: `<Tilt
  glare
  glareMaxOpacity={0.45}
  glareBorderRadius="calc(var(--radius) + 0.25rem)"
  maxAngleX={16}
  maxAngleY={16}
>
  <DarkCard>Reflective card</DarkCard>
</Tilt>`,
            render: () => (<Tilt glare glareMaxOpacity={0.45} glareBorderRadius="calc(var(--radius) + 0.25rem)" maxAngleX={16} maxAngleY={16}>
          <DarkCard>Reflective card</DarkCard>
        </Tilt>),
        },
        {
            title: "Single axis \u00B7 Reverse \u00B7 Resting angle \u00B7 Zoom",
            description: "axis limits single axis; reverse reverses; initialAngle gives a resting tilt; scale hovers to zoom.",
            code: `<>
  <Tilt axis="x" maxAngleX={18}><Card>Wrap only X</Card></Tilt>
  <Tilt reverse><Card>Reverse</Card></Tilt>
  <Tilt initialAngleY={-12} scale={1.06}><Card>Rest -12\u00B0</Card></Tilt>
</>`,
            render: () => (<div className="flex flex-wrap gap-6">
          <Tilt axis="x" maxAngleX={18}>
            <Card>
              <span className="text-sm text-muted">Only around X</span>
            </Card>
          </Tilt>
          <Tilt reverse>
            <Card>
              <span className="text-sm text-muted">Reverse</span>
            </Card>
          </Tilt>
          <Tilt initialAngleY={-12} scale={1.06}>
            <Card>
              <span className="text-sm text-muted">Resting -12°</span>
            </Card>
          </Tilt>
        </div>),
        },
        {
            title: "Manual angle (slider drive)",
            description: "manualAngleX/Y takes over the corresponding axis, and the pointer no longer affects it - the rocker, slider, and scroll progress can all be driven.",
            code: `const [x, setX] = useState(0)

<Tilt manualAngleX={x} manualAngleY={18} glare>
  <DarkCard>Slider drive</DarkCard>
</Tilt>`,
            render: () => <ManualDemo />,
        },
        {
            title: "Read real-time angle",
            description: "onTiltMove Each frame returns the angle and reflection intensity, which can be used to drive other layers to create multi-layer parallax.",
            code: `<Tilt onTiltMove={({ angles, glare }) => setState(...)}>
  <DarkCard>Move on top of me</DarkCard>
</Tilt>`,
            render: () => <ReadoutDemo />,
        },
    ],
    controls: [
        { prop: "maxAngleX", type: "number", defaultValue: 12 },
        { prop: "maxAngleY", type: "number", defaultValue: 12 },
        { prop: "scale", type: "number", defaultValue: 1 },
        { prop: "perspective", type: "number", defaultValue: 1000 },
        { prop: "glare", type: "boolean", defaultValue: true },
        { prop: "reverse", type: "boolean", defaultValue: false },
    ],
    states: [
        {
            name: "Default",
            render: () => (<Tilt>
          <Card>
            <span className="text-sm text-muted">Try hovering</span>
          </Card>
        </Tilt>),
        },
        {
            name: "Reflective",
            render: () => (<Tilt glare glareMaxOpacity={0.45} glareBorderRadius="calc(var(--radius) + 0.25rem)">
          <DarkCard>Reflective card</DarkCard>
        </Tilt>),
        },
        { name: "Manual angle", render: () => <ManualDemo /> },
        { name: "Real-time angle reading", render: () => <ReadoutDemo /> },
    ],
    renderWithProps: (p) => (<Tilt maxAngleX={Number(p.maxAngleX ?? 12)} maxAngleY={Number(p.maxAngleY ?? 12)} scale={Number(p.scale ?? 1)} perspective={Number(p.perspective ?? 1000)} glare={p.glare !== false} reverse={p.reverse === true} glareBorderRadius="calc(var(--radius) + 0.25rem)">
      <DarkCard>Playground</DarkCard>
    </Tilt>),
    toCode: (p) => `<Tilt
  maxAngleX={${p.maxAngleX ?? 12}}
  maxAngleY={${p.maxAngleY ?? 12}}${p.scale && Number(p.scale) !== 1 ? `
  scale={${p.scale}}` : ""}${p.perspective && Number(p.perspective) !== 1000 ? `
  perspective={${p.perspective}}` : ""}${p.glare !== false ? "\n  glare" : ""}${p.reverse === true ? "\n  reverse" : ""}
>
  <Card>\u2026</Card>
</Tilt>`,
};
