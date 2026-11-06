"use client";
import { useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { fitScene, liftLabels, type LabelBox } from "./fit-scene";

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
        plane.style.transform = `translate(-50%, -50%) ${ISO_TRANSFORM} scale(1)`;
        const rect = plane.getBoundingClientRect();
        if (rect.width <= 0 || rect.height <= 0) return;
        naturalRef.current = { w: rect.width, h: rect.height };
      }
      const next = fitScene(naturalRef.current.w, naturalRef.current.h, frame.clientWidth);
      if (!next) return;
      plane.style.transform = `translate(-50%, -50%) ${ISO_TRANSFORM} scale(${next.scale})`;
      plane.style.setProperty("--iso-scale", String(next.scale));
      plane.style.setProperty("--figure-scale", String(Math.min(1.35, 1 / next.scale)));
      const fitted = plane.getBoundingClientRect();
      const hostRect = host.getBoundingClientRect();
      const boxes: LabelBox[] = [];
      const obstacles: LabelBox[] = [];
      for (const anchor of frame.querySelectorAll<HTMLElement>("[data-anchor]")) {
        const id = anchor.dataset.anchor;
        if (!id) continue;
        const figure = anchor.querySelector<HTMLElement>("[data-seat-figure]");
        const box = (figure ?? anchor).getBoundingClientRect();
        const label = frame.querySelector<HTMLElement>(
          `[data-seat-label="${CSS.escape(id)}"], [data-seat-label="zone-${CSS.escape(id)}"]`,
        );
        const key = label?.getAttribute("data-seat-label") ?? id;
        const width = label?.offsetWidth ?? 0;
        const height = label?.offsetHeight ?? 0;
        const x = box.left + box.width / 2 - hostRect.left;
        const y = box.top - hostRect.top;
        if (width > 0 && height > 0) {
          boxes.push({ id: key, x: x - width / 2, y: y - height - (figure ? 8 : 36), w: width, h: height });
        }
      }
      for (const desk of frame.querySelectorAll<HTMLElement>("[data-desk-top], [data-seat-figure]")) {
        const box = desk.getBoundingClientRect();
        obstacles.push({
          id: desk.dataset.seatId ?? "obstacle",
          x: box.left - hostRect.left,
          y: box.top - hostRect.top,
          w: box.width,
          h: box.height,
        });
      }
      const placed = liftLabels(boxes, obstacles, 6);
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
          className="absolute left-1/2 top-1/2 [transform-style:preserve-3d]"
          style={{
            transform: `translate(-50%, -50%) ${ISO_TRANSFORM} scale(${scale})`,
            ["--iso-scale" as string]: String(scale),
            ["--figure-scale" as string]: String(Math.min(1.35, 1 / scale)),
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
                className="absolute flex items-center"
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
