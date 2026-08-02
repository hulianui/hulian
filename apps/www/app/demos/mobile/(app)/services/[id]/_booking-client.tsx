"use client";
import { copy } from "./_booking-client.content";
import { useState } from "react";
import { Avatar, Divider, Picker, Rating, Tag, toast } from "@hulianui/ui";
import {
  SERVICE_CATEGORY_LABELS,
  SERVICE_TAG_LABELS,
  SERVICE_TAG_TONES,
  type ServiceWithCover,
} from "../../../_data/services";

// Stepper 组件（简单实现，NumberField 替代）
function Stepper({ value, onChange, min = 1, max = 10 }: { value: number; onChange: (v: number) => void; min?: number; max?: number }) {
  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
        className="flex size-8 items-center justify-center rounded-full border border-border text-lg font-medium disabled:opacity-30 hover:bg-surface-hover"
      >
        −
      </button>
      <span className="min-w-[2ch] text-center text-sm font-semibold tabular-nums">{value}</span>
      <button
        type="button"
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
        className="flex size-8 items-center justify-center rounded-full border border-border text-lg font-medium disabled:opacity-30 hover:bg-surface-hover"
      >
        +
      </button>
    </div>
  );
}

// 预约时间 Picker 数据（确定性，不用 Date.now）
const DATE_OPTIONS = [
  { label: copy("today0604"), value: "0604" },
  { label: copy("tomorrow0605"), value: "0605" },
  { label: copy("inTwoDays0606"), value: "0606" },
  { label: copy("saturday0607"), value: "0607" },
  { label: copy("sunday0608"), value: "0608" },
];
const TIME_OPTIONS = [
  { label: "09:00–11:00", value: "09" },
  { label: "10:00–12:00", value: "10" },
  { label: "14:00–16:00", value: "14" },
  { label: "15:00–17:00", value: "15" },
  { label: "18:00–20:00", value: "18" },
];

/** 服务详情 + 下单 client 子组件（接受 server 传入的 service 数据） */
export function BookingClient({ service }: { service: ServiceWithCover }) {
  const [qty, setQty] = useState(1);
  const [pickerVal, setPickerVal] = useState(["0604", "14"]);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [booked, setBooked] = useState(false);

  const selectedDate = DATE_OPTIONS.find((d) => d.value === pickerVal[0])?.label ?? pickerVal[0];
  const selectedTime = TIME_OPTIONS.find((t) => t.value === pickerVal[1])?.label ?? pickerVal[1];

  const handleOrder = async () => {
    setBooked(false);
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 700));
    setSubmitting(false);
    setBooked(true);
    toast({ title: `${copy("booked")}${service.title}`, description: `${selectedDate} ${selectedTime}${copy("professionalArrives")}`, tone: "neutral" });
  };

  return (
    <div className="h-full overflow-y-auto">
      {/* 封面 */}
      <div className="relative h-40 overflow-hidden">
        <img src={service.cover} alt={service.title} className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
        <div className="absolute bottom-3 left-4 right-4 flex items-end justify-between">
          <div>
            <h1 className="text-base font-bold text-white">{service.title}</h1>
            <div className="mt-0.5 flex items-center gap-1.5">
              <Rating value={service.rating} readOnly size="sm" className="[--rating-color:hsl(var(--color-warning))]" />
              <span className="text-xs text-white/85">{service.rating} · {service.reviewCount}  {copy("reviews")}</span>
            </div>
          </div>
          <Tag tone={SERVICE_TAG_TONES[service.tag]} size="sm">{SERVICE_TAG_LABELS[service.tag]}</Tag>
        </div>
      </div>

      {/* 师傅信息 */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
        <Avatar fallback={service.workerAvatar} size="md" />
        <div className="flex-1">
          <div className="text-sm font-medium">{service.workerName}</div>
          <div className="text-xs text-muted mt-0.5">{SERVICE_CATEGORY_LABELS[service.category]} {copy("verifiedProfessional")}</div>
        </div>
        <button
          type="button"
          onClick={() => toast({ title: `${copy("calling")}${service.workerName}${copy("calling2")}`, tone: "info" })}
          className="flex size-9 items-center justify-center rounded-full border border-border hover:bg-surface-hover"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} width="16" height="16" aria-hidden>
            <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81 19.79 19.79 0 01.98 1.18 2 2 0 012.96 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L7.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" />
          </svg>
        </button>
      </div>

      {/* 服务说明 */}
      <div className="px-4 py-3 border-b border-border">
        <div className="text-sm font-semibold mb-1.5">{copy("serviceDetails")}</div>
        <p className="text-xs text-muted leading-relaxed">{service.description}</p>
      </div>

      {/* 预约时间（Picker 触发） */}
      <div className="px-4 py-3 border-b border-border">
        <div className="mb-2 text-sm font-semibold">{copy("appointmentTime")}</div>
        <button
          type="button"
          onClick={() => setPickerOpen(true)}
          className="flex w-full items-center justify-between rounded-xl border border-border bg-surface-hover px-3 py-2.5 hover:bg-surface"
        >
          <span className="text-sm">{selectedDate} {selectedTime}</span>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} width="14" height="14" className="text-muted" aria-hidden>
            <path d="M9 18l6-6-6-6" />
          </svg>
        </button>

        {/* 展开式 Picker（贴预约区内联展开，不弹外层）*/}
        {pickerOpen && (
          <div className="mt-2">
            <Picker
              columns={[
                { options: DATE_OPTIONS, flex: 3 },
                { options: TIME_OPTIONS, flex: 2 },
              ]}
              value={pickerVal}
              onChange={(v) => setPickerVal(v)}
              visibleCount={3}
              itemHeight={40}
            />
            <div className="mt-2 flex gap-2">
              <button
                type="button"
                onClick={() => setPickerOpen(false)}
                className="flex-1 rounded-xl border border-border py-2 text-sm hover:bg-surface-hover"
              >

                {copy("cancel")}
              </button>
              <button
                type="button"
                onClick={() => {
                  setPickerOpen(false);
                  toast({ title: `${copy("selectedAppointment")}${selectedDate} ${selectedTime}`, tone: "neutral" });
                }}
                className="flex-1 rounded-xl bg-primary py-2 text-sm text-primary-foreground hover:brightness-105"
              >

                {copy("confirm")}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 数量/时长 Stepper */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <span className="text-sm font-semibold">{copy("quantity")}</span>
        <Stepper value={qty} onChange={setQty} min={1} max={5} />
      </div>

      <Divider className="mx-4" />

      {/* 底部下单栏 */}
      <div className="px-4 py-3">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs text-muted">{copy("total")}</span>
          <span className="text-xl font-bold text-primary">
            ¥{service.price * qty}
            <span className="text-xs font-normal text-muted"> · {qty}{service.unit}</span>
          </span>
        </div>
        <button
          type="button"
          onClick={handleOrder}
          disabled={submitting}
          className="w-full rounded-2xl bg-primary py-3.5 text-base font-semibold text-primary-foreground hover:brightness-105 disabled:opacity-60 transition-all"
        >
          {submitting ? copy("booking") : copy("bookNow")}
        </button>
        {booked && (
          <p role="status" className="mt-2 text-center text-sm font-medium text-success">
            {copy("booked")}: {service.title}
          </p>
        )}
      </div>
    </div>
  );
}
