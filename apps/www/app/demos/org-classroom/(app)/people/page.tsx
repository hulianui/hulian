"use client";
import { copy } from "./page.content";

import { useCallback, useMemo, useState } from "react";
import {
  Alert,
  Avatar,
  Button,
  Popconfirm,
  ProTable,
  Tag,
  toast,
  type ColumnDef,
  type ProTableBatchCtx,
  type SeatStatus,
} from "@hulianui/ui";
import { sleep } from "../../../lib/async";
import { useOrg } from "../../_lib/org-store";
import type { PersonRecord } from "../../_data/types";
import {
  SEAT_UNASSIGNED,
  STATUS_LABEL,
  STATUS_ORDER,
  STATUS_TONE,
  formatSeat,
} from "../../_lib/labels";
import { PersonDrawer } from "../../_components/person-drawer";

const PAGE_SIZE = 8;

type PeopleFilter = {
  kw: string;
  department: string;
  status: string;
};

const EMPTY_FILTER: PeopleFilter = { kw: "", department: "all", status: "all" };

export default function OrgClassroomPeoplePage() {
  const {
    state,
    loading,
    error,
    reload,
    departmentsById,
    seatsById,
    setStatus,
    releaseSeat,
  } = useOrg();

  const [filter, setFilter] = useState<PeopleFilter>(EMPTY_FILTER);
  const [page, setPage] = useState(1);
  const [drawerPersonId, setDrawerPersonId] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const openProfile = useCallback((personId: string) => {
    setDrawerPersonId(personId);
    setDrawerOpen(true);
  }, []);

  const handleSetOnDuty = useCallback(
    (person: PersonRecord) => {
      if (!person.seatId) return;
      setStatus(person.seatId, "idle");
      toast({
        tone: "success",
        title: copy("statusUpdated"),
        description: copy("statusUpdatedDesc", person.name, STATUS_LABEL.idle),
      });
    },
    [setStatus],
  );

  const handleRelease = useCallback(
    async (person: PersonRecord) => {
      if (!person.seatId) return;
      await sleep(350);
      releaseSeat(person.seatId);
      toast({
        tone: "success",
        title: copy("releasedToast"),
        description: copy("releasedToastDesc", person.name),
      });
    },
    [releaseSeat],
  );

  const applyFilter = useCallback((values: Record<string, unknown>) => {
    setFilter({
      kw: String(values.kw ?? ""),
      department: String(values.department || "all"),
      status: String(values.status || "all"),
    });
    setPage(1);
  }, []);

  const filtered = useMemo(() => {
    const keyword = filter.kw.trim().toLowerCase();
    return state.people.filter((person) => {
      if (filter.department !== "all" && person.departmentId !== filter.department) return false;
      if (filter.status !== "all" && person.status !== filter.status) return false;
      if (!keyword) return true;
      const department = departmentsById.get(person.departmentId)?.name ?? "";
      return `${person.name} ${person.title} ${person.email} ${department}`
        .toLowerCase()
        .includes(keyword);
    });
  }, [state.people, filter, departmentsById]);

  const pageRows = useMemo(
    () => filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [filtered, page],
  );

  const columns = useMemo<ColumnDef<PersonRecord, unknown>[]>(
    () => [
      {
        id: "name",
        header: copy("colName"),
        meta: { lockVisible: true },
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <Avatar size="sm" fallback={row.original.name.slice(0, 1)} />
            <div className="min-w-0">
              <div className="font-medium text-foreground">{row.original.name}</div>
              <div className="truncate text-xs text-muted-foreground">{row.original.email}</div>
            </div>
          </div>
        ),
      },
      {
        id: "title",
        header: copy("colTitle"),
        cell: ({ row }) => <span className="text-sm">{row.original.title}</span>,
      },
      {
        id: "department",
        header: copy("colDept"),
        cell: ({ row }) => (
          <Tag tone="neutral" variant="outline" size="sm">
            {departmentsById.get(row.original.departmentId)?.name}
          </Tag>
        ),
      },
      {
        id: "seat",
        header: copy("colSeat"),
        cell: ({ row }) => {
          const seat = row.original.seatId ? seatsById.get(row.original.seatId) : undefined;
          const department = seat ? departmentsById.get(seat.departmentId) : undefined;
          return seat && department ? (
            <span className="text-sm">{formatSeat(department.name, seat.row, seat.col)}</span>
          ) : (
            <span className="text-sm text-muted-foreground">{SEAT_UNASSIGNED}</span>
          );
        },
      },
      {
        id: "status",
        header: copy("colStatus"),
        cell: ({ row }) => (
          <Tag tone={STATUS_TONE[row.original.status]} size="sm">
            {STATUS_LABEL[row.original.status]}
          </Tag>
        ),
      },
      {
        id: "joined",
        header: copy("colJoined"),
        cell: ({ row }) => (
          <span className="text-sm text-muted-foreground">{row.original.joinedOn}</span>
        ),
      },
      {
        id: "actions",
        header: copy("colActions"),
        cell: ({ row }) => {
          const person = row.original;
          return (
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="sm" onClick={() => openProfile(person.id)}>
                {copy("viewProfile")}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                disabled={!person.seatId || person.status === "idle"}
                onClick={() => handleSetOnDuty(person)}
              >
                {copy("setOnDuty")}
              </Button>
              {person.seatId ? (
                <Popconfirm
                  danger
                  title={copy("releaseTitle", person.name)}
                  description={copy("releaseDesc")}
                  okText={copy("release")}
                  onConfirm={() => handleRelease(person)}
                >
                  <Button variant="ghost" size="sm" tone="danger">
                    {copy("release")}
                  </Button>
                </Popconfirm>
              ) : null}
            </div>
          );
        },
      },
    ],
    [departmentsById, seatsById, openProfile, handleSetOnDuty, handleRelease],
  );

  const applyBatch = useCallback(
    (status: SeatStatus, ctx: ProTableBatchCtx) => {
      const targets = state.people.filter(
        (person) => ctx.selectedRowKeys.includes(person.id) && person.seatId,
      );
      if (targets.length === 0) {
        toast({ tone: "warning", title: copy("batchNoSeats") });
        return;
      }
      targets.forEach((person) => {
        if (person.seatId) setStatus(person.seatId, status);
      });
      toast({
        tone: "success",
        title: copy("batchDone"),
        description: copy("batchDoneDesc", targets.length, STATUS_LABEL[status]),
      });
      ctx.clearSelection();
    },
    [state.people, setStatus],
  );

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-xl font-semibold text-foreground">{copy("title")}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{copy("subtitle")}</p>
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
      ) : (
        <ProTable<PersonRecord>
          columns={columns}
          data={loading ? [] : pageRows}
          getRowId={(person) => person.id}
          loading={loading}
          enableSorting={false}
          enableRowSelection
          emptyText={copy("noResults")}
          toolbar={{ reload: true, density: true, columnSetting: true, fullscreen: true }}
          onReload={reload}
          batchActions={(ctx) => (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm text-muted-foreground">
                {copy("batchSelected", ctx.selectedRowKeys.length)}
              </span>
              <Button size="sm" onClick={() => applyBatch("idle", ctx)}>
                {copy("batchOnDuty")}
              </Button>
              <Button size="sm" variant="outline" onClick={() => applyBatch("leave", ctx)}>
                {copy("batchLeave")}
              </Button>
            </div>
          )}
          search={{
            fields: [
              { name: "kw", label: copy("kw"), placeholder: copy("kwPlaceholder") },
              {
                name: "department",
                label: copy("department"),
                type: "select",
                options: [
                  { value: "all", label: copy("allDepartments") },
                  ...state.departments.map((department) => ({
                    value: department.id,
                    label: department.name,
                  })),
                ],
              },
              {
                name: "status",
                label: copy("status"),
                type: "select",
                options: [
                  { value: "all", label: copy("allStatuses") },
                  ...STATUS_ORDER.map((status) => ({
                    value: status,
                    label: STATUS_LABEL[status],
                  })),
                ],
              },
            ],
            values: filter,
            onChange: applyFilter,
            onSearch: applyFilter,
            onReset: applyFilter,
          }}
          pagination={{
            page,
            pageSize: PAGE_SIZE,
            total: filtered.length,
            onPageChange: setPage,
          }}
        />
      )}

      <PersonDrawer
        personId={drawerPersonId}
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
      />
    </div>
  );
}
