import { describe, expect, it } from "vitest";
import {
  COMPACT_BELOW,
  compassNeedleDeg,
  fitScale,
  hitSeat,
  hitZone,
  layoutScene,
  parseHull,
  pointInPolygon,
  project,
  SPRITE_KEYS,
  spriteFor,
  VIEW_ANGLES,
} from "./iso-layout";
import { ORG_CLASSROOM_GRID } from "./org-classroom-sprites";
import type { Zone } from "./org-classroom.types";

const person = (id: string) => ({ id, name: id, status: "idle" as const });

function zones(): Zone[] {
  return [
    {
      id: "a",
      name: "A",
      accent: "red",
      seats: [
        { id: "a11", row: 1, col: 1, person: person("p1") },
        { id: "a12", row: 1, col: 2, person: person("p2") },
        { id: "a21", row: 2, col: 1 },
      ],
    },
    {
      id: "b",
      name: "B",
      accent: "blue",
      seats: [{ id: "b11", row: 1, col: 1, person: person("p3") }],
    },
  ];
}

describe("iso-layout", () => {
  it("投影是线性的：原点在原点，同一列间距处处相等", () => {
    expect(project(0, 0)).toEqual({ x: 0, y: 0 });
    const a = project(ORG_CLASSROOM_GRID.colPitch, 0);
    const b = project(2 * ORG_CLASSROOM_GRID.colPitch, 0);
    expect(b.x - a.x).toBeCloseTo(a.x, 6);
    expect(b.y - a.y).toBeCloseTo(a.y, 6);
  });

  it("场景从 (0,0) 开始，所有座位和地板都在场景里", () => {
    const scene = layoutScene(zones());
    expect(scene.seats).toHaveLength(4);
    for (const seat of scene.seats) {
      expect(seat.box.x).toBeGreaterThanOrEqual(-0.5);
      expect(seat.box.y).toBeGreaterThanOrEqual(-0.5);
      expect(seat.box.x + seat.box.w).toBeLessThanOrEqual(scene.width + 0.5);
      expect(seat.box.y + seat.box.h).toBeLessThanOrEqual(scene.height + 0.5);
    }
    for (const zone of scene.zones)
      for (const p of zone.polygon) {
        expect(p.x).toBeGreaterThanOrEqual(-0.5);
        expect(p.y).toBeLessThanOrEqual(scene.height + 0.5);
      }
  });

  it("有人座位用 occupied 图并带头顶点，空位没有头", () => {
    const scene = layoutScene(zones());
    const occupied = scene.seats.find((seat) => seat.seatId === "a11")!;
    const empty = scene.seats.find((seat) => seat.seatId === "a21")!;
    expect(occupied.sprite).toBe("0-occupied");
    expect(occupied.head).not.toBeNull();
    expect(empty.sprite).toBe("0-empty");
    expect(empty.head).toBeNull();
  });

  it("后一排在屏幕上更靠下，先画前排会被后排挡住的顺序由 depth 决定", () => {
    const scene = layoutScene(zones());
    const back = scene.seats.find((seat) => seat.seatId === "a11")!;
    const front = scene.seats.find((seat) => seat.seatId === "a21")!;
    expect(front.depth).toBeGreaterThan(back.depth);
  });

  it("两个分区的地板不相交", () => {
    const [a, b] = layoutScene(zones()).zones;
    for (const p of b!.polygon) expect(pointInPolygon(p, a!.polygon)).toBe(false);
    for (const p of a!.polygon) expect(pointInPolygon(p, b!.polygon)).toBe(false);
  });

  it("点到头顶命中这个座位；点到精灵图的透明角落落到分区地板", () => {
    const scene = layoutScene(zones());
    const seat = scene.seats.find((item) => item.seatId === "a12")!;
    const below = { x: seat.head!.x, y: seat.head!.y + 12 };
    expect(hitSeat(scene.seats, below, {})).toBe("a12");
    const zone = scene.zones.find((item) => item.zoneId === "a")!;
    const floor = {
      x: (zone.polygon[0]!.x + zone.polygon[1]!.x + zone.polygon[2]!.x + zone.polygon[3]!.x) / 4,
      y: (zone.polygon[0]!.y + zone.polygon[1]!.y + zone.polygon[2]!.y + zone.polygon[3]!.y) / 4,
    };
    const hit = hitSeat(scene.seats, floor, {});
    expect(hit === null ? hitZone(scene.zones, floor) : hit).toBeTruthy();
    const corner = { x: 1, y: scene.height - 1 };
    expect(hitSeat(scene.seats, corner, {})).toBeNull();
  });

  it("有 alpha 时按像素判断，透明像素不算命中", () => {
    const scene = layoutScene(zones());
    const seat = scene.seats.find((item) => item.seatId === "b11")!;
    const solid = {
      w: 2,
      h: 2,
      data: new Uint8ClampedArray([0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255]),
    };
    const clear = { w: 2, h: 2, data: new Uint8ClampedArray(16) };
    const centre = { x: seat.box.x + seat.box.w / 2, y: seat.box.y + seat.box.h / 2 };
    expect(hitSeat([seat], centre, { "0-occupied": solid })).toBe("b11");
    expect(hitSeat([seat], centre, { "0-occupied": clear })).toBeNull();
  });

  it("烘焙的凸包能解析，点都在 0–1 之间", () => {
    for (const key of SPRITE_KEYS) {
      const hull = parseHull(spriteFor(key).hull);
      expect(hull.length).toBeGreaterThanOrEqual(4);
      for (const p of hull) {
        expect(p.x).toBeGreaterThanOrEqual(0);
        expect(p.x).toBeLessThanOrEqual(1);
      }
    }
  });

  it("分区朝向决定用哪个角度的座位图：相对角 = 朝向 − 视角", () => {
    const facing = (f: Zone["facing"]) => [{ ...zones()[0]!, facing: f }];
    expect(layoutScene(facing("right")).seats[0]!.sprite).toBe("90-occupied");
    expect(layoutScene(facing("up")).seats[0]!.sprite).toBe("180-occupied");
    expect(layoutScene(facing("left")).seats[0]!.sprite).toBe("270-occupied");
    expect(layoutScene(facing("down"), 90).seats[0]!.sprite).toBe("270-occupied");
    expect(layoutScene(facing("right"), 90).seats[0]!.sprite).toBe("0-occupied");
    expect(layoutScene(facing("down"), 270).seats[2]!.sprite).toBe("90-empty");
  });

  it("任意视角、朝向混排时，分区地板互不相交，座位都在场景里", () => {
    const mixed: Zone[] = [
      { ...zones()[0]!, facing: "right" },
      { ...zones()[1]!, facing: "up" },
      { id: "c", name: "C", accent: "green", facing: "left", seats: [{ id: "c11", row: 2, col: 3 }] },
    ];
    for (const view of VIEW_ANGLES) {
      const scene = layoutScene(mixed, view);
      for (let i = 0; i < scene.zones.length; i += 1)
        for (let j = i + 1; j < scene.zones.length; j += 1)
          for (const p of scene.zones[j]!.polygon) expect(pointInPolygon(p, scene.zones[i]!.polygon)).toBe(false);
      for (const seat of scene.seats) {
        expect(seat.box.x).toBeGreaterThanOrEqual(-0.5);
        expect(seat.box.x + seat.box.w).toBeLessThanOrEqual(scene.width + 0.5);
      }
    }
  });

  it("指南针：视角加 90 等于真北顺时针多转 90（楼层在屏幕上顺时针转）", () => {
    for (const north of [0, 30, 90, 200])
      for (const view of VIEW_ANGLES)
        expect(compassNeedleDeg(north, view)).toBeCloseTo(compassNeedleDeg((north + view) % 360, 0), 6);
    // 默认：平面图上方是北，在等距画面里指向右上
    const needle = compassNeedleDeg(0, 0);
    expect(needle).toBeGreaterThan(0);
    expect(needle).toBeLessThan(90);
  });

  it("缩放只缩不放，量不到宽度时保持 1", () => {
    expect(fitScale(800, 400)).toBe(0.5);
    expect(fitScale(300, 400)).toBe(1);
    expect(fitScale(800, 0)).toBe(1);
    expect(COMPACT_BELOW).toBeLessThan(1);
  });
});
