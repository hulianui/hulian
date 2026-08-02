"use client";
import { copy } from "./appointment-form.content";
import { useEffect } from "react";
import {
  Combobox,
  ComboboxContent,
  ComboboxItem,
  ComboboxTrigger,
  Field,
  ModalForm,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  DateTimePicker,
  TimeField,
  useForm,
  type ComboboxItemData,
  type FormValues,
} from "@hulianui/ui";
import { DOCTORS, PATIENTS, ROOMS, type ApptType, type ClinicAppt } from "../_data/clinic";

const TYPES: ApptType[] = ["初诊", "复诊", "检查", "处置"];
const TYPE_LABELS: Record<ApptType, string> = {
  初诊: copy("initialConsultation"),
  复诊: copy("revisit"),
  检查: copy("check"),
  处置: copy("disposal"),
  停诊: copy("disposal"),
};

const PATIENT_ITEMS: ComboboxItemData[] = PATIENTS.map((p) => ({
  value: p.name,
  label: `${p.name} · ${p.phone}`,
}));

export type ApptFormValue = {
  patient: string;
  doctorId: string;
  room: string;
  type: string;
  start: string;
  end: string;
};

interface AppointmentFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** 新建时的初始时段（点格/拖建回吐）。 */
  slot?: { start: string; end: string; resourceId?: string };
  /** 编辑时的既有预约。 */
  editing?: ClinicAppt | null;
  onSubmit: (v: ApptFormValue) => void | Promise<void>;
}

export function AppointmentForm({
  open,
  onOpenChange,
  slot,
  editing,
  onSubmit,
}: AppointmentFormProps) {
  const form = useForm<ApptFormValue>({
    initialValues: {
      patient: "",
      doctorId: DOCTORS[0].id,
      room: ROOMS[0],
      type: "初诊",
      start: "",
      end: "",
    },
  });

  // 打开时按 编辑/新建 灌值
  useEffect(() => {
    if (!open) return;
    if (editing) {
      form.setFieldsValue({
        patient: editing.patient,
        doctorId: editing.doctorId,
        room:
          editing.subtitle && ROOMS.includes(editing.subtitle as (typeof ROOMS)[number])
            ? editing.subtitle
            : ROOMS[0],
        type: editing.type,
        start: editing.start,
        end: editing.end,
      });
    } else if (slot) {
      form.setFieldsValue({
        patient: "",
        doctorId: slot.resourceId ?? DOCTORS[0].id,
        room: ROOMS[0],
        type: "初诊",
        start: slot.start,
        end: slot.end,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, editing, slot]);

  const patient = form.register("patient", {
    rules: [{ required: true, message: copy("pleaseSelectPatient") }],
  });
  const doctorId = form.register("doctorId");
  const room = form.register("room");
  const type = form.register("type");
  const start = form.register("start", {
    rules: [{ required: true, message: copy("pleaseSelectAStartTime") }],
  });
  const end = form.register("end", {
    rules: [{ required: true, message: copy("pleaseSelectAnEndTime") }],
  });

  const handleFinish = (v: FormValues) => onSubmit(v as ApptFormValue);

  return (
    <ModalForm
      title={editing ? copy("editAppointment") : copy("newAppointment")}
      form={form}
      open={open}
      onOpenChange={onOpenChange}
      onFinish={handleFinish}
      submitText={editing ? copy("save") : copy("buildAppointment")}
      className="w-[520px]"
    >
      <div className="grid grid-cols-2 gap-x-4">
        <Field label={copy("patient")} className="col-span-2" error={patient.error}>
          <Combobox
            items={PATIENT_ITEMS}
            value={PATIENT_ITEMS.find((p) => p.value === patient.value) ?? undefined}
            onValueChange={(item) => patient.onChange((item?.value as string) ?? "")}
          >
            <ComboboxTrigger placeholder={copy("searchSelectPatients")} className="w-full" />
            <ComboboxContent searchPlaceholder={copy("searchForPatientNamePhone")}>
              {(item) => (
                <ComboboxItem key={item.value} value={item}>
                  {item.label}
                </ComboboxItem>
              )}
            </ComboboxContent>
          </Combobox>
        </Field>

        <Field label={copy("attendingPhysician")}>
          <PlainSelect
            value={doctorId.value as string}
            onChange={doctorId.onChange}
            options={DOCTORS.map((d) => ({ value: d.id, label: `${d.title} · ${d.dept}` }))}
          />
        </Field>
        <Field label={copy("clinic")}>
          <PlainSelect
            value={room.value as string}
            onChange={room.onChange}
            options={ROOMS.map((r) => ({ value: r, label: r }))}
          />
        </Field>

        <Field label={copy("appointmentType")} className="col-span-2">
          <PlainSelect
            value={type.value as string}
            onChange={type.onChange}
            options={TYPES.map((t) => ({ value: t, label: TYPE_LABELS[t] }))}
          />
        </Field>

        <Field label={copy("visitStartTime")} error={start.error}>
          <DateTimePicker
            value={(start.value as string) || null}
            onValueChange={(iso) => start.onChange(iso ?? "")}
            minuteStep={5}
          />
        </Field>
        <Field label={copy("endTime")} error={end.error}>
          <TimeField
            value={(end.value as string) || null}
            onValueChange={(iso) => end.onChange(iso ?? "")}
          />
        </Field>
      </div>
    </ModalForm>
  );
}

function PlainSelect({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <Select items={options} value={value} onValueChange={(v) => onChange(v as string)}>
      <SelectTrigger />
      <SelectContent>
        {options.map((o) => (
          <SelectItem key={o.value} value={o.value}>
            {o.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
