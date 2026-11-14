"use client";
import { copy } from "./page.content";

import { useMemo, useState } from "react";
import { CalendarClock, CheckCircle2, Clock } from "lucide-react";
import {
  Alert,
  Button,
  Descriptions,
  DescriptionsItem,
  Drawer,
  DrawerContent,
  Field,
  Input,
  ModalForm,
  Popconfirm,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  Scheduler,
  Skeleton,
  Stat,
  Tag,
  TimeField,
  toast,
  useForm,
  dayjs,
  type SchedulerEvent,
  type SchedulerSlot,
  type SchedulerView,
} from "@hulianui/ui";
import { sleep } from "../../../lib/async";
import { useOrg } from "../../_lib/org-store";
import { DEMO_DAY, DEMO_NOW } from "../../_data/org";
import type { InterviewStage } from "../../_data/types";
import {
  INTERVIEW_STATUS_LABEL,
  INTERVIEW_STATUS_TONE,
  STAGE_LABEL,
} from "../../_lib/labels";

type InterviewForm = {
  candidate: string;
  role: string;
  stage: InterviewStage;
  roomId: string;
  interviewerId: string;
  date: string;
  start: string;
  duration: string;
};

const DURATIONS = ["30", "45", "60", "90"] as const;
const STAGES: InterviewStage[] = ["screen", "tech", "final"];

const EVENT_TONE = {
  scheduled: "primary",
  ongoing: "warning",
  done: "success",
  canceled: "neutral",
} as const;

export default function OrgClassroomInterviewsPage() {
  const {
    state,
    loading,
    error,
    reload,
    peopleById,
    addInterview,
    updateInterview,
    setInterviewStatus,
  } = useOrg();

  const [view, setView] = useState<SchedulerView>("resource");
  const [date, setDate] = useState(DEMO_DAY);
  const [formOpen, setFormOpen] = useState(false);
  const [detailId, setDetailId] = useState<string | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const form = useForm<InterviewForm>({
    initialValues: {
      candidate: "",
      role: "",
      stage: "screen",
      roomId: state.rooms[0]?.id ?? "",
      interviewerId: state.people[0]?.id ?? "",
      date: DEMO_DAY,
      start: "09:00",
      duration: "45",
    },
  });

  const candidate = form.register("candidate", {
    rules: [{ required: true, message: copy("requiredCandidate") }],
  });
  const role = form.register("role", {
    rules: [{ required: true, message: copy("requiredRole") }],
  });
  const stage = form.register("stage", {
    rules: [{ required: true, message: copy("requiredStage") }],
  });
  const room = form.register("roomId", {
    rules: [{ required: true, message: copy("requiredRoom") }],
  });
  const interviewer = form.register("interviewerId", {
    rules: [{ required: true, message: copy("requiredInterviewer") }],
  });
  const dateField = form.register("date", {
    rules: [{ required: true, message: copy("requiredDate") }],
  });
  const start = form.register("start", {
    rules: [{ required: true, message: copy("requiredStart") }],
  });
  const duration = form.register("duration", {
    rules: [{ required: true, message: copy("requiredDuration") }],
  });

  const dateOptions = useMemo(
    () => Array.from({ length: 7 }, (_, index) => dayjs(DEMO_DAY).add(index, "day").format("YYYY-MM-DD")),
    [],
  );

  const events = useMemo<SchedulerEvent[]>(
    () =>
      state.interviews.map((interview) => ({
        id: interview.id,
        title: `${interview.candidate} · ${interview.role}`,
        subtitle: state.rooms.find((item) => item.id === interview.roomId)?.name,
        start: interview.start,
        end: interview.end,
        resourceId: interview.roomId,
        tone: EVENT_TONE[interview.status],
      })),
    [state.interviews, state.rooms],
  );

  const resources = useMemo(
    () =>
      state.rooms.map((roomRecord) => ({
        id: roomRecord.id,
        title: roomRecord.name,
        subtitle: roomRecord.floor,
      })),
    [state.rooms],
  );

  const todayInterviews = useMemo(
    () =>
      state.interviews.filter(
        (interview) => interview.start.startsWith(DEMO_DAY) && interview.status !== "canceled",
      ),
    [state.interviews],
  );

  const detail = detailId ? state.interviews.find((interview) => interview.id === detailId) : undefined;
  const detailRoom = detail ? state.rooms.find((roomRecord) => roomRecord.id === detail.roomId) : undefined;
  const detailInterviewer = detail ? peopleById.get(detail.interviewerId) : undefined;

  const openCreate = (slot?: Pick<SchedulerSlot, "start" | "resourceId">) => {
    const startISO = slot?.start ?? `${date}T09:00:00`;
    form.resetFields();
    form.setFieldsValue(
      {
        candidate: "",
        role: "",
        stage: "screen",
        roomId: slot?.resourceId ?? state.rooms[0]?.id ?? "",
        interviewerId: state.people[0]?.id ?? "",
        date: startISO.slice(0, 10),
        start: startISO.slice(11, 16),
        duration: "45",
      },
      { markPristine: true },
    );
    setFormOpen(true);
  };

  const handleEventsChange = (next: SchedulerEvent[]) => {
    let moved = "";
    let movedTo = "";
    for (const event of next) {
      const previous = state.interviews.find((interview) => interview.id === event.id);
      if (!previous) continue;
      const nextRoom = event.resourceId ?? previous.roomId;
      if (
        previous.start === event.start &&
        previous.end === event.end &&
        previous.roomId === nextRoom
      ) {
        continue;
      }
      updateInterview(event.id, { start: event.start, end: event.end, roomId: nextRoom });
      moved = previous.candidate;
      movedTo = `${event.start.slice(5, 10)} ${event.start.slice(11, 16)}`;
    }
    if (moved) {
      toast({
        tone: "info",
        title: copy("movedToast"),
        description: copy("movedToastDesc", moved, movedTo),
      });
    }
  };

  const startHour = Math.max(0, Math.min(23, Number(state.settings.dayStart.slice(0, 2))));
  const endHour = Math.max(startHour + 1, Math.min(24, Number(state.settings.dayEnd.slice(0, 2))));

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-foreground">{copy("title")}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{copy("subtitle")}</p>
        </div>
        <Button onClick={() => openCreate()}>{copy("newInterview")}</Button>
      </div>

      {error ? (
        <Alert tone="danger" title={copy("loadFailed")}>
          <div className="flex flex-col gap-2">
            <span>{error}</span>
            <Button variant="outline" size="sm" className="w-fit" onClick={reload}>
              {copy("retry")}
            </Button>
          </div>
        </Alert>
      ) : loading ? (
        <div className="flex flex-col gap-4">
          <div className="grid gap-3 sm:grid-cols-3">
            {Array.from({ length: 3 }, (_, index) => (
              <Skeleton key={index} className="h-28 w-full" shape="rect" />
            ))}
          </div>
          <Skeleton className="h-[620px] w-full" shape="rect" />
        </div>
      ) : (
        <>
          <div className="grid gap-3 sm:grid-cols-3">
            <Stat
              label={copy("statToday")}
              value={todayInterviews.length}
              hint={copy("statTodayHint", todayInterviews.filter((interview) => interview.status === "ongoing").length)}
              tone="brand"
              icon={<CalendarClock className="size-4" />}
            />
            <Stat
              label={copy("statScheduled")}
              value={todayInterviews.filter((interview) => interview.status === "scheduled").length}
              tone="info"
              icon={<Clock className="size-4" />}
            />
            <Stat
              label={copy("statDone")}
              value={todayInterviews.filter((interview) => interview.status === "done").length}
              tone="success"
              icon={<CheckCircle2 className="size-4" />}
            />
          </div>

          <p className="text-sm text-muted-foreground">{copy("hint")}</p>

          <div className="h-[620px] w-full">
            <Scheduler
              className="h-full"
              events={events}
              view={view}
              date={date}
              resources={resources}
              now={DEMO_NOW}
              dayStartHour={startHour}
              dayEndHour={endHour}
              onViewChange={setView}
              onDateChange={setDate}
              onEventsChange={handleEventsChange}
              onSlotClick={(slot) => openCreate(slot)}
              onSlotDragCreate={(slot) => openCreate(slot)}
              onEventClick={(event) => {
                setDetailId(event.id);
                setDetailOpen(true);
              }}
            />
          </div>

          <ModalForm
            title={copy("formTitle")}
            open={formOpen}
            onOpenChange={setFormOpen}
            form={form}
            submitText={copy("submit")}
            className="w-[560px]"
            onFinish={(values) => {
              const data = values as InterviewForm;
              const startISO = `${data.date}T${data.start}:00`;
              const endISO = dayjs(startISO)
                .add(Number(data.duration), "minute")
                .format("YYYY-MM-DDTHH:mm:ss");
              addInterview({
                candidate: data.candidate.trim(),
                role: data.role.trim(),
                stage: data.stage,
                roomId: data.roomId,
                interviewerId: data.interviewerId,
                start: startISO,
                end: endISO,
              });
              toast({
                tone: "success",
                title: copy("createdToast"),
                description: copy("createdToastDesc", data.candidate.trim(), data.role.trim()),
              });
              return true;
            }}
          >
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label={copy("candidate")} error={candidate.error} required>
                <Input
                  value={candidate.value as string}
                  onChange={candidate.onChange}
                  onBlur={candidate.onBlur}
                  placeholder={copy("candidatePlaceholder")}
                />
              </Field>
              <Field label={copy("role")} error={role.error} required>
                <Input
                  value={role.value as string}
                  onChange={role.onChange}
                  onBlur={role.onBlur}
                  placeholder={copy("rolePlaceholder")}
                />
              </Field>
              <Field label={copy("stage")} error={stage.error} required>
                <Select
                  items={STAGES.map((item) => ({ value: item, label: STAGE_LABEL[item] }))}
                  value={(stage.value as string) || null}
                  onValueChange={(value) => stage.onChange(value ?? "")}
                >
                  <SelectTrigger aria-label={copy("stage")} />
                  <SelectContent>
                    {STAGES.map((item) => (
                      <SelectItem key={item} value={item}>
                        {STAGE_LABEL[item]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field label={copy("room")} error={room.error} required>
                <Select
                  items={state.rooms.map((roomRecord) => ({
                    value: roomRecord.id,
                    label: roomRecord.name,
                  }))}
                  value={(room.value as string) || null}
                  onValueChange={(value) => room.onChange(value ?? "")}
                >
                  <SelectTrigger aria-label={copy("room")} />
                  <SelectContent>
                    {state.rooms.map((roomRecord) => (
                      <SelectItem key={roomRecord.id} value={roomRecord.id}>
                        {roomRecord.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field label={copy("interviewer")} error={interviewer.error} required>
                <Select
                  searchable
                  items={state.people.map((person) => ({
                    value: person.id,
                    label: person.name,
                  }))}
                  value={(interviewer.value as string) || null}
                  onValueChange={(value) => interviewer.onChange(value ?? "")}
                >
                  <SelectTrigger aria-label={copy("interviewer")} />
                  <SelectContent>
                    {state.people.map((person) => (
                      <SelectItem key={person.id} value={person.id}>
                        {person.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field label={copy("date")} error={dateField.error} required>
                <Select
                  items={dateOptions.map((option) => ({ value: option, label: option.slice(5) }))}
                  value={(dateField.value as string) || null}
                  onValueChange={(value) => dateField.onChange(value ?? "")}
                >
                  <SelectTrigger aria-label={copy("date")} />
                  <SelectContent>
                    {dateOptions.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option.slice(5)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field label={copy("start")} error={start.error} required>
                <TimeField
                  aria-label={copy("start")}
                  value={(start.value as string) || null}
                  onValueChange={(value) => start.onChange(value ?? "")}
                />
              </Field>
              <Field label={copy("duration")} error={duration.error} required>
                <Select
                  items={DURATIONS.map((item) => ({
                    value: item,
                    label: copy("minutes", item),
                  }))}
                  value={(duration.value as string) || null}
                  onValueChange={(value) => duration.onChange(value ?? "")}
                >
                  <SelectTrigger aria-label={copy("duration")} />
                  <SelectContent>
                    {DURATIONS.map((item) => (
                      <SelectItem key={item} value={item}>
                        {copy("minutes", item)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            </div>
          </ModalForm>

          <Drawer
            open={detailOpen}
            onOpenChange={(open) => {
              setDetailOpen(open);
              if (!open) setDetailId(null);
            }}
          >
            <DrawerContent
              side="right"
              size="md"
              title={detail?.candidate ?? copy("detailTitle")}
              description={copy("detailTitle")}
              extra={
                detail ? (
                  <Tag tone={INTERVIEW_STATUS_TONE[detail.status]} size="sm">
                    {INTERVIEW_STATUS_LABEL[detail.status]}
                  </Tag>
                ) : null
              }
              footer={
                <div className="flex w-full flex-wrap items-center justify-end gap-2">
                  <Button variant="outline" onClick={() => setDetailOpen(false)}>
                    {copy("close")}
                  </Button>
                  {detail ? (
                    <>
                      <Popconfirm
                        danger
                        title={copy("cancelTitle", detail.candidate)}
                        description={copy("cancelDesc")}
                        okText={copy("cancelInterview")}
                        onConfirm={async () => {
                          await sleep(400);
                          setInterviewStatus(detail.id, "canceled");
                          toast({
                            tone: "success",
                            title: copy("canceledToast"),
                            description: copy("canceledToastDesc", detail.candidate),
                          });
                          setDetailOpen(false);
                        }}
                      >
                        <Button
                          variant="outline"
                          tone="danger"
                          disabled={detail.status === "canceled" || detail.status === "done"}
                        >
                          {copy("cancelInterview")}
                        </Button>
                      </Popconfirm>
                      <Button
                        disabled={detail.status === "canceled" || detail.status === "done"}
                        onClick={() => {
                          setInterviewStatus(detail.id, "done");
                          toast({
                            tone: "success",
                            title: copy("doneToast"),
                            description: copy("doneToastDesc", detail.candidate),
                          });
                        }}
                      >
                        {copy("markDone")}
                      </Button>
                    </>
                  ) : null}
                </div>
              }
            >
              {detail ? (
                <Descriptions column={2} size="sm">
                  <DescriptionsItem label={copy("stageLabel")}>
                    {STAGE_LABEL[detail.stage]}
                  </DescriptionsItem>
                  <DescriptionsItem label={copy("roomLabel")}>{detailRoom?.name}</DescriptionsItem>
                  <DescriptionsItem label={copy("interviewerLabel")}>
                    {detailInterviewer?.name}
                  </DescriptionsItem>
                  <DescriptionsItem label={copy("statusLabel")}>
                    {INTERVIEW_STATUS_LABEL[detail.status]}
                  </DescriptionsItem>
                  <DescriptionsItem label={copy("timeLabel")} span={2}>
                    {detail.start.slice(5, 10)} {detail.start.slice(11, 16)} –{" "}
                    {detail.end.slice(11, 16)}
                  </DescriptionsItem>
                </Descriptions>
              ) : null}
            </DrawerContent>
          </Drawer>
        </>
      )}
    </div>
  );
}
