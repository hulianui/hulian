import {
  ORG_CLASSROOM_GRID as GRID,
  ORG_CLASSROOM_PROJECTION as PROJECTION,
  ORG_CLASSROOM_SPRITES as SPRITES,
  type SeatRotation,
  type SeatSprite,
} from "./org-classroom-sprites";
import type { ViewAngle, Zone, ZoneFacing } from "./org-classroom.types";

/**
 * 三套坐标：
 * - 分区局部：人面朝 -Y，第 1 排在 y=0，往后的排沿 -Y（离讲台更近），列沿 +X 拼桌。
 * - 平面：楼层平面图，+Y 是图上方。分区按 `facing` 转进平面，再沿 +X 依次排开。
 * - 相机：平面按视角转过去之后，用烘焙相机的基向量投影成屏幕像素（缩放 1）。
 * 一张座位图长什么样只看「座位朝向 − 视角」，所以只烘 4 个相对角。
 */
export type Point = { x: number; y: number };
export type Box = { x: number; y: number; w: number; h: number };
export type SpriteVariant = "occupied" | "empty";
export type SpriteKey = `${SeatRotation}-${SpriteVariant}`;

/** 分区地板比座位占地多留的边，米。 */
const ZONE_PAD = 0.24;
/** 相邻分区之间的过道，米。 */
const ZONE_GAP = 0.5;
/** 头顶上给人名气泡留的高度，像素。 */
export const LABEL_ROOM = 30;
/** 场景缩到这个比例以下时，人名气泡收成状态圆点。 */
export const COMPACT_BELOW = 0.68;

/** 人面朝的平面方向 → 相对「面朝 -Y」逆时针转过的角度。 */
export const FACING_DEG: Record<ZoneFacing, number> = { down: 0, right: 90, up: 180, left: 270 };
export const VIEW_ANGLES: readonly ViewAngle[] = [0, 90, 180, 270];

export const SPRITE_KEYS: readonly SpriteKey[] = ([0, 90, 180, 270] as const).flatMap((rot) => [
  `${rot}-occupied` as const,
  `${rot}-empty` as const,
]);

function normDeg(deg: number) {
  return ((deg % 360) + 360) % 360;
}

/** 逆时针转 deg 度。 */
function rotate(p: Point, deg: number): Point {
  const r = (deg * Math.PI) / 180;
  const c = Math.round(Math.cos(r) * 1e9) / 1e9;
  const s = Math.round(Math.sin(r) * 1e9) / 1e9;
  return { x: p.x * c - p.y * s, y: p.x * s + p.y * c };
}

/** 相机坐标（米）→ 屏幕像素（缩放 1）。 */
export function project(x: number, y: number, z = 0): Point {
  const [rx, ry, rz] = PROJECTION.right;
  const [ux, uy, uz] = PROJECTION.up;
  const k = PROJECTION.pxPerMeter;
  return { x: (rx * x + ry * y + rz * z) * k, y: 0 - (ux * x + uy * y + uz * z) * k };
}

/** 平面坐标在视角 `view` 下的屏幕像素。视角加 90 = 楼层在屏幕上顺时针转 90°。 */
export function projectPlan(p: Point, view: ViewAngle): Point {
  const q = rotate(p, -view);
  return project(q.x, q.y);
}

export function spriteKey(rotation: SeatRotation, variant: SpriteVariant): SpriteKey {
  return `${rotation}-${variant}`;
}

export function spriteFor(key: SpriteKey): SeatSprite {
  const [rot, variant] = key.split("-") as [string, SpriteVariant];
  return SPRITES[Number(rot) as SeatRotation][variant];
}

export interface SeatLayout {
  seatId: string;
  zoneId: string;
  sprite: SpriteKey;
  /** 精灵图的盒子。 */
  box: Box;
  /** 头顶，空座位没有。 */
  head: Point | null;
  /** 屏幕上越靠下越靠前；用来排绘制顺序和命中顺序。 */
  depth: number;
}

export interface ZoneLayout {
  zoneId: string;
  /** 地板四角。 */
  polygon: Point[];
  box: Box;
}

export interface SceneLayout {
  width: number;
  height: number;
  zones: ZoneLayout[];
  seats: SeatLayout[];
}

function boxOf(points: readonly Point[]): Box {
  const xs = points.map((p) => p.x);
  const ys = points.map((p) => p.y);
  const x = Math.min(...xs);
  const y = Math.min(...ys);
  return { x, y, w: Math.max(...xs) - x, h: Math.max(...ys) - y };
}

/** 把分区和座位摆进场景。纯函数，不碰 DOM。 */
export function layoutScene(zones: readonly Zone[], view: ViewAngle = 0): SceneLayout {
  const fp = GRID.footprint;
  const outZones: ZoneLayout[] = [];
  const outSeats: SeatLayout[] = [];
  const extents: Point[] = [];
  let cursorX = 0;

  for (const zone of zones) {
    const yaw = FACING_DEG[zone.facing ?? "down"];
    const cols = Math.max(1, ...zone.seats.map((seat) => seat.col));
    const rows = Math.max(1, ...zone.seats.map((seat) => seat.row));
    const right = (cols - 1) * GRID.colPitch + fp.maxX + ZONE_PAD;
    const bottom = -(rows - 1) * GRID.rowPitch + fp.minY - ZONE_PAD;
    const local = [
      { x: fp.minX - ZONE_PAD, y: fp.maxY + ZONE_PAD },
      { x: right, y: fp.maxY + ZONE_PAD },
      { x: right, y: bottom },
      { x: fp.minX - ZONE_PAD, y: bottom },
    ].map((p) => rotate(p, yaw));
    const minX = Math.min(...local.map((p) => p.x));
    const maxX = Math.max(...local.map((p) => p.x));
    const minY = Math.min(...local.map((p) => p.y));
    // 分区左缘对齐游标，所有分区的平面下缘对齐
    const offset = { x: cursorX - minX, y: -minY };
    const toPlan = (p: Point) => ({ x: p.x + offset.x, y: p.y + offset.y });
    const polygon = local.map((p) => projectPlan(toPlan(p), view));
    outZones.push({ zoneId: zone.id, polygon, box: boxOf(polygon) });
    extents.push(...polygon);

    const rotation = normDeg(yaw - view) as SeatRotation;
    for (const seat of zone.seats) {
      const variant: SpriteVariant = seat.person ? "occupied" : "empty";
      const key = spriteKey(rotation, variant);
      const sprite = spriteFor(key);
      const at = rotate(
        { x: (Math.max(seat.col, 1) - 1) * GRID.colPitch, y: -(Math.max(seat.row, 1) - 1) * GRID.rowPitch },
        yaw,
      );
      const origin = projectPlan(toPlan(at), view);
      const box = { x: origin.x - sprite.anchor[0], y: origin.y - sprite.anchor[1], w: sprite.w, h: sprite.h };
      const head = sprite.head ? { x: box.x + sprite.head[0], y: box.y + sprite.head[1] } : null;
      outSeats.push({ seatId: seat.id, zoneId: zone.id, sprite: key, box, head, depth: origin.y });
      extents.push({ x: box.x, y: box.y }, { x: box.x + box.w, y: box.y + box.h });
      if (head) extents.push({ x: head.x, y: head.y - LABEL_ROOM });
    }
    cursorX += maxX - minX + ZONE_GAP;
  }

  if (extents.length === 0) return { width: 0, height: 0, zones: [], seats: [] };
  const bounds = boxOf(extents);
  const shift = (p: Point): Point => ({ x: p.x - bounds.x, y: p.y - bounds.y });
  return {
    width: Math.ceil(bounds.w),
    height: Math.ceil(bounds.h),
    zones: outZones.map((zone) => {
      const polygon = zone.polygon.map(shift);
      return { ...zone, polygon, box: boxOf(polygon) };
    }),
    seats: outSeats.map((seat) => ({
      ...seat,
      box: { ...seat.box, x: seat.box.x - bounds.x, y: seat.box.y - bounds.y },
      head: seat.head ? shift(seat.head) : null,
      depth: seat.depth - bounds.y,
    })),
  };
}

/**
 * 指南针指针在屏幕上的角度（度，从屏幕正上方顺时针）。
 * `northDeg` 是真北相对平面图上方顺时针转过的角度。
 */
export function compassNeedleDeg(northDeg: number, view: ViewAngle) {
  const r = (northDeg * Math.PI) / 180;
  const v = projectPlan({ x: Math.sin(r), y: Math.cos(r) }, view);
  return normDeg((Math.atan2(v.x, -v.y) * 180) / Math.PI);
}

/**
 * 指南针画成「平放在地面上的圆」的投影：一圈椭圆 + 四个方位点，都已经缩放到 [-1, 1] 的盒子里。
 * 方位点按 北、东、南、西 排列。
 */
export function compassGeometry(northDeg: number, view: ViewAngle) {
  const ring: Point[] = [];
  for (let i = 0; i < 48; i += 1) {
    const t = (i / 48) * Math.PI * 2;
    ring.push(projectPlan({ x: Math.cos(t), y: Math.sin(t) }, view));
  }
  const cardinals = [0, 90, 180, 270].map((offset) => {
    const r = ((northDeg + offset) * Math.PI) / 180;
    return projectPlan({ x: Math.sin(r), y: Math.cos(r) }, view);
  });
  const extent = Math.max(...ring.map((p) => Math.max(Math.abs(p.x), Math.abs(p.y))));
  const unit = (p: Point) => ({ x: p.x / extent, y: p.y / extent });
  return { ring: ring.map(unit), cardinals: cardinals.map(unit) as [Point, Point, Point, Point] };
}

/** 能放进可用宽度的场景比例，最大 1。 */
export function fitScale(sceneWidth: number, availableWidth: number) {
  if (!(sceneWidth > 0) || !(availableWidth > 0)) return 1;
  return Math.min(1, availableWidth / sceneWidth);
}

/** `polygon(a% b%, …)` → 盒内比例坐标。 */
export function parseHull(clipPath: string): Point[] {
  return [...clipPath.matchAll(/([\d.]+)%\s+([\d.]+)%/g)].map((m) => ({
    x: Number(m[1]) / 100,
    y: Number(m[2]) / 100,
  }));
}

export function pointInPolygon(p: Point, polygon: readonly Point[]) {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i, i += 1) {
    const a = polygon[i]!;
    const b = polygon[j]!;
    if (a.y > p.y !== b.y > p.y && p.x < ((b.x - a.x) * (p.y - a.y)) / (b.y - a.y) + a.x) inside = !inside;
  }
  return inside;
}

/** 盒子把多边形写成 clip-path（百分比，相对盒子）。 */
export function polygonClipPath(polygon: readonly Point[], box: Box) {
  return `polygon(${polygon
    .map((p) => `${(((p.x - box.x) / box.w) * 100).toFixed(2)}% ${(((p.y - box.y) / box.h) * 100).toFixed(2)}%`)
    .join(", ")})`;
}

/** 一张座位精灵图的 alpha，用来做像素级命中。 */
export interface AlphaMap {
  w: number;
  h: number;
  data: Uint8ClampedArray;
}

const HULLS = Object.fromEntries(SPRITE_KEYS.map((key) => [key, parseHull(spriteFor(key).hull)])) as Record<
  SpriteKey,
  Point[]
>;

/**
 * 场景坐标（缩放 1）上点到了哪个座位。前面的座位先判，像素有墨才算。
 * alpha 还没解码好时退回烘焙的凸包。
 */
export function hitSeat(
  seats: readonly SeatLayout[],
  point: Point,
  alpha: Partial<Record<SpriteKey, AlphaMap | null>>,
): string | null {
  const ordered = [...seats].sort((a, b) => b.depth - a.depth);
  for (const seat of ordered) {
    const { box } = seat;
    const u = (point.x - box.x) / box.w;
    const v = (point.y - box.y) / box.h;
    if (u < 0 || v < 0 || u >= 1 || v >= 1) continue;
    const map = alpha[seat.sprite];
    if (map) {
      const px = Math.min(map.w - 1, Math.floor(u * map.w));
      const py = Math.min(map.h - 1, Math.floor(v * map.h));
      if ((map.data[(py * map.w + px) * 4 + 3] ?? 0) > 96) return seat.seatId;
    } else if (pointInPolygon({ x: u, y: v }, HULLS[seat.sprite])) {
      return seat.seatId;
    }
  }
  return null;
}

export function hitZone(zones: readonly ZoneLayout[], point: Point): string | null {
  for (let i = zones.length - 1; i >= 0; i -= 1) {
    const zone = zones[i]!;
    if (pointInPolygon(point, zone.polygon)) return zone.zoneId;
  }
  return null;
}
