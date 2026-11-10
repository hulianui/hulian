"use client";
import {
  memo,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type MouseEvent as ReactMouseEvent,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { cn } from "../lib/cn";
import type { OrgClassroomCopy } from "./copy";
import {
  COMPACT_BELOW,
  fitScale,
  hitSeat,
  hitZone,
  layoutScene,
  polygonClipPath,
  SPRITE_KEYS,
  spriteFor,
  type AlphaMap,
  type SeatLayout,
  type SpriteKey,
} from "./iso-layout";
import type { SpriteGroup } from "./org-classroom-sprites";
import type { Seat, ViewAngle, Zone } from "./org-classroom.types";
import { STATUS_DOT, StatusChip } from "./status-chip";

const EDGE = 4;

/** 每个颜色组吃哪个主题色。深色主题下人会变浅，桌面会变深，围巾跟分区色。 */
const GROUP_COLOR: Record<SpriteGroup, string> = {
  metal: "color-mix(in oklab, var(--color-muted-foreground) 80%, var(--color-foreground))",
  chair: "color-mix(in oklab, var(--color-muted) 70%, var(--color-muted-foreground))",
  desk: "var(--color-surface)",
  pants: "color-mix(in oklab, var(--color-foreground) 70%, var(--color-surface))",
  body: "color-mix(in oklab, var(--color-foreground) 80%, var(--color-surface))",
  scarf: "var(--zone-accent, var(--color-primary))",
};

/** 大块 base64 只在场景根上写一次，各层用 var() 引用，DOM 不随座位数膨胀。 */
function spriteVars(): CSSProperties {
  const vars: Record<string, string> = {};
  for (const key of SPRITE_KEYS) {
    const sprite = spriteFor(key);
    vars[`--oc-${key}-shadow`] = `url("${sprite.shadow}")`;
    vars[`--oc-${key}-shading`] = `url("${sprite.shading}")`;
    for (const layer of sprite.layers) vars[`--oc-${key}-${layer.group}`] = `url("${layer.mask}")`;
  }
  return vars as CSSProperties;
}
const SPRITE_VARS = spriteVars();

const FILL: CSSProperties = { position: "absolute", inset: 0, backgroundSize: "100% 100%" };

const SpriteLayers = memo(function SpriteLayers({ variant }: { variant: SpriteKey }) {
  const sprite = spriteFor(variant);
  return (
    <>
      <span aria-hidden style={{ ...FILL, backgroundImage: `var(--oc-${variant}-shadow)` }} />
      {sprite.layers.map((layer) => {
        const mask = `var(--oc-${variant}-${layer.group})`;
        return (
          <span
            key={layer.group}
            aria-hidden
            data-sprite-layer={layer.group}
            style={{
              ...FILL,
              backgroundColor: GROUP_COLOR[layer.group],
              maskImage: mask,
              WebkitMaskImage: mask,
              maskSize: "100% 100%",
              WebkitMaskSize: "100% 100%",
            }}
          />
        );
      })}
      <span
        aria-hidden
        style={{
          ...FILL,
          backgroundImage: `var(--oc-${variant}-shading)`,
          mixBlendMode: "multiply",
        }}
      />
    </>
  );
});

/** 解码一张遮罩的 alpha。jsdom / 不支持 canvas 时返回 null，命中退回凸包。 */
function loadAlpha(src: string): Promise<AlphaMap | null> {
  if (typeof Image === "undefined" || typeof document === "undefined") return Promise.resolve(null);
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext("2d", { willReadFrequently: true });
        if (!ctx) return resolve(null);
        ctx.drawImage(img, 0, 0);
        const { data } = ctx.getImageData(0, 0, canvas.width, canvas.height);
        resolve({ w: canvas.width, h: canvas.height, data });
      } catch {
        resolve(null);
      }
    };
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

let alphaCache: Promise<Partial<Record<SpriteKey, AlphaMap | null>>> | null = null;
function loadAllAlpha() {
  alphaCache ??= Promise.all(
    SPRITE_KEYS.map(async (key) => {
      const union = spriteFor(key).layers[0];
      return [key, union ? await loadAlpha(union.mask) : null] as const;
    }),
  ).then((entries) => Object.fromEntries(entries));
  return alphaCache;
}

export interface FloorProps {
  zones: Zone[];
  copy: OrgClassroomCopy;
  focusedZoneId: string | null;
  selectedSeatId: string | null;
  onSeatSelect: (seatId: string) => void;
  onZoneToggle: (zoneId: string) => void;
  view: ViewAngle;
}

function FloorImpl({ zones, copy, focusedZoneId, selectedSeatId, onSeatSelect, onZoneToggle, view }: FloorProps) {
  const layout = useMemo(() => layoutScene(zones, view), [zones, view]);
  const frameRef = useRef<HTMLElement>(null);
  const [available, setAvailable] = useState(0);
  const [hoverId, setHoverId] = useState<string | null>(null);
  const alphaRef = useRef<Partial<Record<SpriteKey, AlphaMap | null>>>({});
  const [hitReady, setHitReady] = useState(false);

  useLayoutEffect(() => {
    const frame = frameRef.current;
    if (!frame) return;
    const measure = () => setAvailable(Math.max(0, frame.clientWidth - EDGE * 2));
    measure();
    if (typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(measure);
    observer.observe(frame);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    let live = true;
    void loadAllAlpha().then((maps) => {
      if (!live) return;
      alphaRef.current = maps;
      setHitReady(Object.values(maps).every(Boolean));
    });
    return () => {
      live = false;
    };
  }, []);

  const scale = fitScale(layout.width, available);
  const compact = scale < COMPACT_BELOW;
  const seatById = useMemo(() => {
    const map = new Map<string, Seat>();
    for (const zone of zones) for (const seat of zone.seats) map.set(seat.id, seat);
    return map;
  }, [zones]);
  const accentOf = useMemo(() => new Map(zones.map((zone) => [zone.id, zone.accent])), [zones]);

  const scenePoint = useCallback(
    (event: { clientX: number; clientY: number; currentTarget: Element }) => {
      const rect = event.currentTarget.getBoundingClientRect();
      return { x: (event.clientX - rect.left) / scale, y: (event.clientY - rect.top) / scale };
    },
    [scale],
  );

  const onSceneClick = useCallback(
    (event: ReactMouseEvent<HTMLDivElement>) => {
      // 座位按钮和气泡自己处理点击（键盘、读屏、测试都走那条路）。
      if ((event.target as Element).closest("button, [data-seat-label]")) return;
      const point = scenePoint(event);
      const seatId = hitSeat(layout.seats, point, alphaRef.current);
      if (seatId) return onSeatSelect(seatId);
      const zoneId = hitZone(layout.zones, point);
      if (zoneId) onZoneToggle(zoneId);
    },
    [layout, onSeatSelect, onZoneToggle, scenePoint],
  );

  const onScenePointerMove = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      if (event.pointerType !== "mouse") return;
      const point = scenePoint(event);
      const seatId = hitSeat(layout.seats, point, alphaRef.current);
      setHoverId((current) => (current === seatId ? current : seatId));
      const over = seatId != null || hitZone(layout.zones, point) != null;
      event.currentTarget.style.cursor = over ? "pointer" : "";
    },
    [layout, scenePoint],
  );

  const seatsByZone = useMemo(() => {
    const groups = new Map<string, SeatLayout[]>();
    for (const seat of layout.seats) {
      const list = groups.get(seat.zoneId) ?? [];
      list.push(seat);
      groups.set(seat.zoneId, list);
    }
    return groups;
  }, [layout]);

  const depthRank = useMemo(() => {
    const ranked = [...layout.seats].sort((a, b) => a.depth - b.depth);
    return new Map(ranked.map((seat, index) => [seat.seatId, index + 1]));
  }, [layout]);

  return (
    <section
      ref={frameRef}
      aria-label={copy.floor}
      data-slot="org-classroom-floor"
      data-scene-scale={scale.toFixed(3)}
      data-view={view}
      data-compact={compact ? "true" : "false"}
      className="group/floor relative w-full max-w-full"
      style={{ height: Math.ceil(layout.height * scale) + EDGE * 2 }}
    >
      <div
        data-slot="org-classroom-scene"
        data-hit-ready={hitReady ? "true" : "false"}
        className="absolute left-1/2 -translate-x-1/2"
        style={{
          top: EDGE,
          width: layout.width * scale,
          height: layout.height * scale,
          ...SPRITE_VARS,
        }}
        onClick={onSceneClick}
        onPointerMove={onScenePointerMove}
        onPointerLeave={() => setHoverId(null)}
      >
        <div
          className="absolute left-0 top-0 origin-top-left"
          style={{ width: layout.width, height: layout.height, transform: `scale(${scale})` }}
        >
          {layout.zones.map((zoneLayout) => {
            const zone = zones.find((item) => item.id === zoneLayout.zoneId)!;
            const focused = focusedZoneId === zone.id;
            const quiet = focusedZoneId != null && !focused;
            const { box } = zoneLayout;
            const points = zoneLayout.polygon.map((p) => `${p.x - box.x},${p.y - box.y}`).join(" ");
            return (
              <div
                key={zone.id}
                data-zone-id={zone.id}
                data-focused={focused ? "true" : "false"}
                data-quiet={quiet ? "true" : "false"}
                className="group/zone transition-opacity duration-300 ease-out motion-reduce:transition-none data-[quiet=true]:opacity-40"
                style={{ "--zone-accent": zone.accent } as CSSProperties}
              >
                <svg
                  aria-hidden
                  className="pointer-events-none absolute overflow-visible"
                  style={{ left: box.x, top: box.y, width: box.w, height: box.h }}
                >
                  <polygon
                    points={points}
                    strokeLinejoin="round"
                    strokeWidth={14}
                    className="fill-[color-mix(in_oklab,var(--zone-accent)_14%,var(--color-surface))] stroke-[color-mix(in_oklab,var(--zone-accent)_14%,var(--color-surface))] group-data-[focused=true]/zone:fill-[color-mix(in_oklab,var(--zone-accent)_24%,var(--color-surface))] group-data-[focused=true]/zone:stroke-[color-mix(in_oklab,var(--zone-accent)_45%,var(--color-surface))]"
                  />
                </svg>
                <button
                  type="button"
                  data-zone-floor
                  aria-pressed={focused}
                  aria-label={focused ? copy.clearFocus(zone.name) : copy.focusZone(zone.name)}
                  className="pointer-events-none absolute border-0 bg-transparent p-0 outline-none focus-visible:bg-primary/15"
                  style={{
                    left: box.x,
                    top: box.y,
                    width: box.w,
                    height: box.h,
                    clipPath: polygonClipPath(zoneLayout.polygon, box),
                  }}
                  onClick={(event) => {
                    event.stopPropagation();
                    onZoneToggle(zone.id);
                  }}
                />
              </div>
            );
          })}
          {zones.map((zone) => {
            const quiet = focusedZoneId != null && focusedZoneId !== zone.id;
            return (
              <div
                key={zone.id}
                data-zone-seats={zone.id}
                data-quiet={quiet ? "true" : "false"}
                className="transition-opacity duration-300 ease-out motion-reduce:transition-none data-[quiet=true]:opacity-40"
                style={{ "--zone-accent": zone.accent } as CSSProperties}
              >
                {(seatsByZone.get(zone.id) ?? []).map((seatLayout) => {
                  const seat = seatById.get(seatLayout.seatId)!;
                  const selected = seat.id === selectedSeatId;
                  const label = seat.person
                    ? copy.seatLabel(seat.person.name, copy.statuses[seat.person.status])
                    : copy.emptySeatLabel(seat.row, seat.col);
                  const { box } = seatLayout;
                  return (
                    <div
                      key={seat.id}
                      data-seat-id={seat.id}
                      data-selected={selected ? "true" : "false"}
                      data-hover={hoverId === seat.id ? "true" : "false"}
                      className="group/seat pointer-events-none absolute"
                      style={{
                        left: box.x,
                        top: box.y,
                        width: box.w,
                        height: box.h,
                        zIndex: depthRank.get(seat.id),
                      }}
                    >
                      <span
                        data-seat-sprite
                        className={cn(
                          // 光晕直接切换，不做 filter 过渡：从 none 插值到 drop-shadow 时起点颜色是 currentcolor，会先闪黑再变主色
                          "absolute inset-0 isolate",
                          "group-data-[hover=true]/seat:[filter:drop-shadow(0_0_1.5px_var(--color-primary))]",
                          "group-has-[:focus-visible]/seat:[filter:drop-shadow(0_0_1.5px_var(--color-primary))_drop-shadow(0_0_1.5px_var(--color-primary))]",
                          "group-data-[selected=true]/seat:[filter:drop-shadow(0_0_1.5px_var(--color-primary))_drop-shadow(0_0_1.5px_var(--color-primary))]",
                        )}
                      >
                        <SpriteLayers variant={seatLayout.sprite} />
                      </span>
                      <button
                        type="button"
                        data-seat-hit
                        aria-pressed={selected}
                        aria-label={label}
                        className="pointer-events-none absolute inset-0 border-0 bg-transparent p-0 outline-none"
                        style={{ clipPath: spriteFor(seatLayout.sprite).hull }}
                        onClick={(event) => {
                          event.stopPropagation();
                          onSeatSelect(seat.id);
                        }}
                      />
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
        <div
          className="pointer-events-none absolute inset-0"
          data-slot="org-classroom-labels"
          style={{ zIndex: layout.seats.length + 1 }}
        >
          {layout.seats.map((seatLayout) => {
            const seat = seatById.get(seatLayout.seatId)!;
            if (!seat.person || !seatLayout.head) return null;
            const person = seat.person;
            const quiet = focusedZoneId != null && focusedZoneId !== seatLayout.zoneId;
            return (
              <div
                key={seat.id}
                data-seat-label={seat.id}
                data-quiet={quiet ? "true" : "false"}
                className="pointer-events-auto absolute flex w-max cursor-pointer items-center transition-opacity duration-300 ease-out motion-reduce:transition-none data-[quiet=true]:opacity-40"
                style={{
                  left: seatLayout.head.x * scale,
                  top: seatLayout.head.y * scale - 3,
                  transform: "translate(-50%, -100%)",
                  zIndex: depthRank.get(seat.id),
                  ["--zone-accent" as string]: accentOf.get(seatLayout.zoneId),
                }}
                aria-hidden
                onClick={(event) => {
                  event.stopPropagation();
                  onSeatSelect(seat.id);
                }}
              >
                <span className="inline-flex items-center gap-1 rounded-full bg-surface/95 py-0.5 pl-0.5 pr-2 shadow-sm ring-1 ring-border group-data-[compact=true]/floor:hidden">
                  <StatusChip status={person.status} labels={copy.statuses} />
                  <span className="whitespace-nowrap text-xs font-medium leading-none text-foreground">
                    {person.name}
                  </span>
                </span>
                <span
                  data-status-dot={person.status}
                  className={cn(
                    "hidden size-2.5 rounded-full ring-2 ring-surface group-data-[compact=true]/floor:block",
                    STATUS_DOT[person.status],
                  )}
                />
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export const Floor = memo(FloorImpl);
Floor.displayName = "OrgClassroomFloor";
