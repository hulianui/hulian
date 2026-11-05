"use client";
import { useCallback, useState } from "react";
import type { ShowcaseSpec } from "../../../../packages/ui/src/showcase/types";
import { OrgClassroom } from "../../../../packages/ui/src/org-classroom/org-classroom";
import type { Seat, SeatStatus, Zone } from "../../../../packages/ui/src/org-classroom/org-classroom.types";
import { updateSeatStatus } from "../../../../packages/ui/src/org-classroom/seat-status";
function occupied(id: string, name: string, status: SeatStatus, row: number, col: number): Seat {
    return { id, row, col, person: { id, name, status } };
}
function designZone(): Zone {
    return {
        id: "design",
        name: "Product Design",
        accent: "var(--color-primary)",
        seats: [
            occupied("d1", "Lin Yuhan", "idle", 1, 1),
            occupied("d2", "Chen Ke", "busy", 1, 2),
            occupied("d3", "Zhou Ning", "meeting", 1, 3),
            occupied("d4", "Zhao Qiming", "leave", 2, 1),
            occupied("d5", "Sun Wan", "interview", 2, 2),
            occupied("d6", "Wu Tong", "idle", 2, 3),
            { id: "d7", row: 3, col: 1 },
            occupied("d8", "Zheng Cheng", "busy", 3, 2),
            occupied("d9", "He An", "meeting", 3, 3),
            occupied("d10", "Xu Zhixia", "leave", 4, 1),
            { id: "d11", row: 4, col: 2 },
            occupied("d12", "Shen Zhuo", "interview", 4, 3),
        ],
    };
}
function engineeringZone(): Zone {
    return {
        id: "engineering",
        name: "Engineering",
        accent: "var(--color-info)",
        seats: [
            occupied("e1", "Lin Yuhan", "idle", 1, 1),
            occupied("e2", "Chen Ke", "busy", 1, 2),
            { id: "e3", row: 2, col: 1 },
            occupied("e4", "Zhou Ning", "meeting", 2, 2),
        ],
    };
}
function ClassroomPreview({ initial }: {
    initial: Zone[];
}) {
    const [zones, setZones] = useState(initial);
    const [selectedSeatId, setSelectedSeatId] = useState<string | null>(null);
    const [focusedZoneId, setFocusedZoneId] = useState<string | null>(null);
    const onSeatSelect = useCallback((seatId: string | null) => {
        setSelectedSeatId(seatId);
    }, []);
    const onZoneFocus = useCallback((zoneId: string | null) => {
        setFocusedZoneId(zoneId);
    }, []);
    const onStatusChange = useCallback((seatId: string, status: SeatStatus) => {
        setZones((current) => updateSeatStatus(current, seatId, status));
    }, []);
    return (<OrgClassroom zones={zones} selectedSeatId={selectedSeatId} onSeatSelect={onSeatSelect} focusedZoneId={focusedZoneId} onZoneFocus={onZoneFocus} onStatusChange={onStatusChange}/>);
}
const basicZones = () => [designZone()];
const focusZones = () => [designZone(), engineeringZone()];
export const orgClassroomShowcase: ShowcaseSpec = {
    examples: [
        {
            title: "Basic usage",
            description: "Arrange seats in one zone. Select a seat to open the person card and change status there.",
            code: `<OrgClassroom
  zones={zones}
  selectedSeatId={selectedSeatId}
  onSeatSelect={setSelectedSeatId}
  onStatusChange={(seatId, status) => setZones(updateSeatStatus(zones, seatId, status))}
/>`,
            render: () => <ClassroomPreview initial={basicZones()}/>,
        },
        {
            title: "Empty seats have no bubble",
            description: "An empty seat is only a desk, with no status bubble.",
            code: `<OrgClassroom zones={[{ id: "design", name: "Design", accent: "var(--color-primary)", seats: [{ id: "empty", row: 1, col: 1 }] }]} />`,
            render: () => (<OrgClassroom zones={[
                    {
                        id: "design",
                        name: "Product Design",
                        accent: "var(--color-primary)",
                        seats: [{ id: "empty", row: 1, col: 1 }],
                    },
                ]}/>),
        },
        {
            title: "Focus a zone",
            description: "Click empty floor space to quiet the other zones, then click again to restore them.",
            code: `<OrgClassroom
  zones={zones}
  focusedZoneId={focusedZoneId}
  onZoneFocus={setFocusedZoneId}
/>`,
            render: () => <ClassroomPreview initial={focusZones()}/>,
        },
    ],
    controls: [],
    states: [
        {
            name: "Default",
            render: () => <ClassroomPreview initial={basicZones()}/>,
        },
    ],
    renderWithProps: () => <ClassroomPreview initial={basicZones()}/>,
    toCode: () => `<OrgClassroom zones={zones} onSeatSelect={setSelectedSeatId} onStatusChange={onStatusChange} />`,
};
