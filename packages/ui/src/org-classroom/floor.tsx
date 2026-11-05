"use client";
import { useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { fitScene, separateLabels } from "./fit-scene";

/** Space above the projected board so screen-space labels are not clipped. */
const LABEL_GUTTER = 40;

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
  const planeRef = useRef<HTMLDivElement>(null);
  const naturalRef = useRef<{ w: number; h: number } | null>(null);
  const keyRef = useRef(layoutKey);
  const [scale, setScale] = useState(1);
  const [height, setHeight] = useState(0);
  const [anchors, setAnchors] = useState<Record<string, AnchorPoint>>({});

  useLayoutEffect(() => {
    const frame = frameRef.current;
    const plane = planeRef.current;
    if (!frame || !plane || typeof ResizeObserver === "undefined") return;

    const measure = () => {
      if (keyRef.current !== layoutKey) {
        keyRef.current = layoutKey;
        naturalRef.current = null;
      }
      if (!naturalRef.current) {
        plane.style.transform = `translate(-50%, -50%) ${ISO_TRANSFORM} scale(1)`;
        const rect = plane.getBoundingClientRect();
        if (rect.width <= 0 || rect.height <= 0) return;
        naturalRef.current = { w: rect.width, h: rect.height };
      }
      const next = fitScene(naturalRef.current.w, naturalRef.current.h, frame.clientWidth);
      if (!next) return;
      plane.style.transform = `translate(-50%, -50%) ${ISO_TRANSFORM} scale(${next.scale})`;
      const fitted = plane.getBoundingClientRect();
      const frameRect = frame.getBoundingClientRect();
      const points: Record<string, AnchorPoint> = {};
      const boxes = [];
      for (const anchor of frame.querySelectorAll<HTMLElement>("[data-anchor]")) {
        const id = anchor.dataset.anchor;
        if (!id) continue;
        const box = anchor.getBoundingClientRect();
        const label = frame.querySelector<HTMLElement>(
          `[data-seat-label="${CSS.escape(id)}"], [data-seat-label="zone-${CSS.escape(id)}"]`,
        );
        const key = label?.getAttribute("data-seat-label") ?? id;
        const width = label?.offsetWidth ?? 0;
        const height = label?.offsetHeight ?? 0;
        const x = box.left + box.width / 2 - frameRect.left;
        const y = box.top - frameRect.top;
        points[key] = { x, y };
        if (width > 0 && height > 0) {
          boxes.push({ id: key, x: x - width / 2, y: y - height, w: width, h: height });
        }
      }
      for (const box of separateLabels(boxes)) {
        points[box.id] = { x: box.x + box.w / 2, y: box.y + box.h };
      }
      setScale((current) => (Math.abs(current - next.scale) < 0.01 ? current : next.scale));
      setHeight((current) => {
        const value = Math.ceil(fitted.height) + LABEL_GUTTER;
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
      <div className="pointer-events-none absolute inset-x-0 bottom-0 top-10 [perspective:1400px]">
        <div
          ref={planeRef}
          data-slot="org-classroom-plane"
          data-iso={ISO_TRANSFORM}
          className="absolute left-1/2 top-1/2 [transform-style:preserve-3d]"
          style={{ transform: `translate(-50%, -50%) ${ISO_TRANSFORM} scale(${scale})` }}
        >
          {children}
        </div>
      </div>
      <div className="pointer-events-none absolute inset-0" data-slot="org-classroom-labels">
        {annotations.map((annotation) => {
          const point = anchors[annotation.id];
          return (
            <div
              key={annotation.id}
              data-seat-label={annotation.id}
              className="absolute flex max-w-[5.5rem] flex-col items-center gap-0.5"
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
