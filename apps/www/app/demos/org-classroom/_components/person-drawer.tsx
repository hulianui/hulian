"use client";
import { copy } from "./person-drawer.content";

import { useRouter } from "next/navigation";
import {
  Avatar,
  Button,
  Descriptions,
  DescriptionsItem,
  Drawer,
  DrawerContent,
  Tag,
  toast,
} from "@hulianui/ui";
import { useOrg } from "../_lib/org-store";
import { usePending } from "../../lib/async";
import { STATUS_LABEL, STATUS_TONE, formatSeat, SEAT_UNASSIGNED } from "../_lib/labels";
import { ActivityFeed } from "./activity-feed";
import { ROOT } from "./nav-config";

export function PersonDrawer({
  personId,
  open,
  onOpenChange,
}: {
  personId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const router = useRouter();
  const { peopleById, seatsById, departmentsById, state, setStatus } = useOrg();
  const [pending, run] = usePending();
  const person = personId ? peopleById.get(personId) : undefined;
  const department = person ? departmentsById.get(person.departmentId) : undefined;
  const seat = person?.seatId ? seatsById.get(person.seatId) : undefined;
  const seatLabel =
    seat && department ? formatSeat(department.name, seat.row, seat.col) : SEAT_UNASSIGNED;
  const activity = state.activity.filter((item) => item.personId === person?.id);

  const onSetOnDuty = () => {
    if (!person || !seat) return;
    void run(() => {
      setStatus(seat.id, "idle");
      toast({
        tone: "success",
        title: copy("statusUpdated"),
        description: copy("statusUpdatedDesc", person.name, STATUS_LABEL.idle),
      });
    });
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent
        side="right"
        size="md"
        title={copy("title")}
        description={copy("description")}
        footer={
          <div className="flex w-full flex-wrap items-center justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              {copy("close")}
            </Button>
            <Button
              variant="outline"
              disabled={!seat}
              onClick={() => {
                if (!seat) return;
                onOpenChange(false);
                router.push(`${ROOT}/floor?seat=${seat.id}`);
              }}
            >
              {copy("locate")}
            </Button>
            <Button
              loading={pending}
              disabled={!seat || person?.status === "idle"}
              onClick={onSetOnDuty}
            >
              {copy("setOnDuty")}
            </Button>
          </div>
        }
      >
        {person ? (
          <div className="flex flex-col gap-6">
            <div className="flex items-center gap-3">
              <Avatar size="lg" fallback={person.name.slice(0, 1)} />
              <div className="min-w-0">
                <div className="text-base font-semibold text-foreground">{person.name}</div>
                <div className="text-sm text-muted-foreground">{person.title}</div>
              </div>
              <Tag tone={STATUS_TONE[person.status]} size="sm" className="ml-auto">
                {STATUS_LABEL[person.status]}
              </Tag>
            </div>

            <Descriptions column={2} size="sm">
              <DescriptionsItem label={copy("email")}>{person.email}</DescriptionsItem>
              <DescriptionsItem label={copy("phone")}>{person.phone}</DescriptionsItem>
              <DescriptionsItem label={copy("department")}>{department?.name}</DescriptionsItem>
              <DescriptionsItem label={copy("seat")}>
                {seat ? seatLabel : copy("noSeat")}
              </DescriptionsItem>
              <DescriptionsItem label={copy("status")}>{STATUS_LABEL[person.status]}</DescriptionsItem>
              <DescriptionsItem label={copy("joinedOn")}>{person.joinedOn}</DescriptionsItem>
            </Descriptions>

            <div className="flex flex-col gap-3">
              <div className="text-sm font-medium text-foreground">{copy("recentActivity")}</div>
              <ActivityFeed items={activity} limit={6} />
            </div>
          </div>
        ) : null}
      </DrawerContent>
    </Drawer>
  );
}
