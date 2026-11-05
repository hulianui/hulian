import { useState } from "react";
import { fireEvent, render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ConfigProvider } from "../config/config-provider";
import { enUS } from "../config/locale";
import { ORG_CLASSROOM_COPY_ZH } from "./copy";
import { OrgClassroom } from "./org-classroom";
import type { SeatStatus, Zone } from "./org-classroom.types";
import { updateSeatStatus } from "./seat-status";

function zone(partial?: Partial<Zone>): Zone {
  return {
    id: "design",
    name: "产品设计部",
    accent: "var(--color-primary)",
    seats: [
      { id: "s1", row: 1, col: 1, person: { id: "p1", name: "林予涵", status: "idle" } },
      { id: "s2", row: 1, col: 2, person: { id: "p2", name: "陈可", status: "busy" } },
      { id: "s3", row: 1, col: 3 },
    ],
    ...partial,
  };
}

describe("OrgClassroom", () => {
  it("默认状态文案是锁定的中文短句", () => {
    expect(ORG_CLASSROOM_COPY_ZH.statuses).toEqual({
      idle: "在岗",
      busy: "忙碌",
      meeting: "会议中",
      leave: "休假",
      interview: "面试中",
    });
  });

  it("有人的座位显示当前状态，空座位没有气泡", () => {
    const { container } = render(<OrgClassroom zones={[zone()]} />);
    const occupied = container.querySelector('[data-seat-label="s1"] [data-slot="status-chip"]')!;
    const visible = occupied.querySelector('[data-visible="true"]')!;
    expect(visible.textContent).toBe("在岗");
    expect(occupied.querySelector('[data-visible="false"]')?.textContent).toBe("忙碌");
    expect(container.querySelector('[data-seat-label="s3"]')).toBeNull();
    expect(container.querySelector('[data-seat-id="s3"]')!.textContent).not.toContain("在岗");
  });

  it("悬停只抬桌子和人，状态气泡不在抬起层里，并且带透明度过渡", () => {
    const { container } = render(<OrgClassroom zones={[zone()]} />);
    const lift = container.querySelector('[data-seat-id="s1"] [data-seat-lift]')!;
    const chip = container.querySelector('[data-seat-label="s1"] [data-slot="status-chip"]')!;
    expect(lift.className).toContain("translateZ(18px)");
    expect(lift.className).toContain("motion-reduce:transition-none");
    expect(lift.contains(chip)).toBe(false);
    expect(chip.innerHTML).toContain("transition-opacity");
    expect(chip.innerHTML).toContain("duration-200");
  });

  it("点座位选中并打开人员卡，点座位不会聚焦分区", () => {
    const onSeatSelect = vi.fn();
    const onZoneFocus = vi.fn();
    const { getByRole } = render(
      <OrgClassroom zones={[zone()]} onSeatSelect={onSeatSelect} onZoneFocus={onZoneFocus} />,
    );
    fireEvent.click(getByRole("button", { name: "林予涵，在岗" }));
    expect(onSeatSelect).toHaveBeenCalledWith("s1");
    expect(onZoneFocus).not.toHaveBeenCalled();
    expect(getByRole("button", { name: "林予涵，在岗" }).getAttribute("aria-pressed")).toBe("true");
    const card = getByRole("complementary", { name: "人员" });
    expect(card.textContent).toContain("林予涵");
    expect(card.textContent).toContain("部门");
    expect(card.textContent).toContain("产品设计部");
    expect(card.textContent).toContain("状态");
  });

  it("人员卡里改状态会回调，气泡留在原节点上交叉切换", () => {
    const onStatusChange = vi.fn();
    function Harness() {
      const [zones, setZones] = useState([zone()]);
      return (
        <OrgClassroom
          zones={zones}
          onStatusChange={(seatId, status) => {
            onStatusChange(seatId, status);
            setZones((current) => updateSeatStatus(current, seatId, status));
          }}
        />
      );
    }
    const { container, getByRole } = render(<Harness />);
    fireEvent.click(getByRole("button", { name: "林予涵，在岗" }));
    const before = container.querySelector('[data-seat-label="s1"] [data-slot="status-chip"]');
    fireEvent.click(container.querySelector('[data-status-option="meeting"]')!);
    const after = container.querySelector('[data-seat-label="s1"] [data-slot="status-chip"]');
    expect(onStatusChange).toHaveBeenCalledWith("s1", "meeting");
    expect(after).toBe(before);
    expect(after!.querySelector('[data-visible="true"]')!.textContent).toBe("会议中");
  });

  it("点分区空白聚焦，其它分区变安静，再点一次清空", () => {
    const onZoneFocus = vi.fn();
    const zones = [
      zone(),
      zone({
        id: "engineering",
        name: "技术研发部",
        seats: [{ id: "e1", row: 1, col: 1, person: { id: "q1", name: "周宁", status: "leave" } }],
      }),
    ];
    const { container } = render(<OrgClassroom zones={zones} onZoneFocus={onZoneFocus} />);
    const design = container.querySelector('[data-zone-id="design"]')!;
    const engineering = container.querySelector('[data-zone-id="engineering"]')!;
    fireEvent.click(design.querySelector("[data-zone-floor]")!);
    expect(onZoneFocus).toHaveBeenNthCalledWith(1, "design");
    expect(design.getAttribute("data-focused")).toBe("true");
    expect(engineering.getAttribute("data-quiet")).toBe("true");
    fireEvent.click(design.querySelector("[data-zone-floor]")!);
    expect(onZoneFocus).toHaveBeenNthCalledWith(2, null);
    expect(design.getAttribute("data-focused")).toBe("false");
    expect(engineering.getAttribute("data-quiet")).toBe("false");
  });

  it("受控选中空位时人员卡没有改状态按钮", () => {
    const { container, getByRole } = render(<OrgClassroom zones={[zone()]} selectedSeatId="s3" />);
    expect(getByRole("button", { name: "空位 1-3" }).getAttribute("aria-pressed")).toBe("true");
    expect(getByRole("complementary", { name: "人员" }).textContent).toContain("这个座位还没有人");
    expect(container.querySelector("[data-status-option]")).toBeNull();
  });

  it("enUS 下气泡和人员卡走英文，不渲染中文默认文案", () => {
    const { container, getByRole } = render(
      <ConfigProvider locale={enUS}>
        <OrgClassroom zones={[zone()]} selectedSeatId="s1" />
      </ConfigProvider>,
    );
    expect(container.querySelector('[data-visible="true"]')!.textContent).toBe("On duty");
    expect(container.textContent).not.toContain("在岗");
    expect(getByRole("complementary", { name: "Person" }).textContent).toContain("Department");
    expect(getByRole("group", { name: "Change status" })).toBeTruthy();
  });

  it("关闭按钮和 Esc 清空选中并把焦点还给座位；再点座位和点空白都不关闭", () => {
    const onSeatSelect = vi.fn();
    const onZoneFocus = vi.fn();
    const { getByRole, container } = render(
      <OrgClassroom zones={[zone()]} onSeatSelect={onSeatSelect} onZoneFocus={onZoneFocus} />,
    );
    const seat = getByRole("button", { name: "林予涵，在岗" });
    fireEvent.click(seat);
    const card = getByRole("complementary", { name: "人员" });
    expect(card.getAttribute("data-open")).toBe("true");
    expect(card.textContent).toContain("林予涵");

    fireEvent.click(seat);
    expect(onSeatSelect).toHaveBeenLastCalledWith("s1");
    expect(card.getAttribute("data-open")).toBe("true");

    fireEvent.click(container.querySelector("[data-zone-floor]")!);
    expect(onZoneFocus).toHaveBeenCalledWith("design");
    expect(card.getAttribute("data-open")).toBe("true");
    expect(card.textContent).toContain("林予涵");

    fireEvent.click(getByRole("button", { name: "关闭人员卡" }));
    expect(onSeatSelect).toHaveBeenLastCalledWith(null);
    expect(card.getAttribute("data-open")).toBe("false");
    expect(card.textContent).toContain("点选一个座位查看人员");
    expect(document.activeElement).toBe(seat);
    expect(seat.getAttribute("aria-pressed")).toBe("false");

    fireEvent.click(seat);
    fireEvent.keyDown(container.querySelector("[data-slot=org-classroom]")!, { key: "Escape" });
    expect(onSeatSelect).toHaveBeenLastCalledWith(null);
    expect(card.getAttribute("data-open")).toBe("false");
    expect(document.activeElement).toBe(seat);
  });

  it("受控选中只有父级写回 null 才关闭，忽略 null 时卡片保持打开", () => {
    const onSeatSelect = vi.fn();
    function Harness({ honor }: { honor: boolean }) {
      const [selectedSeatId, setSelectedSeatId] = useState<string | null>(null);
      return (
        <OrgClassroom
          zones={[zone()]}
          selectedSeatId={selectedSeatId}
          onSeatSelect={(seatId) => {
            onSeatSelect(seatId);
            if (honor || seatId != null) setSelectedSeatId(seatId);
          }}
        />
      );
    }
    const ignored = render(<Harness honor={false} />);
    fireEvent.click(ignored.getByRole("button", { name: "林予涵，在岗" }));
    fireEvent.click(ignored.getByRole("button", { name: "关闭人员卡" }));
    expect(onSeatSelect).toHaveBeenLastCalledWith(null);
    expect(ignored.getByRole("complementary", { name: "人员" }).getAttribute("data-open")).toBe("true");
    expect(document.activeElement).not.toBe(ignored.getByRole("button", { name: "林予涵，在岗" }));
    ignored.unmount();

    onSeatSelect.mockClear();
    const honored = render(<Harness honor />);
    const seat = honored.getByRole("button", { name: "林予涵，在岗" });
    fireEvent.click(seat);
    fireEvent.keyDown(honored.container.querySelector("[data-slot=org-classroom]")!, { key: "Escape" });
    expect(onSeatSelect).toHaveBeenLastCalledWith(null);
    expect(honored.getByRole("complementary", { name: "人员" }).getAttribute("data-open")).toBe("false");
    expect(document.activeElement).toBe(seat);
  });

  it("等距平面用 CSS 旋转，不用 WebGL", () => {
    const { container } = render(<OrgClassroom zones={[zone()]} />);
    const plane = container.querySelector("[data-slot=org-classroom-plane]")!;
    expect(plane.getAttribute("data-iso")).toBe("rotateX(58deg) rotateZ(-42deg)");
    expect(plane.getAttribute("style")).toContain("rotateX(58deg)");
    expect(plane.getAttribute("style")).toContain("rotateZ(-42deg)");
    expect(container.querySelector("canvas")).toBeNull();
  });
});

describe("updateSeatStatus", () => {
  it("只替换命中的人，其它座位和分区保持原引用", () => {
    const design = zone();
    const other = zone({ id: "engineering", seats: [{ id: "e1", row: 1, col: 1 }] });
    const next = updateSeatStatus([design, other], "s1", "interview" satisfies SeatStatus);
    expect(next[1]).toBe(other);
    expect(next[0]).not.toBe(design);
    expect(next[0]!.seats[1]).toBe(design.seats[1]);
    expect(next[0]!.seats[2]).toBe(design.seats[2]);
    expect(next[0]!.seats[0]!.person!.status).toBe("interview");
    expect(updateSeatStatus([design], "s3", "busy")[0]).toBe(design);
    expect(updateSeatStatus([design], "missing", "busy")[0]).toBe(design);
  });
});
