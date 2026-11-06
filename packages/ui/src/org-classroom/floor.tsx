"use client";
import { useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { avoidForeignHeads, containScale, figureScaleFor, fitScene, parkLabels, resolveLabelOverlaps, type LabelBox } from "./fit-scene";

const EDGE = 4;

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
  const [planeTop, setPlaneTop] = useState(0);

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
      plane.style.marginTop = "0px";
      if (!naturalRef.current) {
        plane.style.transform = `translateX(-50%) ${ISO_TRANSFORM} scale(1)`;
        const rect = plane.getBoundingClientRect();
        if (rect.width <= 0 || rect.height <= 0) return;
        naturalRef.current = { w: rect.width, h: rect.height };
      }
      const available = Math.max(1, frame.clientWidth - EDGE * 2);
      let scale = fitScene(naturalRef.current.w, naturalRef.current.h, available)?.scale ?? 1;
      let points: Record<string, AnchorPoint> = {};
      const layoutAt = (nextScale: number) => {
        const figureScale = figureScaleFor(nextScale);
        plane.style.transform = `translateX(-50%) ${ISO_TRANSFORM} scale(${nextScale})`;
        plane.style.setProperty("--iso-scale", String(nextScale));
        plane.style.setProperty("--figure-scale", String(figureScale));
        plane.style.setProperty("--lap-scale", String(Math.min(1.2, figureScale)));
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
          if (width <= 0 || height <= 0) continue;
          const torso = anchor.querySelector<HTMLElement>("[data-seat-torso]");
          const spot = torso ? clearSpot(torso, width, height, hostRect) : null;
          const x = (spot?.x ?? box.left + box.width / 2 - width / 2) - hostRect.left;
          const y = (spot?.y ?? box.top - height - 6) - hostRect.top;
          boxes.push({
            id: key,
            x: Math.max(EDGE, Math.min(x, frame.clientWidth - width - EDGE)),
            y,
            w: width,
            h: height,
          });
        }
        const seatChips = boxes.filter((box) => !box.id.startsWith("zone-"));
        let cursor = EDGE;
        if (seatChips.length) {
          const top = Math.min(...seatChips.map((box) => box.y));
          for (const zoneLabel of boxes.filter((box) => box.id.startsWith("zone-"))) {
            zoneLabel.y = top - zoneLabel.h - 8;
            zoneLabel.x = cursor;
            cursor += zoneLabel.w + 8;
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
        const heads: LabelBox[] = [];
        for (const torso of frame.querySelectorAll<HTMLElement>("[data-seat-torso], [data-seat-scarf], [data-seat-lap]")) {
          const seatId = torso.closest<HTMLElement>("[data-seat-id]")?.dataset.seatId;
          if (!seatId) continue;
          const box = torso.getBoundingClientRect();
          heads.push({
            id: seatId,
            x: box.left - hostRect.left,
            y: box.top - hostRect.top,
            w: box.width,
            h: box.height,
          });
        }
        const parked = resolveLabelOverlaps(
          avoidForeignHeads(parkLabels(boxes, obstacles, 4, 16), heads, 2),
          frame.clientWidth,
          4,
        );
        const placed = resolveLabelOverlaps(avoidForeignHeads(parked, heads, 2), frame.clientWidth, 4);
        const nextPoints: Record<string, AnchorPoint> = {};
        for (const box of placed) {
          nextPoints[box.id] = { x: box.x + box.w / 2, y: box.y + box.h };
        }
        for (const el of host.querySelectorAll<HTMLElement>("[data-seat-label]")) {
          const id = el.dataset.seatLabel;
          const point = id ? nextPoints[id] : undefined;
          if (!point) {
            el.style.visibility = "hidden";
            continue;
          }
          el.style.visibility = "visible";
          el.style.left = `${point.x}px`;
          el.style.top = `${point.y}px`;
          el.style.transform = "translate(-50%, -100%)";
        }
        return nextPoints;
      };
      for (let pass = 0; pass < 4; pass += 1) {
        points = layoutAt(scale);
        const painted = contentWidth(frame, plane, host);
        const nextScale = containScale(painted, available, scale);
        if (nextScale > scale - 0.015) break;
        scale = nextScale;
      }
      points = layoutAt(scale);
      const frameRect = frame.getBoundingClientRect();
      const bounds = contentEdges(frame, plane, host);
      const shift = frameRect.top + EDGE - bounds.minTop;
      if (Math.abs(shift) > 1) {
        plane.style.marginTop = `${shift}px`;
        for (const el of host.querySelectorAll<HTMLElement>("[data-seat-label]")) {
          if (getComputedStyle(el).visibility === "hidden") continue;
          el.style.top = `${(parseFloat(el.style.top) || 0) + shift}px`;
        }
        for (const id of Object.keys(points)) {
          const point = points[id];
          if (point) point.y += shift;
        }
      }
      host.style.top = "0px";
      const settled = contentEdges(frame, plane, host);
      const nextHeight = Math.max(EDGE * 2, Math.ceil(settled.maxBottom - frame.getBoundingClientRect().top + EDGE));
      setPlaneTop(0);
      setScale((current) => (Math.abs(current - scale) < 0.01 ? current : scale));
      setHeight((current) => (Math.abs(current - nextHeight) < 2 ? current : nextHeight));
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
      className="relative z-0 w-full max-w-full"
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
            ["--figure-scale" as string]: String(figureScaleFor(scale)),
            ["--lap-scale" as string]: String(Math.min(1.2, figureScaleFor(scale))),
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
                className="pointer-events-none absolute flex w-max items-center"
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

function contentWidth(frame: HTMLElement, plane: HTMLElement, host: HTMLElement) {
  return contentEdges(frame, plane, host).maxRight - contentEdges(frame, plane, host).minLeft;
}

function contentEdges(frame: HTMLElement, plane: HTMLElement, host: HTMLElement) {
  let minLeft = Infinity;
  let maxRight = -Infinity;
  let minTop = Infinity;
  let maxBottom = -Infinity;
  const nodes = [plane, ...host.querySelectorAll<HTMLElement>("[data-seat-label]")].filter(
    (node) => getComputedStyle(node).visibility !== "hidden",
  );
  for (const node of nodes) {
    const rect = node.getBoundingClientRect();
    if (rect.width === 0 && rect.height === 0) continue;
    minLeft = Math.min(minLeft, rect.left);
    maxRight = Math.max(maxRight, rect.right);
    minTop = Math.min(minTop, rect.top);
    maxBottom = Math.max(maxBottom, rect.bottom);
  }
  if (!Number.isFinite(minLeft)) {
    const rect = frame.getBoundingClientRect();
    return { minLeft: rect.left, maxRight: rect.right, minTop: rect.top, maxBottom: rect.bottom };
  }
  return { minLeft, maxRight, minTop, maxBottom };
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
