import { useState } from "react";
import { cleanup, fireEvent, render } from "@testing-library/react";
import { userEvent } from "@vitest/browser/context";
import { afterEach, describe, expect, it } from "vitest";
import { COMPACT_BELOW, layoutScene, project, SPRITE_KEYS, spriteFor, VIEW_ANGLES, type Point } from "./iso-layout";
import { OrgClassroom } from "./org-classroom";
import type { Seat, ViewAngle, Zone } from "./org-classroom.types";
import { updateSeatStatus } from "./seat-status";

afterEach(cleanup);

const occupied = (
  id: string,
  name: string,
  status: NonNullable<Seat["person"]>["status"],
  row: number,
  col: number,
): Seat => ({
  id,
  row,
  col,
  person: { id: `p-${id}`, name, status },
});

/** 和 showcase 一样的两个分区：3×4 + 2×2，含空位。 */
function zones(): Zone[] {
  return [
    {
      id: "design",
      name: "产品设计部",
      accent: "var(--color-primary)",
      seats: [
        occupied("d1", "林予涵", "idle", 1, 1),
        occupied("d2", "陈可", "busy", 1, 2),
        occupied("d3", "周宁", "meeting", 1, 3),
        occupied("d4", "赵启明", "leave", 2, 1),
        occupied("d5", "孙晚", "interview", 2, 2),
        occupied("d6", "吴桐", "idle", 2, 3),
        { id: "d7", row: 3, col: 1 },
        occupied("d8", "郑澄", "busy", 3, 2),
        occupied("d9", "何安", "meeting", 3, 3),
        occupied("d10", "许知夏", "leave", 4, 1),
        { id: "d11", row: 4, col: 2 },
        occupied("d12", "沈酌", "interview", 4, 3),
      ],
    },
    {
      id: "engineering",
      name: "技术研发部",
      accent: "var(--color-info)",
      seats: [
        occupied("e1", "林一", "idle", 1, 1),
        occupied("e2", "陈二", "busy", 1, 2),
        { id: "e3", row: 2, col: 1 },
        occupied("e4", "周四", "meeting", 2, 2),
      ],
    },
  ];
}

function overlap(a: DOMRect, b: DOMRect) {
  const width = Math.min(a.right, b.right) - Math.max(a.left, b.left);
  const height = Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top);
  return width > 0 && height > 0 ? width * height : 0;
}

function Harness({ width, initial = zones(), view }: { width: number; initial?: Zone[]; view?: ViewAngle }) {
  const [list, setList] = useState(initial);
  return (
    <div data-testid="frame" style={{ width }}>
      <OrgClassroom
        zones={list}
        view={view}
        onStatusChange={(id, status) => setList((current) => updateSeatStatus(current, id, status))}
      />
    </div>
  );
}

async function mount(width: number, initial?: Zone[], view: ViewAngle = 0) {
  const started = performance.now();
  const utils = render(<Harness width={width} initial={initial} view={view} />);
  // 同步渲染（React commit + 布局）耗时；不含后面等 alpha 解码
  const renderMs = performance.now() - started;
  const scene = utils.container.querySelector<HTMLElement>("[data-slot=org-classroom-scene]")!;
  await expect.poll(() => scene.getAttribute("data-hit-ready"), { timeout: 5000 }).toBe("true");
  const layout = layoutScene(initial ?? zones(), view);
  /** 场景坐标（缩放 1）→ 视口坐标。 */
  const toClient = (p: Point) => {
    const rect = scene.getBoundingClientRect();
    const scale = rect.width / layout.width;
    return { clientX: rect.left + p.x * scale, clientY: rect.top + p.y * scale };
  };
  return { ...utils, scene, layout, toClient, renderMs };
}

function seatOrigin(layout: ReturnType<typeof layoutScene>, id: string) {
  const seat = layout.seats.find((item) => item.seatId === id)!;
  const sprite = spriteFor(seat.sprite);
  return { seat, origin: { x: seat.box.x + sprite.anchor[0], y: seat.box.y + sprite.anchor[1] } };
}

const pressedSeat = () =>
  document
    .querySelector('[data-seat-id] [aria-pressed="true"]')
    ?.closest("[data-seat-id]")
    ?.getAttribute("data-seat-id") ?? null;

describe("OrgClassroom sprite scene", () => {
  for (const width of [360, 390, 1280]) {
    it(`${width}px：不横向溢出，场景按宽度缩放，人名气泡在框内且互不压住`, async () => {
      const { container } = await mount(width);
      const frame = container.querySelector<HTMLElement>("[data-testid=frame]")!;
      const floor = container.querySelector<HTMLElement>("[data-slot=org-classroom-floor]")!;
      expect(frame.scrollWidth).toBeLessThanOrEqual(frame.clientWidth + 1);
      expect(floor.getBoundingClientRect().width).toBeLessThanOrEqual(width + 1);

      const scale = Number(floor.getAttribute("data-scene-scale"));
      const compact = floor.getAttribute("data-compact") === "true";
      // 1280 宽时人员卡在侧边，场景只剩约 940px：略缩，但人名气泡保持完整
      if (width === 1280) {
        expect(scale).toBeGreaterThan(COMPACT_BELOW);
        expect(compact).toBe(false);
      } else {
        expect(scale).toBeLessThan(COMPACT_BELOW);
        expect(compact).toBe(true);
      }

      const frameRect = frame.getBoundingClientRect();
      const visible = [...container.querySelectorAll<HTMLElement>("[data-seat-label]")].map((label) =>
        (compact ? label.querySelector("[data-status-dot]")! : label.firstElementChild!).getBoundingClientRect(),
      );
      expect(visible).toHaveLength(13);
      for (const rect of visible) {
        expect(rect.width).toBeGreaterThan(0);
        expect(rect.left).toBeGreaterThanOrEqual(frameRect.left - 1);
        expect(rect.right).toBeLessThanOrEqual(frameRect.right + 1);
      }
      for (let i = 0; i < visible.length; i += 1)
        for (let j = i + 1; j < visible.length; j += 1) expect(overlap(visible[i]!, visible[j]!)).toBe(0);
    });
  }

  it("放在按内容收缩的 flex 预览框里（文档站就是这样）也占满宽度、场景缩进框内", async () => {
    const { container } = render(
      <div data-testid="preview" className="flex flex-wrap items-center gap-4 p-8" style={{ width: 1000 }}>
        <OrgClassroom zones={zones()} />
      </div>,
    );
    const preview = container.querySelector<HTMLElement>("[data-testid=preview]")!;
    const root = container.querySelector<HTMLElement>("[data-slot=org-classroom]")!;
    const scene = container.querySelector<HTMLElement>("[data-slot=org-classroom-scene]")!;
    const card = container.querySelector<HTMLElement>("[data-slot=org-classroom-person]")!;
    await expect.poll(() => root.getBoundingClientRect().width).toBeGreaterThan(900);
    expect(card.getBoundingClientRect().width).toBeGreaterThan(240);
    const frame = preview.getBoundingClientRect();
    const sceneRect = scene.getBoundingClientRect();
    expect(sceneRect.left).toBeGreaterThanOrEqual(frame.left);
    expect(sceneRect.right).toBeLessThanOrEqual(frame.right);
  });

  it("鼠标悬停那一刻光晕就是主色，不会先闪黑", async () => {
    const { scene, layout, toClient } = await mount(1280);
    const { seat } = seatOrigin(layout, "d5");
    const sprite = document.querySelector<HTMLElement>('[data-seat-id="d5"] [data-seat-sprite]')!;
    const probe = document.createElement("div");
    probe.style.color = "var(--color-primary)";
    document.body.append(probe);
    const primary = getComputedStyle(probe).color;
    probe.remove();
    fireEvent.pointerMove(scene, { pointerType: "mouse", ...toClient({ x: seat.head!.x, y: seat.head!.y + 10 }) });
    await expect.poll(() => sprite.closest("[data-seat-id]")!.getAttribute("data-hover")).toBe("true");
    const filter = getComputedStyle(sprite).filter;
    expect(getComputedStyle(sprite).transitionProperty).not.toContain("filter");
    expect(filter).toContain(primary);
    expect(filter).not.toContain("rgb(0, 0, 0)");
  });

  for (const view of VIEW_ANGLES) {
    it(`视角 ${view}°、两个分区朝向不同：点头部选中这个人，点桌面选中桌主，人名不互相压住`, async () => {
      const mixed = zones();
      mixed[1] = { ...mixed[1]!, facing: "right" };
      const { container, scene, layout, toClient } = await mount(1280, mixed, view);
      for (const id of ["d1", "d5", "d12", "e1", "e4"]) {
        const seat = layout.seats.find((item) => item.seatId === id)!;
        fireEvent.click(scene, toClient({ x: seat.head!.x, y: seat.head!.y + 10 }));
        await expect.poll(pressedSeat).toBe(id);
      }
      const labels = [...container.querySelectorAll<HTMLElement>("[data-seat-label]")].map((label) =>
        (container.querySelector("[data-compact=true]")
          ? label.querySelector("[data-status-dot]")!
          : label.firstElementChild!
        ).getBoundingClientRect(),
      );
      for (let i = 0; i < labels.length; i += 1)
        for (let j = i + 1; j < labels.length; j += 1) expect(overlap(labels[i]!, labels[j]!)).toBe(0);
    });
  }

  it("点头部选中这个人；同排紧挨的邻座互不抢点击", async () => {
    const { scene, layout, toClient } = await mount(1280);
    for (const id of ["d1", "d2", "d3", "d5", "e2"]) {
      const { seat } = seatOrigin(layout, id);
      fireEvent.click(scene, toClient({ x: seat.head!.x, y: seat.head!.y + 10 }));
      await expect.poll(pressedSeat).toBe(id);
    }
  });

  it("点桌面中间选中桌子的主人，不选到前后左右的座位", async () => {
    const { scene, layout, toClient } = await mount(1280);
    const desk = project(0, -0.46, 0.75);
    for (const id of ["d5", "d7", "d11", "e3"]) {
      const { origin } = seatOrigin(layout, id);
      fireEvent.click(scene, toClient({ x: origin.x + desk.x, y: origin.y + desk.y }));
      await expect.poll(pressedSeat).toBe(id);
    }
  });

  it("精灵图透明处点到的是分区地板：聚焦分区、不改选中，再点一次取消", async () => {
    const { container, scene, layout, toClient } = await mount(1280);
    const zone = layout.zones.find((item) => item.zoneId === "design")!;
    const near = zone.polygon.reduce((a, b) => (b.y > a.y ? b : a));
    const centre = zone.polygon.reduce((acc, p) => ({ x: acc.x + p.x / 4, y: acc.y + p.y / 4 }), {
      x: 0,
      y: 0,
    });
    const floorPoint = {
      x: near.x + (centre.x - near.x) * 0.06,
      y: near.y + (centre.y - near.y) * 0.06,
    };
    const covering = layout.seats.filter(
      ({ box }) =>
        floorPoint.x >= box.x &&
        floorPoint.x <= box.x + box.w &&
        floorPoint.y >= box.y &&
        floorPoint.y <= box.y + box.h,
    );
    expect(covering.length).toBeGreaterThan(0); // 点在某个座位的图片盒子里，只是那里没有像素

    const zoneEl = container.querySelector<HTMLElement>("[data-zone-id=design]")!;
    fireEvent.click(scene, toClient(floorPoint));
    await expect.poll(() => zoneEl.getAttribute("data-focused")).toBe("true");
    expect(pressedSeat()).toBeNull();
    expect(container.querySelector<HTMLElement>("[data-zone-id=engineering]")!.getAttribute("data-quiet")).toBe("true");
    fireEvent.click(scene, toClient(floorPoint));
    await expect.poll(() => zoneEl.getAttribute("data-focused")).toBe("false");
  });

  it("键盘 Tab 按排、列顺序走到座位，聚焦时精灵图有光晕，Enter 打开人员卡", async () => {
    const { container } = await mount(1280);
    const seatButtons = [...container.querySelectorAll<HTMLButtonElement>("[data-seat-hit]")];
    expect(seatButtons.slice(0, 3).map((b) => b.getAttribute("aria-label"))).toEqual([
      "林予涵，在岗",
      "陈可，忙碌",
      "周宁，会议中",
    ]);
    seatButtons[0]!.focus();
    await userEvent.tab();
    expect(document.activeElement).toBe(seatButtons[1]);
    const sprite = seatButtons[1]!.closest("[data-seat-id]")!.querySelector<HTMLElement>("[data-seat-sprite]")!;
    await expect.poll(() => getComputedStyle(sprite).filter).toContain("drop-shadow");
    await userEvent.keyboard("{Enter}");
    await expect.poll(pressedSeat).toBe("d2");
    expect(container.querySelector("[data-slot=org-classroom-person]")!.getAttribute("data-open")).toBe("true");
  });

  it("围巾跟分区色，人和桌子跟主题色：深色主题下人变浅、桌面变深", async () => {
    const { container } = await mount(1280);
    const color = (seatId: string, group: string) =>
      getComputedStyle(
        container.querySelector<HTMLElement>(`[data-seat-id="${seatId}"] [data-sprite-layer="${group}"]`)!,
      ).backgroundColor;
    expect(color("d1", "scarf")).not.toBe(color("e1", "scarf"));
    const lum = (css: string) => {
      const probe = document.createElement("div");
      probe.style.color = css;
      document.body.append(probe);
      const canvas = document.createElement("canvas").getContext("2d")!;
      canvas.fillStyle = getComputedStyle(probe).color;
      canvas.fillRect(0, 0, 1, 1);
      const [r, g, b] = canvas.getImageData(0, 0, 1, 1).data;
      probe.remove();
      return (r! + g! + b!) / 3;
    };
    const lightBody = lum(color("d1", "body"));
    const lightDesk = lum(color("d1", "desk"));
    expect(lightBody).toBeLessThan(lightDesk);
    const previous = document.documentElement.getAttribute("data-theme");
    document.documentElement.setAttribute("data-theme", "dark");
    try {
      expect(lum(color("d1", "body"))).toBeGreaterThan(lum(color("d1", "desk")));
    } finally {
      if (previous == null) document.documentElement.removeAttribute("data-theme");
      else document.documentElement.setAttribute("data-theme", previous);
    }
  });

  it("多实例：240 个座位首屏渲染和命中都很快，DOM 不随 base64 膨胀", async () => {
    const many: Zone[] = Array.from({ length: 10 }, (_, z) => ({
      id: `z${z}`,
      name: `分区${z}`,
      accent: z % 2 ? "var(--color-info)" : "var(--color-primary)",
      seats: Array.from({ length: 24 }, (_, i) =>
        i % 5 === 4
          ? { id: `z${z}-${i}`, row: Math.floor(i / 4) + 1, col: (i % 4) + 1 }
          : occupied(`z${z}-${i}`, `人${i}`, "idle", Math.floor(i / 4) + 1, (i % 4) + 1),
      ),
    }));
    const started = performance.now();
    const { container, scene, layout, toClient, renderMs } = await mount(1280, many);
    const ready = performance.now() - started;
    console.info(`[org-classroom perf] 240 seats render ${renderMs.toFixed(0)}ms, hit-ready ${ready.toFixed(0)}ms`);
    expect(container.querySelectorAll("[data-seat-id]")).toHaveLength(240);
    // 绝对毫秒数在 CI 上抖得厉害（同一用例比本机慢一个数量级），这里只做确定性的结构约束 + 宽松冒烟；
    // 真正的性能基线在 Runtime Performance 任务里。alpha 解码是异步的，期间命中退回凸包，不阻塞交互。
    const perSeat = container.querySelectorAll("[data-slot=org-classroom-scene] *").length / 240;
    expect(perSeat).toBeLessThan(30);
    expect(renderMs).toBeLessThan(5000);
    // 每张图只在场景根的 CSS 变量里出现一次，240 个座位都用 var() 引用
    const images = SPRITE_KEYS.reduce((sum, key) => sum + spriteFor(key).layers.length + 2, 0);
    expect(container.innerHTML.split("data:image/webp").length - 1).toBe(images);

    const target = layout.seats.find((seat) => seat.seatId === "z9-10")!;
    const t0 = performance.now();
    for (let i = 0; i < 50; i += 1) fireEvent.click(scene, toClient({ x: target.head!.x, y: target.head!.y + 10 }));
    const perClick = (performance.now() - t0) / 50;
    await expect.poll(pressedSeat).toBe("z9-10");
    expect(perClick).toBeLessThan(16);
  });
});
