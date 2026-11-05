import { Button } from "../button";
import { Card, CardBody, CardHeader } from "../card";
import { Tag } from "../tag";
import { Text } from "../text";
import type { OrgClassroomCopy } from "./copy";
import type { SeatStatus, Zone } from "./org-classroom.types";
import { SEAT_STATUSES } from "./org-classroom.types";
import { STATUS_TONE } from "./status-chip";

const BUTTON_TONE = {
  idle: "success",
  busy: "warning",
  meeting: "brand",
  leave: "neutral",
  interview: "neutral",
} as const;

export function PersonCard({
  copy,
  zone,
  seatId,
  person,
  onStatusChange,
}: {
  copy: OrgClassroomCopy;
  zone: Zone | null;
  seatId: string | null;
  person: Zone["seats"][number]["person"] | null;
  onStatusChange?: (seatId: string, status: SeatStatus) => void;
}) {
  return (
    <aside aria-label={copy.personCard} data-slot="org-classroom-person" className="w-full shrink-0 lg:w-80">
      <Card variant="elevated" size="sm">
        {person && zone ? (
          <>
            <CardHeader title={person.name} />
            <CardBody className="flex flex-col gap-3">
              <div>
                <Text size="xs" tone="muted">
                  {copy.department}
                </Text>
                <Text size="sm" weight="medium" data-field="department">
                  {zone.name}
                </Text>
              </div>
              <div className="flex flex-col items-start gap-1.5">
                <Text size="xs" tone="muted">
                  {copy.status}
                </Text>
                <Tag tone={STATUS_TONE[person.status]} size="sm" data-field="status">
                  {copy.statuses[person.status]}
                </Tag>
              </div>
              <div role="group" aria-label={copy.changeStatus} className="flex flex-wrap gap-1.5">
                {SEAT_STATUSES.map((status) => {
                  const active = person.status === status;
                  return (
                    <Button
                      key={status}
                      type="button"
                      size="sm"
                      variant={active ? "soft" : "outline"}
                      tone={BUTTON_TONE[status]}
                      aria-pressed={active}
                      data-status-option={status}
                      onClick={() => {
                        if (!active && seatId) onStatusChange?.(seatId, status);
                      }}
                    >
                      {copy.statuses[status]}
                    </Button>
                  );
                })}
              </div>
            </CardBody>
          </>
        ) : (
          <>
            <CardHeader title={zone ? copy.emptySeat : copy.personCard} />
            <CardBody>
              <Text size="sm" tone="muted">
                {zone ? copy.emptySeatHint : copy.selectPrompt}
              </Text>
            </CardBody>
          </>
        )}
      </Card>
    </aside>
  );
}
