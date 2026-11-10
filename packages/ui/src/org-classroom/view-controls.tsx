import { memo } from "react";
import { Button } from "../button";
import type { OrgClassroomCopy } from "./copy";
import { compassGeometry, compassNeedleDeg } from "./iso-layout";
import type { ViewAngle } from "./org-classroom.types";

const RotateIcon = ({ clockwise }: { clockwise: boolean }) => (
  <svg
    viewBox="0 0 20 20"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.8}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden
    className="size-4"
    style={clockwise ? undefined : { transform: "scaleX(-1)" }}
  >
    <path d="M15.5 9.5A5.5 5.5 0 1 1 10 4.5h3" />
    <path d="M11 2l2.5 2.5L11 7" />
  </svg>
);

/**
 * 指南针 + 两颗旋转视角按钮。指南针画成平放在地面上的圆投到屏幕上的样子：
 * 椭圆和场景地板同一个透视，北向刻度落在真北投影的位置，转视角时跟着转。
 */
function ViewControlsImpl({
  copy,
  view,
  northDeg,
  onViewChange,
}: {
  copy: OrgClassroomCopy;
  view: ViewAngle;
  northDeg: number;
  onViewChange: (view: ViewAngle) => void;
}) {
  const needle = compassNeedleDeg(northDeg, view);
  const turn = (delta: number) => onViewChange(((((view + delta) % 360) + 360) % 360) as ViewAngle);
  const { ring, cardinals } = compassGeometry(northDeg, view);
  const C = { x: 22, y: 16 };
  const R = 13;
  const at = (p: { x: number; y: number }, k = 1) => ({ x: C.x + p.x * R * k, y: C.y + p.y * R * k });
  const ringPath = ring.map((p, i) => `${i ? "L" : "M"}${at(p).x.toFixed(2)} ${at(p).y.toFixed(2)}`).join("") + "Z";
  const [north, , south] = cardinals;
  const tip = at(north, 0.86);
  const tail = at(south, 0.86);
  const label = at(north, 1.42);

  return (
    <div
      role="group"
      aria-label={copy.compass}
      data-slot="org-classroom-view"
      className="inline-flex items-center gap-1"
    >
      <Button
        type="button"
        size="iconSm"
        variant="ghost"
        tone="neutral"
        aria-label={copy.rotateCounterClockwise}
        data-view-rotate="ccw"
        onClick={() => turn(-90)}
      >
        <RotateIcon clockwise={false} />
      </Button>
      <svg
        viewBox="0 0 44 32"
        role="img"
        aria-label={`${copy.compass} · ${copy.north}`}
        data-compass
        data-needle-deg={needle.toFixed(1)}
        className="h-8 w-11 shrink-0 overflow-visible"
      >
        <path d={ringPath} className="fill-surface stroke-border" strokeWidth="1" />
        {cardinals.map((p, i) => {
          const a = at(p, 0.78);
          const b = at(p, 1);
          return (
            <path key={i} d={`M${a.x} ${a.y}L${b.x} ${b.y}`} className="stroke-muted-foreground/60" strokeWidth="1" />
          );
        })}
        <path
          data-compass-needle
          d={`M${tip.x} ${tip.y}L${C.x} ${C.y}`}
          className="stroke-danger"
          strokeWidth="2.2"
          strokeLinecap="round"
        />
        <path
          d={`M${C.x} ${C.y}L${tail.x} ${tail.y}`}
          className="stroke-muted-foreground/50"
          strokeWidth="2.2"
          strokeLinecap="round"
        />
        <circle cx={C.x} cy={C.y} r="1.6" className="fill-foreground" />
        <text
          x={label.x}
          y={label.y}
          textAnchor="middle"
          dominantBaseline="central"
          className="fill-danger text-[8px] font-bold"
          aria-hidden
        >
          {copy.north}
        </text>
      </svg>
      <Button
        type="button"
        size="iconSm"
        variant="ghost"
        tone="neutral"
        aria-label={copy.rotateClockwise}
        data-view-rotate="cw"
        onClick={() => turn(90)}
      >
        <RotateIcon clockwise />
      </Button>
    </div>
  );
}

export const ViewControls = memo(ViewControlsImpl);
ViewControls.displayName = "OrgClassroomViewControls";
