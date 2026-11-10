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

const CloseIcon = (
  <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" aria-hidden className="size-4">
    <path d="M5 5l10 10M15 5L5 15" />
  </svg>
);

export function PersonCard({
  copy,
  zone,
  seatId,
  person,
  onStatusChange,
  onClose,
}: {
  copy: OrgClassroomCopy;
  zone: Zone | null;
  seatId: string | null;
  person: Zone["seats"][number]["person"] | null;
  onStatusChange?: (seatId: string, status: SeatStatus) => void;
  onClose?: () => void;
}) {
  const close = onClose ? (
    <Button
      type="button"
      size="iconSm"
      variant="ghost"
      tone="neutral"
      aria-label={copy.closeCard}
      data-seat-close
      onClick={onClose}
    >
      {CloseIcon}
    </Button>
  ) : null;

  return (
    <aside
      aria-label={copy.personCard}
      data-slot="org-classroom-person"
      data-open={seatId ? "true" : "false"}
      className="relative z-20 w-full min-w-0 shrink-0 scroll-mb-28 @3xl:w-80"
    >
      <Card variant="elevated" size="sm">
        {person && zone ? (
          <>
            <CardHeader title={person.name} extra={close} />
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
              <div role="group" aria-label={copy.changeStatus} data-status-actions className="flex flex-wrap gap-1.5 scroll-mb-28">
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
            <CardHeader title={zone ? copy.emptySeat : copy.personCard} extra={zone ? close : null} />
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
