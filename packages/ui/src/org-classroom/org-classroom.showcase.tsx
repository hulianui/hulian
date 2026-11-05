"use client";
import { useCallback, useState } from "react";
import type { ShowcaseSpec } from "../showcase/types";
import { OrgClassroom } from "./org-classroom";
import type { Seat, SeatStatus, Zone } from "./org-classroom.types";
import { updateSeatStatus } from "./seat-status";

function occupied(id: string, name: string, status: SeatStatus, row: number, col: number): Seat {
  return { id, row, col, person: { id, name, status } };
}

function designZone(): Zone {
  return {
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
  };
}

function engineeringZone(): Zone {
  return {
    id: "engineering",
    name: "技术研发部",
    accent: "var(--color-info)",
    seats: [
      occupied("e1", "林予涵", "idle", 1, 1),
      occupied("e2", "陈可", "busy", 1, 2),
      { id: "e3", row: 2, col: 1 },
      occupied("e4", "周宁", "meeting", 2, 2),
    ],
  };
}

function ClassroomPreview({ initial }: { initial: Zone[] }) {
  const [zones, setZones] = useState(initial);
  const [selectedSeatId, setSelectedSeatId] = useState<string | null>(null);
  const [focusedZoneId, setFocusedZoneId] = useState<string | null>(null);
  const onSeatSelect = useCallback((seatId: string) => {
    setSelectedSeatId(seatId);
  }, []);
  const onZoneFocus = useCallback((zoneId: string | null) => {
    setFocusedZoneId(zoneId);
  }, []);
  const onStatusChange = useCallback((seatId: string, status: SeatStatus) => {
    setZones((current) => updateSeatStatus(current, seatId, status));
  }, []);
  return (
    <OrgClassroom
      zones={zones}
      selectedSeatId={selectedSeatId}
      onSeatSelect={onSeatSelect}
      focusedZoneId={focusedZoneId}
      onZoneFocus={onZoneFocus}
      onStatusChange={onStatusChange}
    />
  );
}

const basicZones = () => [designZone()];
const focusZones = () => [designZone(), engineeringZone()];

export const orgClassroomShowcase: ShowcaseSpec = {
  examples: [
    {
      title: "基础用法",
      description: "一个分区里排开工位。点座位打开人员卡，在卡片里改状态。",
      code: `<OrgClassroom
  zones={zones}
  selectedSeatId={selectedSeatId}
  onSeatSelect={setSelectedSeatId}
  onStatusChange={(seatId, status) => setZones(updateSeatStatus(zones, seatId, status))}
/>`,
      render: () => <ClassroomPreview initial={basicZones()} />,
    },
    {
      title: "空位不显示气泡",
      description: "没有人的座位只有桌子，不出现状态气泡。",
      code: `<OrgClassroom zones={[{ id: "design", name: "Design", accent: "var(--color-primary)", seats: [{ id: "empty", row: 1, col: 1 }] }]} />`,
      render: () => (
        <OrgClassroom
          zones={[
            {
              id: "design",
              name: "产品设计部",
              accent: "var(--color-primary)",
              seats: [{ id: "empty", row: 1, col: 1 }],
            },
          ]}
        />
      ),
    },
    {
      title: "聚焦分区",
      description: "点分区空白处让其它分区安静下来，再点一次恢复。",
      code: `<OrgClassroom
  zones={zones}
  focusedZoneId={focusedZoneId}
  onZoneFocus={setFocusedZoneId}
/>`,
      render: () => <ClassroomPreview initial={focusZones()} />,
    },
  ],
  controls: [],
  states: [
    {
      name: "默认",
      render: () => <ClassroomPreview initial={basicZones()} />,
    },
  ],
  renderWithProps: () => <ClassroomPreview initial={basicZones()} />,
  toCode: () => `<OrgClassroom zones={zones} onSeatSelect={setSelectedSeatId} onStatusChange={onStatusChange} />`,
};
