"use client";
import { useState } from "react";
import type { ShowcaseSpec } from "../showcase/types";
import { Tilt } from "./tilt";

function Card({ children }: { children?: React.ReactNode }) {
  return (
    <div className="grid h-44 w-64 place-items-center rounded-[calc(var(--radius)+0.25rem)] border border-hairline bg-surface p-6 text-center shadow-lg">
      {children}
    </div>
  );
}

/** 深色卡：白色高光打在浅色卡面上等于看不见，演示 glare 必须用深底。 */
function DarkCard({ children }: { children?: React.ReactNode }) {
  return (
    <div
      className="grid h-44 w-64 place-items-center rounded-[calc(var(--radius)+0.25rem)] p-6 text-center text-sm text-white shadow-lg"
      style={{ background: "linear-gradient(145deg, var(--color-chart-5), var(--color-chart-2))" }}
    >
      {children}
    </div>
  );
}

function ManualDemo() {
  const [x, setX] = useState(0);
  const [y, setY] = useState(18);
  return (
    <div className="flex flex-wrap items-center gap-8">
      <Tilt manualAngleX={x} manualAngleY={y} glare glareBorderRadius="calc(var(--radius) + 0.25rem)">
        <DarkCard>滑杆驱动</DarkCard>
      </Tilt>
      <div className="flex w-56 flex-col gap-3 text-xs text-muted">
        <label className="flex flex-col gap-1">
          rotateX {x}°
          <input type="range" min={-30} max={30} value={x} onChange={(e) => setX(Number(e.target.value))} />
        </label>
        <label className="flex flex-col gap-1">
          rotateY {y}°
          <input type="range" min={-30} max={30} value={y} onChange={(e) => setY(Number(e.target.value))} />
        </label>
      </div>
    </div>
  );
}

function ReadoutDemo() {
  const [state, setState] = useState({ rx: 0, ry: 0, op: 0 });
  return (
    <div className="flex flex-wrap items-center gap-8">
      <Tilt
        maxAngleX={16}
        maxAngleY={16}
        glare
        glareBorderRadius="calc(var(--radius) + 0.25rem)"
        onTiltMove={({ angles, glare }) =>
          setState({ rx: Math.round(angles.rotateX), ry: Math.round(angles.rotateY), op: glare.opacity })
        }
      >
        <DarkCard>在我上面移动</DarkCard>
      </Tilt>
      <p className="font-mono text-xs text-muted">
        rotateX {state.rx}° · rotateY {state.ry}° · glare {state.op.toFixed(2)}
      </p>
    </div>
  );
}

export const tiltShowcase: ShowcaseSpec = {
  examples: [
    {
      title: "基础用法",
      description: "裹住任意内容即可获得指针视差倾斜；离开自动归位。",
      code: `<Tilt>
  <Card>任意内容</Card>
</Tilt>`,
      render: () => (
        <Tilt>
          <Card>
            <span className="text-sm text-muted">悬停试试</span>
          </Card>
        </Tilt>
      ),
    },
    {
      title: "反光高光",
      description: "glare 开启跟随指针的高光层；glareBorderRadius 要与被裹元素圆角一致，否则高光溢出圆角。",
      code: `<Tilt
  glare
  glareMaxOpacity={0.45}
  glareBorderRadius="calc(var(--radius) + 0.25rem)"
  maxAngleX={16}
  maxAngleY={16}
>
  <DarkCard>会反光的卡</DarkCard>
</Tilt>`,
      render: () => (
        <Tilt glare glareMaxOpacity={0.45} glareBorderRadius="calc(var(--radius) + 0.25rem)" maxAngleX={16} maxAngleY={16}>
          <DarkCard>会反光的卡</DarkCard>
        </Tilt>
      ),
    },
    {
      title: "单轴 · 反向 · 静息角 · 放大",
      description: "axis 限制单轴；reverse 反向；initialAngle 给个静息倾斜；scale 悬停放大。",
      code: `<>
  <Tilt axis="x" maxAngleX={18}><Card>只绕 X</Card></Tilt>
  <Tilt reverse><Card>反向</Card></Tilt>
  <Tilt initialAngleY={-12} scale={1.06}><Card>静息 -12°</Card></Tilt>
</>`,
      render: () => (
        <div className="flex flex-wrap gap-6">
          <Tilt axis="x" maxAngleX={18}>
            <Card>
              <span className="text-sm text-muted">只绕 X</span>
            </Card>
          </Tilt>
          <Tilt reverse>
            <Card>
              <span className="text-sm text-muted">反向</span>
            </Card>
          </Tilt>
          <Tilt initialAngleY={-12} scale={1.06}>
            <Card>
              <span className="text-sm text-muted">静息 -12°</span>
            </Card>
          </Tilt>
        </div>
      ),
    },
    {
      title: "手动角度（滑杆驱动）",
      description: "manualAngleX/Y 接管对应轴，指针不再影响它——摇杆、滑杆、滚动进度都能驱动。",
      code: `const [x, setX] = useState(0)

<Tilt manualAngleX={x} manualAngleY={18} glare>
  <DarkCard>滑杆驱动</DarkCard>
</Tilt>`,
      render: () => <ManualDemo />,
    },
    {
      title: "读取实时角度",
      description: "onTiltMove 每帧回传角度与反光强度，可拿去驱动别的图层做多层视差。",
      code: `<Tilt onTiltMove={({ angles, glare }) => setState(...)}>
  <DarkCard>在我上面移动</DarkCard>
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
      name: "默认",
      render: () => (
        <Tilt>
          <Card>
            <span className="text-sm text-muted">悬停试试</span>
          </Card>
        </Tilt>
      ),
    },
    {
      name: "反光",
      render: () => (
        <Tilt glare glareMaxOpacity={0.45} glareBorderRadius="calc(var(--radius) + 0.25rem)">
          <DarkCard>会反光的卡</DarkCard>
        </Tilt>
      ),
    },
    { name: "手动角度", render: () => <ManualDemo /> },
    { name: "实时角度读数", render: () => <ReadoutDemo /> },
  ],
  renderWithProps: (p) => (
    <Tilt
      maxAngleX={Number(p.maxAngleX ?? 12)}
      maxAngleY={Number(p.maxAngleY ?? 12)}
      scale={Number(p.scale ?? 1)}
      perspective={Number(p.perspective ?? 1000)}
      glare={p.glare !== false}
      reverse={p.reverse === true}
      glareBorderRadius="calc(var(--radius) + 0.25rem)"
    >
      <DarkCard>Playground</DarkCard>
    </Tilt>
  ),
  toCode: (p) =>
    `<Tilt\n  maxAngleX={${p.maxAngleX ?? 12}}\n  maxAngleY={${p.maxAngleY ?? 12}}${
      p.scale && Number(p.scale) !== 1 ? `\n  scale={${p.scale}}` : ""
    }${p.perspective && Number(p.perspective) !== 1000 ? `\n  perspective={${p.perspective}}` : ""}${
      p.glare !== false ? "\n  glare" : ""
    }${p.reverse === true ? "\n  reverse" : ""}\n>\n  <Card>…</Card>\n</Tilt>`,
};
