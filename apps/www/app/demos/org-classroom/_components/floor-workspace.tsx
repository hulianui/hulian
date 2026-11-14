"use client";
import { copy } from "./floor-workspace.content";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeftRight, Search, UserPlus } from "lucide-react";
import {
  Alert,
  Avatar,
  Button,
  Card,
  CardBody,
  CardHeader,
  Command,
  Empty,
  Field,
  FilterChip,
  FilterChipGroup,
  Legend,
  Meter,
  ModalForm,
  OrgClassroom,
  Popconfirm,
  Segmented,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  Skeleton,
  Tag,
  Text,
  toast,
  useForm,
  type SeatStatus,
  type ViewAngle,
} from "@hulianui/ui";
import { useOrg } from "../_lib/org-store";
import { DEMO_DAY } from "../_data/org";
import {
  INTERVIEW_STATUS_LABEL,
  INTERVIEW_STATUS_TONE,
  SEAT_UNASSIGNED,
  STATUS_COLOR,
  STATUS_LABEL,
  STATUS_ORDER,
  STATUS_TONE,
  formatSeat,
} from "../_lib/labels";
import { sleep, usePending } from "../../lib/async";
import { ActivityFeed } from "./activity-feed";
import { PersonDrawer } from "./person-drawer";
import { ROOT } from "./nav-config";

type StatusFilter = "all" | SeatStatus | "empty";

export function FloorWorkspace() {
  const router = useRouter();
  const {
    state,
    loading,
    error,
    reload,
    zones,
    stats,
    peopleById,
    departmentsById,
    seatsById,
    unassignedPeople,
    setStatus,
    assignSeat,
    moveSeat,
    releaseSeat,
  } = useOrg();

  const [selectedSeatId, setSelectedSeatId] = useState<string | null>(null);
  const [focusedZoneId, setFocusedZoneId] = useState<string | null>(null);
  const [view, setView] = useState<ViewAngle>(state.settings.defaultView);
  const [deptFilter, setDeptFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [commandOpen, setCommandOpen] = useState(false);
  const [assignPersonId, setAssignPersonId] = useState("");
  const [swapOpen, setSwapOpen] = useState(false);
  const [drawerPersonId, setDrawerPersonId] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const [assignPending, runAssign] = usePending();
  const urlSeatConsumed = useRef(false);
  const swapForm = useForm<{ seatId: string }>({ initialValues: { seatId: "" } });
  const swapSeat = swapForm.register("seatId", {
    rules: [{ required: true, message: copy("swapRequired") }],
  });

  const displayZones = useMemo(
    () => (deptFilter === "all" ? zones : zones.filter((zone) => zone.id === deptFilter)),
    [zones, deptFilter],
  );

  const selectedSeat = selectedSeatId ? seatsById.get(selectedSeatId) : undefined;
  const selectedPerson = selectedSeat?.personId
    ? peopleById.get(selectedSeat.personId)
    : undefined;
  const selectedDepartment = selectedSeat
    ? departmentsById.get(selectedSeat.departmentId)
    : undefined;
  const selectedSeatLabel =
    selectedSeat && selectedDepartment
      ? formatSeat(selectedDepartment.name, selectedSeat.row, selectedSeat.col)
      : SEAT_UNASSIGNED;

  const matchedPeople = useMemo(() => {
    if (statusFilter === "all") return [];
    return state.people.filter((person) => {
      if (deptFilter !== "all" && person.departmentId !== deptFilter) return false;
      if (statusFilter === "empty") return !person.seatId;
      return Boolean(person.seatId) && person.status === statusFilter;
    });
  }, [state.people, deptFilter, statusFilter]);

  const emptySeatOptions = useMemo(
    () =>
      state.seats
        .filter((seat) => !seat.personId)
        .map((seat) => {
          const department = departmentsById.get(seat.departmentId);
          return {
            value: seat.id,
            label: department
              ? formatSeat(department.name, seat.row, seat.col)
              : seat.id,
          };
        }),
    [state.seats, departmentsById],
  );

  const todayInterviews = useMemo(
    () =>
      state.interviews
        .filter((interview) => interview.start.startsWith(DEMO_DAY))
        .sort((a, b) => a.start.localeCompare(b.start)),
    [state.interviews],
  );

  const departmentItems = useMemo(
    () => [
      { value: "all", label: copy("allDepartments") },
      ...state.departments.map((department) => ({
        value: department.id,
        label: department.name,
      })),
    ],
    [state.departments],
  );

  const legendItems = useMemo(
    () =>
      STATUS_ORDER.map((status) => ({
        id: status,
        label: STATUS_LABEL[status],
        color: STATUS_COLOR[status],
        value: stats.statusCounts[status],
      })),
    [stats.statusCounts],
  );

  const commandGroups = useMemo(
    () => [
      {
        heading: copy("searchGroup"),
        items: state.people.map((person) => {
          const department = departmentsById.get(person.departmentId);
          return {
            value: person.id,
            label: person.name,
            keywords: `${person.name} ${person.title} ${person.email} ${department?.name ?? ""}`,
            description: `${person.title} · ${department?.name ?? ""} · ${STATUS_LABEL[person.status]}`,
          };
        }),
      },
    ],
    [state.people, departmentsById],
  );

  // 从人员档案「在工位图中查看」跳过来时带 ?seat=。只消费一次，之后不再覆盖用户的选择。
  useEffect(() => {
    if (urlSeatConsumed.current) return;
    urlSeatConsumed.current = true;
    if (typeof window === "undefined") return;
    const seatId = new URLSearchParams(window.location.search).get("seat");
    const record = seatId ? seatsById.get(seatId) : undefined;
    if (!record) return;
    setSelectedSeatId(record.id);
    setFocusedZoneId(record.departmentId);
  }, [seatsById]);

  // 选中的座位被删除（或部门筛选把它藏起来）时，面板跟着收起。
  useEffect(() => {
    if (selectedSeatId && !seatsById.has(selectedSeatId)) setSelectedSeatId(null);
  }, [selectedSeatId, seatsById]);

  useEffect(() => {
    if (deptFilter === "all" || !selectedSeat) return;
    if (selectedSeat.departmentId !== deptFilter) setSelectedSeatId(null);
  }, [deptFilter, selectedSeat]);

  const locatePerson = (personId: string, resetFilters = false) => {
    const person = peopleById.get(personId);
    if (!person) return;
    if (resetFilters) {
      setDeptFilter("all");
      setStatusFilter("all");
    }
    if (person.seatId && seatsById.has(person.seatId)) {
      const seat = seatsById.get(person.seatId);
      setSelectedSeatId(person.seatId);
      if (seat) setFocusedZoneId(seat.departmentId);
      return;
    }
    setDrawerPersonId(person.id);
    setDrawerOpen(true);
    toast({ tone: "info", title: copy("unassignedPersonToast", person.name) });
  };

  const handleStatusChange = (seatId: string, status: SeatStatus) => {
    const seat = seatsById.get(seatId);
    const person = seat?.personId ? peopleById.get(seat.personId) : undefined;
    if (!person || person.status === status) return;
    setStatus(seatId, status);
    if (state.settings.notifyStatus) {
      toast({
        tone: "success",
        title: copy("statusUpdated"),
        description: copy("statusUpdatedDesc", person.name, STATUS_LABEL[status]),
      });
    }
  };

  const handleAssign = () => {
    if (!selectedSeat || !assignPersonId) return;
    const person = peopleById.get(assignPersonId);
    if (!person) return;
    void runAssign(() => {
      assignSeat(selectedSeat.id, assignPersonId);
      setAssignPersonId("");
      toast({
        tone: "success",
        title: copy("assignedToast"),
        description: copy("assignedToastDesc", person.name, selectedSeatLabel),
      });
    });
  };

  const openSwap = () => {
    if (!selectedPerson) return;
    swapForm.resetFields();
    swapForm.setFieldsValue({ seatId: emptySeatOptions[0]?.value ?? "" }, { markPristine: true });
    setSwapOpen(true);
  };

  const departmentName =
    deptFilter === "all" ? copy("allDepartments") : departmentsById.get(deptFilter)?.name ?? deptFilter;
  const statusName =
    statusFilter === "all"
      ? copy("allStatus")
      : statusFilter === "empty"
        ? copy("emptyStatus")
        : STATUS_LABEL[statusFilter];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-foreground">{copy("title")}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{copy("subtitle")}</p>
        </div>
        <Button variant="outline" onClick={() => setCommandOpen(true)}>
          <Search className="size-4" />
          {copy("search")}
        </Button>
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
        <div className="flex flex-col gap-3">
          <Skeleton className="h-16 w-full" shape="rect" />
          <Skeleton className="h-[520px] w-full" shape="rect" />
        </div>
      ) : (
        <>
          <Card>
            <CardBody className="flex flex-wrap items-center gap-x-4 gap-y-3">
              <div className="hidden min-w-0 sm:block">
                <Segmented
                  items={departmentItems}
                  value={deptFilter}
                  onValueChange={setDeptFilter}
                  size="sm"
                  className="max-w-full"
                  aria-label={copy("filterDept")}
                />
              </div>
              <div className="w-full sm:hidden">
                <Select
                  items={departmentItems}
                  value={deptFilter}
                  onValueChange={setDeptFilter}
                >
                  <SelectTrigger className="w-full" aria-label={copy("filterDept")} />
                  <SelectContent>
                    {departmentItems.map((item) => (
                      <SelectItem key={item.value} value={item.value}>
                        {item.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="ml-auto flex flex-wrap items-center gap-2">
                <Select
                  items={[
                    { value: "all", label: copy("allStatus") },
                    ...STATUS_ORDER.map((status) => ({
                      value: status,
                      label: STATUS_LABEL[status],
                    })),
                    { value: "empty", label: copy("emptyStatus") },
                  ]}
                  value={statusFilter}
                  onValueChange={(value) => setStatusFilter((value as StatusFilter) ?? "all")}
                >
                  <SelectTrigger size="sm" className="w-36" aria-label={copy("filterStatus")} />
                  <SelectContent>
                    <SelectItem value="all">{copy("allStatus")}</SelectItem>
                    {STATUS_ORDER.map((status) => (
                      <SelectItem key={status} value={status}>
                        {STATUS_LABEL[status]}
                      </SelectItem>
                    ))}
                    <SelectItem value="empty">{copy("emptyStatus")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardBody>
          </Card>

          <FilterChipGroup
            clearAllLabel={copy("clearAll")}
            aria-label={copy("activeFilters")}
            onClearAll={() => {
              setDeptFilter("all");
              setStatusFilter("all");
            }}
          >
            {deptFilter !== "all" ? (
              <FilterChip
                subject={copy("filterDept")}
                value={departmentName}
                onRemove={() => setDeptFilter("all")}
              />
            ) : null}
            {statusFilter !== "all" ? (
              <FilterChip
                subject={copy("filterStatus")}
                value={statusName}
                onRemove={() => setStatusFilter("all")}
              />
            ) : null}
          </FilterChipGroup>

          {statusFilter !== "all" ? (
            <Card>
              <CardHeader
                title={copy("matchTitle")}
                extra={<Tag tone="brand" size="sm">{copy("matchCount", matchedPeople.length)}</Tag>}
              />
              <CardBody>
                {matchedPeople.length === 0 ? (
                  <Empty size="sm" title={copy("matchEmpty")} />
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {matchedPeople.map((person) => (
                      <Button
                        key={person.id}
                        variant="outline"
                        size="sm"
                        onClick={() => locatePerson(person.id)}
                      >
                        <Avatar size="sm" fallback={person.name.slice(0, 1)} />
                        {person.name}
                      </Button>
                    ))}
                  </div>
                )}
              </CardBody>
            </Card>
          ) : null}

          {displayZones.length > 1 ? (
            <p className="text-xs text-muted-foreground">{copy("compactHint")}</p>
          ) : null}

          {state.settings.showLegend ? (
            <Card>
              <CardBody className="flex flex-wrap items-center gap-x-4 gap-y-2">
                <span className="text-sm font-medium text-foreground">{copy("legend")}</span>
                <Legend items={legendItems} size="sm" />
              </CardBody>
            </Card>
          ) : null}

          {displayZones.length === 0 ? (
            <Empty title={copy("mapEmptyTitle")} description={copy("mapEmptyDesc")} />
          ) : (
            <Card>
              <CardBody className="p-3 sm:p-4">
                <OrgClassroom
                  zones={displayZones}
                  selectedSeatId={selectedSeatId}
                  onSeatSelect={setSelectedSeatId}
                  focusedZoneId={focusedZoneId}
                  onZoneFocus={setFocusedZoneId}
                  view={view}
                  onViewChange={setView}
                  northDeg={state.settings.northDeg}
                  onStatusChange={handleStatusChange}
                />
              </CardBody>
            </Card>
          )}

          {selectedPerson ? (
            <Card>
              <CardHeader
                title={selectedPerson.name}
                extra={
                  <Tag tone={STATUS_TONE[selectedPerson.status]} size="sm">
                    {STATUS_LABEL[selectedPerson.status]}
                  </Tag>
                }
              />
              <CardBody className="flex flex-col gap-4">
                <div className="flex flex-wrap items-center gap-3">
                  <Avatar size="lg" fallback={selectedPerson.name.slice(0, 1)} />
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-foreground">
                      {selectedPerson.title}
                    </div>
                    <div className="text-sm text-muted-foreground">{selectedSeatLabel}</div>
                  </div>
                  <div className="ml-auto text-sm text-muted-foreground">
                    {selectedPerson.email} · {selectedPerson.phone}
                  </div>
                </div>

                <ActivityFeed
                  items={state.activity.filter((item) => item.personId === selectedPerson.id)}
                  limit={4}
                />

                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setDrawerPersonId(selectedPerson.id);
                      setDrawerOpen(true);
                    }}
                  >
                    {copy("viewProfile")}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={emptySeatOptions.length === 0}
                    onClick={openSwap}
                  >
                    <ArrowLeftRight className="size-4" />
                    {copy("swapSeat")}
                  </Button>
                  <Popconfirm
                    danger
                    title={copy("releaseTitle", selectedPerson.name)}
                    description={copy("releaseDesc")}
                    okText={copy("releaseSeat")}
                    onConfirm={async () => {
                      await sleep(400);
                      releaseSeat(selectedSeat!.id);
                      setSelectedSeatId(null);
                      toast({
                        tone: "success",
                        title: copy("releasedToast"),
                        description: copy("releasedToastDesc", selectedPerson.name),
                      });
                    }}
                  >
                    <Button variant="outline" size="sm" tone="danger">
                      {copy("releaseSeat")}
                    </Button>
                  </Popconfirm>
                </div>
              </CardBody>
            </Card>
          ) : selectedSeat ? (
            <Card>
              <CardHeader
                title={copy("emptySeatTitle")}
                extra={<Tag tone="neutral" size="sm">{selectedSeatLabel}</Tag>}
              />
              <CardBody className="flex flex-col gap-3">
                <Text size="sm" tone="muted">
                  {copy("emptySeatDesc")}
                </Text>
                {unassignedPeople.length === 0 ? (
                  <Text size="sm" tone="muted">
                    {copy("noUnassigned")}
                  </Text>
                ) : (
                  <div className="flex flex-wrap items-center gap-2">
                    <Select
                      items={unassignedPeople.map((person) => ({
                        value: person.id,
                        label: `${person.name} · ${person.title}`,
                      }))}
                      value={assignPersonId || null}
                      placeholder={copy("selectPerson")}
                      onValueChange={(value) => setAssignPersonId(value ?? "")}
                    >
                      <SelectTrigger className="w-64" aria-label={copy("selectPerson")} />
                      <SelectContent>
                        {unassignedPeople.map((person) => (
                          <SelectItem key={person.id} value={person.id}>
                            {person.name} · {person.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button
                      loading={assignPending}
                      disabled={!assignPersonId}
                      onClick={handleAssign}
                    >
                      <UserPlus className="size-4" />
                      {copy("assignSeat")}
                    </Button>
                  </div>
                )}
              </CardBody>
            </Card>
          ) : (
            <div className="flex flex-col gap-4">
              <div className="rounded-[var(--radius)] border border-dashed border-border px-4 py-3">
                <div className="text-sm font-medium text-foreground">{copy("selectSeatTitle")}</div>
                <div className="mt-1 text-sm text-muted-foreground">{copy("selectSeatDesc")}</div>
              </div>
              <div className="grid gap-4 lg:grid-cols-2">
              <Card>
                <CardHeader title={copy("deptSummary")} />
                <CardBody className="flex flex-col gap-4">
                  {state.departments.map((department) => {
                    const seats = state.seats.filter(
                      (seat) => seat.departmentId === department.id,
                    );
                    const occupied = seats.filter((seat) => seat.personId).length;
                    const members = state.people.filter(
                      (person) => person.departmentId === department.id,
                    ).length;
                    return (
                      <div key={department.id} className="flex flex-col gap-1.5">
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-medium text-foreground">{department.name}</span>
                          <span className="text-muted-foreground">
                            {copy("peopleCount", members)}
                          </span>
                        </div>
                        <Meter
                          value={occupied}
                          max={Math.max(seats.length, 1)}
                          showValue
                          label={department.name}
                          formatValue={({ value, max }) => copy("seatsCount", value, max)}
                          className="w-full"
                        />
                      </div>
                    );
                  })}
                </CardBody>
              </Card>

              <Card>
                <CardHeader
                  title={copy("todayInterviews")}
                  extra={
                    <Button variant="ghost" size="sm" onClick={() => router.push(`${ROOT}/interviews`)}>
                      {copy("openInterviews")}
                    </Button>
                  }
                />
                <CardBody className="flex flex-col gap-3">
                  {todayInterviews.length === 0 ? (
                    <Empty size="sm" title={copy("noInterviewsToday")} />
                  ) : (
                    todayInterviews.map((interview) => (
                      <div
                        key={interview.id}
                        className="flex flex-wrap items-center gap-2 text-sm"
                      >
                        <span className="font-mono text-xs text-muted-foreground">
                          {interview.start.slice(11, 16)}
                        </span>
                        <span className="font-medium text-foreground">{interview.candidate}</span>
                        <span className="text-muted-foreground">
                          {state.rooms.find((room) => room.id === interview.roomId)?.name}
                        </span>
                        <Tag tone={INTERVIEW_STATUS_TONE[interview.status]} size="sm" className="ml-auto">
                          {INTERVIEW_STATUS_LABEL[interview.status]}
                        </Tag>
                      </div>
                    ))
                  )}
                </CardBody>
              </Card>
              </div>
            </div>
          )}

          <ModalForm
            title={copy("swapTitle")}
            open={swapOpen}
            onOpenChange={setSwapOpen}
            form={swapForm}
            submitText={copy("swapSubmit")}
            onFinish={async (values) => {
              const targetId = (values as { seatId: string }).seatId;
              const target = seatsById.get(targetId);
              const department = target ? departmentsById.get(target.departmentId) : undefined;
              if (!selectedPerson || !target) return false;
              await sleep(450);
              moveSeat(selectedPerson.id, targetId);
              setSelectedSeatId(targetId);
              if (department) setFocusedZoneId(department.id);
              toast({
                tone: "success",
                title: copy("movedToast"),
                description: copy(
                  "movedToastDesc",
                  selectedPerson.name,
                  formatSeat(department?.name ?? target.departmentId, target.row, target.col),
                ),
              });
              return true;
            }}
          >
            <Field
              label={copy("swapTarget")}
              description={copy("swapDesc")}
              error={swapSeat.error}
              required
            >
              <Select
                items={emptySeatOptions}
                value={(swapSeat.value as string) || null}
                placeholder={copy("swapTarget")}
                onValueChange={(value) => swapSeat.onChange(value ?? "")}
              >
                <SelectTrigger aria-label={copy("swapTarget")} />
                <SelectContent>
                  {emptySeatOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          </ModalForm>

          <Command
            open={commandOpen}
            onOpenChange={setCommandOpen}
            groups={commandGroups}
            shortcut
            placeholder={copy("searchPlaceholder")}
            emptyMessage={copy("searchEmpty")}
            onSelectItem={(value) => locatePerson(value, true)}
          />

          <PersonDrawer
            personId={drawerPersonId}
            open={drawerOpen}
            onOpenChange={setDrawerOpen}
          />
        </>
      )}
    </div>
  );
}
