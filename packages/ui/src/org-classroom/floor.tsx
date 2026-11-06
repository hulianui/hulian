"use client";
import { useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "../lib/cn";
import { fitScene, parkLabels, type LabelBox } from "./fit-scene";

/** Space above the projected board so screen-space labels are not clipped. */
const LABEL_GUTTER = 28;
const PLANE_TOP = 8;

export const ISO_TRANSFORM = "rotateX(58deg) rotateZ(-42deg)";

export type FloorAnnotation = {
  id: string;
  anchor: string;
  node: ReactNode;
};

type AnchorPoint = { x: number; y: number };

function coversDesk(x: number, y: number) {
  const hit = document.elementFromPoint(x, y);
  return Boolean(hit?.closest("[data-desk-top], [data-desk-body]"));
}

/** A chip spot in viewport pixels that is not sitting on a desktop. */
function clearSpot(head: HTMLElement, width: number, height: number, host: DOMRect) {
  const box = head.getBoundingClientRect();
  const spots = [
    { x: box.left + box.width / 2 - width / 2, y: box.top - height - 4 },
    { x: box.right + 6, y: box.top - 2 },
    { x: box.left - width - 6, y: box.top - 2 },
    { x: box.right + 6, y: box.top - height },
    { x: box.left - width - 6, y: box.top - height },
  ];
  for (const spot of spots) {
    const samples = [
      [spot.x + width / 2, spot.y + height / 2],
      [spot.x + 6, spot.y + 6],
      [spot.x + width - 6, spot.y + height - 6],
    ];
    if (samples.every(([sx, sy]) => sx > host.left && sy > host.top && !coversDesk(sx, sy))) return spot;
  }
  return spots[0]!;
}

export function Floor({
  label,
  annotations,
  layoutKey,
  children,
}: {
  label: string;
  annotations: FloorAnnotation[];
  layoutKey: string;
  children: ReactNode;
}) {
  const frameRef = useRef<HTMLDivElement>(null);
  const hostRef = useRef<HTMLDivElement>(null);
  const planeRef = useRef<HTMLDivElement>(null);
  const naturalRef = useRef<{ w: number; h: number } | null>(null);
  const keyRef = useRef(layoutKey);
  const [scale, setScale] = useState(1);
  const [height, setHeight] = useState(0);
  const [anchors, setAnchors] = useState<Record<string, AnchorPoint>>({});
  const [planeTop, setPlaneTop] = useState(PLANE_TOP);

  useLayoutEffect(() => {
    const frame = frameRef.current;
    const host = hostRef.current;
    const plane = planeRef.current;
    if (!frame || !host || !plane || typeof ResizeObserver === "undefined") return;

    const measure = () => {
      if (keyRef.current !== layoutKey) {
        keyRef.current = layoutKey;
        naturalRef.current = null;
      }
      host.style.top = "0px";
      if (!naturalRef.current) {
        plane.style.transform = `translateX(-50%) ${ISO_TRANSFORM} scale(1)`;
        const rect = plane.getBoundingClientRect();
        if (rect.width <= 0 || rect.height <= 0) return;
        naturalRef.current = { w: rect.width, h: rect.height };
      }
      const next = fitScene(naturalRef.current.w, naturalRef.current.h, frame.clientWidth);
      if (!next) return;
      plane.style.transform = `translateX(-50%) ${ISO_TRANSFORM} scale(${next.scale})`;
      plane.style.setProperty("--iso-scale", String(next.scale));
      const fitted = plane.getBoundingClientRect();
      const hostRect = host.getBoundingClientRect();
      const boxes: LabelBox[] = [];
      const obstacles: LabelBox[] = [];
      for (const anchor of frame.querySelectorAll<HTMLElement>("[data-anchor]")) {
        const id = anchor.dataset.anchor;
        if (!id) continue;
        const head = anchor.querySelector<HTMLElement>("[data-seat-torso]") ?? anchor;
        const box = head.getBoundingClientRect();
        const label = frame.querySelector<HTMLElement>(
          `[data-seat-label="${CSS.escape(id)}"], [data-seat-label="zone-${CSS.escape(id)}"]`,
        );
        const key = label?.getAttribute("data-seat-label") ?? id;
        const width = label?.offsetWidth ?? 0;
        const height = label?.offsetHeight ?? 0;
        if (width > 0 && height > 0) {
          const torso = anchor.querySelector<HTMLElement>("[data-seat-torso]");
          const spot = torso ? clearSpot(torso, width, height, hostRect) : null;
          const x = (spot?.x ?? box.left + box.width / 2 - width / 2) - hostRect.left;
          const y = (spot?.y ?? box.top - height - 6) - hostRect.top;
          boxes.push({ id: key, x, y, w: width, h: height });
        }
      }
      for (const desk of frame.querySelectorAll<HTMLElement>("[data-desk-top]")) {
        const seatId = desk.closest<HTMLElement>("[data-seat-id]")?.dataset.seatId;
        if (!seatId) continue;
        const box = desk.getBoundingClientRect();
        obstacles.push({
          id: seatId,
          x: box.left - hostRect.left,
          y: box.top - hostRect.top,
          w: box.width,
          h: box.height,
        });
      }
      const placed = parkLabels(boxes, obstacles, 3, 8);
      const overflow = placed.length === 0 ? 0 : Math.max(0, 8 - Math.min(...placed.map((box) => box.y)));
      const points: Record<string, AnchorPoint> = {};
      for (const box of placed) {
        points[box.id] = { x: box.x + box.w / 2, y: box.y + box.h };
      }
      const top = overflow;
      host.style.top = `${top}px`;
      host.style.height = `${Math.ceil(fitted.height)}px`;
      setPlaneTop((current) => (Math.abs(current - top) < 2 ? current : top));
      setScale((current) => (Math.abs(current - next.scale) < 0.01 ? current : next.scale));
      setHeight((current) => {
        const value = Math.ceil(fitted.height) + LABEL_GUTTER + overflow;
        return Math.abs(current - value) < 2 ? current : value;
      });
      setAnchors((current) => (samePoints(current, points) ? current : points));
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(frame);
    return () => observer.disconnect();
  }, [layoutKey]);

  return (
    <section
      aria-label={label}
      data-slot="org-classroom-floor"
      data-scene-scale={scale}
      className="relative w-full"
      ref={frameRef}
      style={height > 0 ? { height: height + 12 } : { minHeight: "18rem" }}
    >
      <div
        ref={hostRef}
        className="pointer-events-none absolute inset-x-0 [perspective:1400px]"
        style={{ top: planeTop }}
      >
        <div
          ref={planeRef}
          data-slot="org-classroom-plane"
          data-iso={ISO_TRANSFORM}
          className="absolute left-1/2 top-0 [transform-style:preserve-3d]"
          style={{
            transform: `translateX(-50%) ${ISO_TRANSFORM} scale(${scale})`,
            ["--iso-scale" as string]: String(scale),
          }}
        >
          {children}
        </div>
        <div className="pointer-events-none absolute inset-0" data-slot="org-classroom-labels">
          {annotations.map((annotation) => {
            const point = anchors[annotation.id];
            return (
              <div
                key={annotation.id}
                data-seat-label={annotation.id}
                className={cn(
                "absolute flex w-max items-center",
                annotation.id.startsWith("zone-") ? "pointer-events-none" : "pointer-events-auto",
              )}
                style={
                  point
                    ? { left: point.x, top: point.y, transform: "translate(-50%, -100%)" }
                    : { left: 0, top: 0, visibility: "hidden" }
                }
              >
                {annotation.node}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function samePoints(left: Record<string, AnchorPoint>, right: Record<string, AnchorPoint>) {
  const leftKeys = Object.keys(left);
  const rightKeys = Object.keys(right);
  if (leftKeys.length !== rightKeys.length) return false;
  return rightKeys.every((key) => {
    const a = left[key];
    const b = right[key];
    return a && b && Math.abs(a.x - b.x) < 1 && Math.abs(a.y - b.y) < 1;
  });
}
