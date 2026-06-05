"use client";
import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Avatar,
  Button,
  Calendar,
  Card,
  Checkbox,
  DateRangePicker,
  Drawer,
  DrawerContent,
  Empty,
  DatePicker,
  Popconfirm,
  Scheduler,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  Skeleton,
  Stat,
  Tag,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  dayjs,
  startOfWeekISO,
  toast,
  type DateRangeValue,
  type SchedulerEvent,
  type SchedulerSlot,
  type SchedulerView,
} from "@hulian/ui";
import { CalendarPlus, RotateCw } from "lucide-react";
import {
  buildAppointments,
  buildLeave,
  DOCTORS,
  TYPE_TONE,
  type ApptType,
  type ClinicAppt,
} from "../_data/clinic";
import { AppointmentForm, type ApptFormValue } from "./appointment-form";
import { useMockData, usePending } from "../../lib/async";

const DAY_START = 8;
const DAY_END = 20;

const TONE_TO_TAG = {
  primary: "brand",
  success: "success",
  warning: "warning",
  danger: "danger",
  neutral: "neutral",
} as const;

/** TimeField 回吐的 ISO 时间 → 把其 时:分 套到 startISO 的同一天；保证 end>start。 */
function combineEnd(startISO: string, endISO: string): string {
  const s = dayjs(startISO);
  const e = dayjs(endISO);
  let end = s.hour(e.hour()).minute(e.minute()).second(0).millisecond(0);
  if (!end.isAfter(s)) end = s.add(30, "minute");
  return end.format("YYYY-MM-DDTHH:mm:ss");
}

export function SchedulerShell() {
  const todayISO = useMemo(() => dayjs().format("YYYY-MM-DD"), []);
  const monday = useMemo(() => startOfWeekISO(todayISO), [todayISO]);

  // 首屏加载态：seed 延迟返回 + 故意失败一次演示重试
  const seed = useMemo(() => buildAppointments(monday), [monday]);
  const { data, loading, error, reload } = useMockData(seed, { failOnce: true });

  const [rows, setRows] = useState<ClinicAppt[]>([]);
  useEffect(() => {
    if (data) setRows(data);
  }, [data]);

  const [view, setView] = useState<SchedulerView>("week");
  const [date, setDate] = useState(todayISO);
  const [visibleDocs, setVisibleDocs] = useState<Set<string>>(() => new Set(DOCTORS.map((d) => d.id)));

  // 表单
  const [formOpen, setFormOpen] = useState(false);
  const [slot, setSlot] = useState<SchedulerSlot | undefined>();
  const [editing, setEditing] = useState<ClinicAppt | null>(null);
  const [, run] = usePending();

  // 详情抽屉
  const [detail, setDetail] = useState<ClinicAppt | null>(null);

  // 停诊登记
  const [leaveDoctor, setLeaveDoctor] = useState(DOCTORS[0].id);
  const [leaveRange, setLeaveRange] = useState<DateRangeValue | null>(null);

  const visibleEvents = useMemo(
    () => rows.filter((r) => visibleDocs.has(r.doctorId)),
    [rows, visibleDocs],
  );

  // 统计
  const todayCount = useMemo(
    () => rows.filter((r) => dayjs(r.start).format("YYYY-MM-DD") === todayISO && r.type !== "停诊").length,
    [rows, todayISO],
  );
  const utilization = useMemo(() => {
    // 本周已约号源（半小时为一号源）/ 总号源（医生数 × 工作时长 × 2 × 5 天）
    const booked = rows.filter((r) => r.type !== "停诊").length;
    const capacity = DOCTORS.length * (DAY_END - DAY_START) * 5; // 粗估
    return Math.min(Math.round((booked / capacity) * 100), 100);
  }, [rows]);

  const toggleDoc = (id: string) =>
    setVisibleDocs((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const openCreate = (s?: SchedulerSlot) => {
    setEditing(null);
    setSlot(s ?? {
      start: dayjs(date).hour(9).minute(0).second(0).format("YYYY-MM-DDTHH:mm:ss"),
      end: dayjs(date).hour(9).minute(30).second(0).format("YYYY-MM-DDTHH:mm:ss"),
    });
    setFormOpen(true);
  };

  const handleSubmit = (v: ApptFormValue) =>
    run(() => {
      const end = combineEnd(v.start, v.end);
      const doc = DOCTORS.find((d) => d.id === v.doctorId);
      if (editing) {
        setRows((rs) =>
          rs.map((r) =>
            r.id === editing.id
              ? {
                  ...r,
                  patient: v.patient,
                  doctorId: v.doctorId,
                  resourceId: v.doctorId,
                  type: v.type as ApptType,
                  room: v.room,
                  title: `${v.type} · ${v.patient}`,
                  tone: TYPE_TONE[v.type as ApptType],
                  subtitle: doc?.dept,
                  start: v.start,
                  end,
                }
              : r,
          ),
        );
        toast({ title: "预约已更新", description: `${v.patient} · ${dayjs(v.start).format("M/D HH:mm")}`, tone: "info" });
      } else {
        const appt: ClinicAppt = {
          id: `n-${Date.now()}`,
          title: `${v.type} · ${v.patient}`,
          start: v.start,
          end,
          resourceId: v.doctorId,
          doctorId: v.doctorId,
          type: v.type as ApptType,
          patient: v.patient,
          room: v.room,
          tone: TYPE_TONE[v.type as ApptType],
          subtitle: doc?.dept,
        };
        setRows((rs) => [...rs, appt]);
        toast({ title: "已建预约", description: `${v.patient} · ${doc?.title} · ${dayjs(v.start).format("M/D HH:mm")}`, tone: "info" });
      }
      setFormOpen(false);
    });

  // 拖移/拖改时长回写
  const handleEventsChange = (next: SchedulerEvent[]) => {
    setRows(next as ClinicAppt[]);
    toast({ title: "预约已改期", tone: "info" });
  };

  const cancelAppt = (appt: ClinicAppt) => {
    setRows((rs) => rs.filter((r) => r.id !== appt.id));
    setDetail(null);
    toast({ title: "已取消预约", description: `${appt.patient}`, tone: "danger" });
  };

  const registerLeave = () =>
    run(() => {
      if (!leaveRange) {
        toast({ title: "请先选择停诊区间", tone: "danger" });
        return;
      }
      const [s, e] = leaveRange;
      const added = buildLeave(leaveDoctor, s, e, DAY_START, DAY_END);
      // 去重：同医生同日已登记则跳过
      setRows((rs) => {
        const ids = new Set(rs.map((r) => r.id));
        return [...rs, ...added.filter((a) => !ids.has(a.id))];
      });
      const doc = DOCTORS.find((d) => d.id === leaveDoctor);
      toast({ title: "已登记停诊", description: `${doc?.title} · ${s} ~ ${e}`, tone: "info" });
      setLeaveRange(null);
    });

  return (
    <div className="flex h-full min-h-0 gap-3 p-3">
      {/* 侧栏 */}
      <aside className="flex w-80 shrink-0 flex-col gap-3 overflow-y-auto">
        <Card className="p-2">
          <Calendar
            value={date}
            onValueChange={(iso) => iso && setDate(dayjs(iso).format("YYYY-MM-DD"))}
          />
        </Card>

        <Card className="flex flex-col gap-2 p-3">
          <span className="text-xs font-medium text-muted">跳转到某日（切日视图）</span>
          <DatePicker
            value={date}
            onValueChange={(iso) => {
              if (iso) {
                setDate(dayjs(iso).format("YYYY-MM-DD"));
                setView("day");
              }
            }}
            label="选择日期"
          />
        </Card>

        <Card className="flex flex-col gap-2 p-3">
          <span className="text-xs font-medium text-muted">医生</span>
          {DOCTORS.map((d) => (
            <label key={d.id} className="flex cursor-pointer items-center gap-2 text-sm">
              <Checkbox checked={visibleDocs.has(d.id)} onCheckedChange={() => toggleDoc(d.id)} />
              <Avatar fallback={d.title.slice(0, 1)} size="sm" />
              <span className="flex-1">{d.title}</span>
              <Tag tone="neutral" size="sm">
                {d.dept}
              </Tag>
            </label>
          ))}
        </Card>

        <Card className="flex flex-col gap-2 p-3">
          <span className="text-xs font-medium text-muted">停诊 / 请假登记</span>
          <Select
            items={DOCTORS.map((d) => ({ value: d.id, label: `${d.title} · ${d.dept}` }))}
            value={leaveDoctor}
            onValueChange={(v) => setLeaveDoctor(v as string)}
          >
            <SelectTrigger aria-label="选择停诊医生" />
            <SelectContent>
              {DOCTORS.map((d) => (
                <SelectItem key={d.id} value={d.id}>
                  {d.title} · {d.dept}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <DateRangePicker value={leaveRange} onValueChange={setLeaveRange} placeholder={["开始日", "结束日"]} />
          <Button size="sm" variant="outline" onClick={registerLeave}>
            登记停诊
          </Button>
        </Card>

        <div className="grid grid-cols-2 gap-3">
          <Card className="p-3">
            <Stat label="今日预约" value={todayCount} delta={12} deltaLabel="人次" />
          </Card>
          <Card className="p-3">
            <Stat label="利用率" value={`${utilization}%`} delta={utilization >= 50 ? 6 : -4} />
          </Card>
        </div>
      </aside>

      {/* 主区 */}
      <main className="flex min-h-0 min-w-0 flex-1 flex-col gap-3">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold tracking-tight">瀚约 · 诊所排班台</h1>
            <p className="text-xs text-muted">拖空白建预约 · 拖事件改期 · 拖下缘改时长</p>
          </div>
          <div className="flex items-center gap-1.5">
            <Tooltip>
              <TooltipTrigger
                render={
                  <Button variant="ghost" size="icon" aria-label="刷新排班" onClick={reload}>
                    <RotateCw className="size-4" />
                  </Button>
                }
              />
              <TooltipContent>刷新排班</TooltipContent>
            </Tooltip>
            <Button onClick={() => openCreate()}>
              <CalendarPlus className="size-4" /> 新建预约
            </Button>
          </div>
        </div>

        {error ? (
          <Alert tone="danger" className="flex items-center justify-between">
            <span>{error}</span>
            <Button size="sm" variant="ghost" onClick={reload}>
              重试
            </Button>
          </Alert>
        ) : loading ? (
          <Card className="flex-1 p-4">
            <Skeleton className="mb-3 h-10 w-full" />
            <div className="grid grid-cols-7 gap-2">
              {Array.from({ length: 28 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          </Card>
        ) : visibleDocs.size === 0 ? (
          <Card className="flex flex-1 items-center justify-center">
            <Empty title="未选择医生" description="在左侧勾选至少一名医生以查看其排班。" />
          </Card>
        ) : (
          <Scheduler
            className="min-h-0 flex-1"
            events={visibleEvents}
            view={view}
            date={date}
            resources={DOCTORS.filter((d) => visibleDocs.has(d.id))}
            onViewChange={setView}
            onDateChange={setDate}
            onEventsChange={handleEventsChange}
            onSlotDragCreate={openCreate}
            onSlotClick={openCreate}
            onEventClick={(ev) => setDetail(ev as ClinicAppt)}
            dayStartHour={DAY_START}
            dayEndHour={DAY_END}
          />
        )}
      </main>

      {/* 新建/编辑表单 */}
      <AppointmentForm
        open={formOpen}
        onOpenChange={setFormOpen}
        slot={slot}
        editing={editing}
        onSubmit={handleSubmit}
      />

      {/* 详情抽屉 */}
      <Drawer open={detail !== null} onOpenChange={(o) => !o && setDetail(null)}>
        <DrawerContent side="right" title={detail ? detail.title : ""} className="w-[min(420px,92vw)]">
          {detail && <DetailBody appt={detail} onEdit={() => { setEditing(detail); setSlot(undefined); setDetail(null); setFormOpen(true); }} onCancel={() => cancelAppt(detail)} />}
        </DrawerContent>
      </Drawer>
    </div>
  );
}

function DetailBody({
  appt,
  onEdit,
  onCancel,
}: {
  appt: ClinicAppt;
  onEdit: () => void;
  onCancel: () => void;
}) {
  const doc = DOCTORS.find((d) => d.id === appt.doctorId);
  const rows: [string, string][] = [
    ["患者", appt.patient],
    ["类型", appt.type],
    ["医生", `${doc?.title ?? "—"} · ${doc?.dept ?? ""}`],
    ["诊室", appt.room ?? "—"],
    ["时间", `${dayjs(appt.start).format("M月D日 HH:mm")} – ${dayjs(appt.end).format("HH:mm")}`],
  ];
  return (
    <div className="flex flex-col gap-4 p-1">
      <div className="flex items-center gap-2">
        <Tag tone={TONE_TO_TAG[appt.tone ?? "primary"]} size="sm">
          {appt.type}
        </Tag>
      </div>
      <dl className="flex flex-col gap-2 text-sm">
        {rows.map(([k, v]) => (
          <div key={k} className="flex justify-between gap-3">
            <dt className="shrink-0 text-muted">{k}</dt>
            <dd className="text-right">{v}</dd>
          </div>
        ))}
      </dl>
      <div className="mt-2 flex items-center justify-end gap-2">
        {appt.type !== "停诊" && (
          <Button variant="outline" size="sm" onClick={onEdit}>
            编辑
          </Button>
        )}
        <Popconfirm
          title="取消该预约？"
          description="取消后号源释放（demo 内存态，刷新还原）。"
          danger
          okText="取消预约"
          cancelText="再想想"
          onConfirm={onCancel}
        >
          <Button variant="outline" size="sm" tone="danger">
            取消预约
          </Button>
        </Popconfirm>
      </div>
    </div>
  );
}
