"use client";
import type { CSSProperties } from "react";
import type { ShowcaseSpec } from "../../../../packages/ui/src/showcase/types";
import { ModelViewer } from "../../../../packages/ui/src/model-viewer/model-viewer";
function Stage({ children }: {
    children: React.ReactNode;
}) {
    return (<div className="w-full max-w-xl">
      <div className="overflow-hidden rounded-xl" style={{ background: "oklch(0.16 0.02 255)" }}>
        {children}
      </div>
    </div>);
}
function Cube({ size = 120 }: {
    size?: number;
}) {
    const face: CSSProperties = {
        position: "absolute",
        inset: 0,
        border: "1px solid var(--color-border)",
        borderRadius: 12,
        display: "grid",
        placeItems: "center",
    };
    return (<div className="[transform-style:preserve-3d]" style={{ width: size, height: size, position: "relative" }}>
      <div style={{
            ...face,
            background: "linear-gradient(135deg, var(--color-chart-1), var(--color-chart-4))",
            transform: `translateZ(${size / 2}px)`,
            boxShadow: "0 0 32px var(--color-chart-1)",
        }}>
        <span className="text-2xl font-semibold text-white">Hu</span>
      </div>
      <div style={{
            ...face,
            background: "var(--color-surface)",
            transform: `rotateY(90deg) translateZ(${size / 2}px)`,
        }}/>
      <div style={{
            ...face,
            background: "var(--color-surface)",
            transform: `rotateX(90deg) translateZ(${size / 2}px)`,
        }}/>
    </div>);
}
export const modelViewerShowcase: ShowcaseSpec = {
    examples: [
        {
            title: "Basic usage",
            description: "Put any children as a \"model\" on the stage - drag rotation, mouse parallax, hover tilt are all enabled by default.",
            code: `<ModelViewer height={320}>
  {/* Any node can be used as a "model" */}
  <YourModel />
</ModelViewer>`,
            render: () => (<Stage>
          <ModelViewer height={320}>
            <Cube />
          </ModelViewer>
        </Stage>),
        },
        {
            title: "Automatic rotation",
            description: "autoRotate makes the model rotate at a constant speed around the Y axis, and autoRotateSpeed controls the angular velocity.",
            code: `<ModelViewer height={320} autoRotate autoRotateSpeed={28}>
  <YourModel />
</ModelViewer>`,
            render: () => (<Stage>
          <ModelViewer height={320} autoRotate autoRotateSpeed={28}>
            <Cube />
          </ModelViewer>
        </Stage>),
        },
        {
            title: "Minimalist interaction",
            description: "Turn off parallax/hover/contact shadow/reset buttons, leaving only pure drag rotation.",
            code: `<ModelViewer
  height={300}
  enableMouseParallax={false}
  enableHoverRotation={false}
  showContactShadow={false}
  showResetButton={false}
>
  <div
    className="grid size-32 place-items-center rounded-2xl text-4xl font-bold text-white"
    style={{
      background: "linear-gradient(135deg, var(--color-chart-2), var(--color-chart-5))",
      transform: "translateZ(40px)",
    }}
  >
    UI
  </div>
</ModelViewer>`,
            render: () => (<Stage>
          <ModelViewer height={300} enableMouseParallax={false} enableHoverRotation={false} showContactShadow={false} showResetButton={false}>
            <div className="grid size-32 place-items-center rounded-2xl text-4xl font-bold text-white" style={{
                    background: "linear-gradient(135deg, var(--color-chart-2), var(--color-chart-5))",
                    transform: "translateZ(40px)",
                }}>
              UI
            </div>
          </ModelViewer>
        </Stage>),
        },
    ],
    controls: [
        { prop: "autoRotate", type: "boolean", defaultValue: false, label: "Automatic rotation" },
        {
            prop: "autoRotateSpeed",
            type: "number",
            defaultValue: 24,
            label: "Rotation speed \u00B0/s",
        },
        {
            prop: "enableMouseParallax",
            type: "boolean",
            defaultValue: true,
            label: "Mouse Parallax",
        },
        {
            prop: "enableHoverRotation",
            type: "boolean",
            defaultValue: true,
            label: "Hover Tilt",
        },
        {
            prop: "showContactShadow",
            type: "boolean",
            defaultValue: true,
            label: "Contact Shadow",
        },
    ],
    states: [
        {
            name: "default (drag to rotate + parallax + hover tilt)",
            render: () => (<Stage>
          <ModelViewer height={320}>
            <Cube />
          </ModelViewer>
        </Stage>),
        },
        {
            name: "Automatic rotation",
            render: () => (<Stage>
          <ModelViewer height={320} autoRotate autoRotateSpeed={28}>
            <Cube />
          </ModelViewer>
        </Stage>),
        },
        {
            name: "Minimalist (turn off all interactive assistance, only drag and drop)",
            render: () => (<Stage>
          <ModelViewer height={300} enableMouseParallax={false} enableHoverRotation={false} showContactShadow={false} showResetButton={false}>
            <div className="grid size-32 place-items-center rounded-2xl text-4xl font-bold text-white" style={{
                    background: "linear-gradient(135deg, var(--color-chart-2), var(--color-chart-5))",
                    transform: "translateZ(40px)",
                }}>
              UI
            </div>
          </ModelViewer>
        </Stage>),
        },
    ],
    renderWithProps: (p) => (<Stage>
      <ModelViewer height={320} autoRotate={p.autoRotate as boolean} autoRotateSpeed={p.autoRotateSpeed as number} enableMouseParallax={p.enableMouseParallax as boolean} enableHoverRotation={p.enableHoverRotation as boolean} showContactShadow={p.showContactShadow as boolean}>
        <Cube />
      </ModelViewer>
    </Stage>),
    toCode: (p) => [
        `<div className="overflow-hidden rounded-xl"`,
        `     style={{ background: "oklch(0.16 0.02 255)" }}>`,
        `  <ModelViewer`,
        `    height={320}`,
        `    autoRotate={${p.autoRotate}}`,
        `    autoRotateSpeed={${p.autoRotateSpeed}}`,
        `    enableMouseParallax={${p.enableMouseParallax}}`,
        `    enableHoverRotation={${p.enableHoverRotation}}`,
        `    showContactShadow={${p.showContactShadow}}`,
        `  >`,
        `    {/* Any children as "model" */}`,
        `    <YourModel />`,
        `  </ModelViewer>`,
        `</div>`,
    ].join("\n"),
};
