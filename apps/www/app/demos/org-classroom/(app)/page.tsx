"use client";
import { copy } from "./page.content";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { Armchair, CalendarClock, UserCheck, Users } from "lucide-react";
import {
  Alert,
  Avatar,
  BarChart,
  Button,
  Card,
  CardBody,
  CardHeader,
  Empty,
  PieChart,
  Skeleton,
  Stat,
  Tag,
} from "@hulianui/ui";
import type { SeatStatus } from "@hulianui/ui";
import { useOrg } from "../_lib/org-store";
import { DEMO_DAY } from "../_data/org";
import {
  INTERVIEW_STATUS_LABEL,
  INTERVIEW_STATUS_TONE,
  STAGE_LABEL,
  STATUS_COLOR,
  STATUS_LABEL,
  STATUS_ORDER,
} from "../_lib/labels";
import { ActivityFeed } from "../_components/activity-feed";
import { ROOT } from "../_components/nav-config";

type DeptDatum = { dept: string } & Record<SeatStatus, number>;

export default function OrgClassroomOverviewPage() {
  const router = useRouter();
  const { state, loading, error, reload, stats, peopleById } = useOrg();

  const chartData = useMemo<DeptDatum[]>(() => {
    return state.departments.map((department) => {
      const row: DeptDatum = {
        dept: department.name,
        idle: 0,
        busy: 0,
        meeting: 0,
        leave: 0,
        interview: 0,
      };
      for (const seat of state.seats) {
        if (seat.departmentId !== department.id || !seat.personId) continue;
        const person = peopleById.get(seat.personId);
        if (person) row[person.status] += 1;
      }
      return row;
    });
  }, [state.departments, state.seats, peopleById]);

  const todayInterviews = useMemo(
    () =>
      state.interviews
        .filter(
          (interview) =>
            interview.start.startsWith(DEMO_DAY) && interview.status !== "canceled",
        )
        .sort((a, b) => a.start.localeCompare(b.start)),
    [state.interviews],
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-xl font-semibold text-foreground">{copy("title")}</h1>
            <Tag tone="neutral" variant="outline" size="sm">
              {copy("weekLabel")}
            </Tag>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">{copy("subtitle")}</p>
        </div>
        <Button onClick={() => router.push(`${ROOT}/floor`)}>{copy("openFloor")}</Button>
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
          <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
            {Array.from({ length: 4 }, (_, index) => (
              <Skeleton key={index} className="h-32 w-full" shape="rect" />
            ))}
          </div>
          <Skeleton className="h-80 w-full" shape="rect" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
            <Stat
              label={copy("kpiPeople")}
              value={stats.totalPeople}
              hint={copy("kpiPeopleHint", stats.unassignedPeople)}
              tone="brand"
              icon={<Users className="size-4" />}
            />
            <Stat
              label={copy("kpiOnDuty")}
              value={stats.statusCounts.idle}
              delta={2}
              deltaLabel={copy("onDutyDeltaLabel")}
              tone="success"
              icon={<UserCheck className="size-4" />}
            />
            <Stat
              label={copy("kpiOccupancy")}
              value={`${stats.occupancy}%`}
              hint={copy("kpiOccupancyHint", stats.occupiedSeats, stats.totalSeats)}
              tone="info"
              icon={<Armchair className="size-4" />}
            />
            <Stat
              label={copy("kpiInterviews")}
              value={stats.todayInterviews}
              hint={copy("kpiInterviewsHint", stats.ongoingInterviews)}
              tone="warning"
              icon={<CalendarClock className="size-4" />}
            />
          </div>

          <div className="grid gap-4 xl:grid-cols-3">
            <Card className="xl:col-span-2">
              <CardHeader title={copy("deptChartTitle")} />
              <CardBody className="flex flex-col gap-2">
                <p className="text-sm text-muted-foreground">{copy("deptChartDesc")}</p>
                <BarChart
                  data={chartData}
                  xKey="dept"
                  stacked
                  legend="bottom"
                  height={280}
                  series={STATUS_ORDER.map((status) => ({
                    key: status,
                    label: STATUS_LABEL[status],
                    color: STATUS_COLOR[status],
                  }))}
                />
              </CardBody>
            </Card>

            <Card>
              <CardHeader
                title={copy("todayInterviews")}
                extra={
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => router.push(`${ROOT}/interviews`)}
                  >
                    {copy("viewAllInterviews")}
                  </Button>
                }
              />
              <CardBody className="flex flex-col gap-3">
                <p className="text-sm text-muted-foreground">{copy("todayInterviewsDesc")}</p>
                {todayInterviews.length === 0 ? (
                  <Empty size="sm" title={copy("noInterviews")} />
                ) : (
                  todayInterviews.map((interview) => {
                    const room = state.rooms.find((item) => item.id === interview.roomId);
                    const interviewer = peopleById.get(interview.interviewerId);
                    return (
                      <div key={interview.id} className="flex items-start gap-3">
                        <Avatar size="sm" fallback={interview.candidate.slice(0, 1)} />
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span className="text-sm font-medium text-foreground">
                              {interview.candidate}
                            </span>
                            <Tag tone="neutral" variant="outline" size="sm">
                              {STAGE_LABEL[interview.stage]}
                            </Tag>
                          </div>
                          <div className="mt-0.5 truncate text-xs text-muted-foreground">
                            {interview.start.slice(11, 16)} · {room?.name} ·{" "}
                            {interviewer?.name}
                          </div>
                        </div>
                        <Tag tone={INTERVIEW_STATUS_TONE[interview.status]} size="sm">
                          {INTERVIEW_STATUS_LABEL[interview.status]}
                        </Tag>
                      </div>
                    );
                  })
                )}
              </CardBody>
            </Card>
          </div>

          <div className="grid gap-4 xl:grid-cols-3">
            <Card className="xl:col-span-2">
              <CardHeader title={copy("recentActivity")} />
              <CardBody className="flex flex-col gap-3">
                <p className="text-sm text-muted-foreground">{copy("recentActivityDesc")}</p>
                <ActivityFeed items={state.activity} limit={8} />
              </CardBody>
            </Card>
            <Card>
              <CardHeader title={copy("statusDistribution")} />
              <CardBody className="flex flex-col gap-2">
                <p className="text-sm text-muted-foreground">
                  {copy("statusDistributionDesc")}
                </p>
                <PieChart
                  donut
                  height={260}
                  data={STATUS_ORDER.map((status) => ({
                    name: STATUS_LABEL[status],
                    value: stats.statusCounts[status],
                    color: STATUS_COLOR[status],
                  }))}
                />
              </CardBody>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
