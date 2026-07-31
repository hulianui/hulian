"use client";
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
  useForm,
  type ComboboxItemData,
  type FormValues,
} from "@hulianui/ui";
import {
  DateTimePicker,
  TimeField,
} from "@hulianui/ui/date-pickers";
import { DOCTORS, PATIENTS, ROOMS, type ApptType, type ClinicAppt } from "../_data/clinic";

const TYPES: ApptType[] = ["初诊", "复诊", "检查", "处置"];

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

export function AppointmentForm({ open, onOpenChange, slot, editing, onSubmit }: AppointmentFormProps) {
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
        room: editing.subtitle && ROOMS.includes(editing.subtitle as (typeof ROOMS)[number]) ? editing.subtitle : ROOMS[0],
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

  const patient = form.register("patient", { rules: [{ required: true, message: "请选择患者" }] });
  const doctorId = form.register("doctorId");
  const room = form.register("room");
  const type = form.register("type");
  const start = form.register("start", { rules: [{ required: true, message: "请选择起诊时间" }] });
  const end = form.register("end", { rules: [{ required: true, message: "请选择结束时间" }] });

  const handleFinish = (v: FormValues) => onSubmit(v as ApptFormValue);

  return (
    <ModalForm
      title={editing ? "编辑预约" : "新建预约"}
      form={form}
      open={open}
      onOpenChange={onOpenChange}
      onFinish={handleFinish}
      submitText={editing ? "保存" : "建预约"}
      className="w-[520px]"
    >
      <div className="grid grid-cols-2 gap-x-4">
        <Field label="患者" className="col-span-2" error={patient.error}>
          <Combobox
            items={PATIENT_ITEMS}
            value={PATIENT_ITEMS.find((p) => p.value === patient.value) ?? undefined}
            onValueChange={(item) => patient.onChange((item?.value as string) ?? "")}
          >
            <ComboboxTrigger placeholder="搜索 / 选择患者" className="w-full" />
            <ComboboxContent searchPlaceholder="搜索患者姓名 / 手机…">
              {(item) => (
                <ComboboxItem key={item.value} value={item}>
                  {item.label}
                </ComboboxItem>
              )}
            </ComboboxContent>
          </Combobox>
        </Field>

        <Field label="接诊医生">
          <PlainSelect value={doctorId.value as string} onChange={doctorId.onChange} options={DOCTORS.map((d) => ({ value: d.id, label: `${d.title} · ${d.dept}` }))} />
        </Field>
        <Field label="诊室">
          <PlainSelect value={room.value as string} onChange={room.onChange} options={ROOMS.map((r) => ({ value: r, label: r }))} />
        </Field>

        <Field label="预约类型" className="col-span-2">
          <PlainSelect value={type.value as string} onChange={type.onChange} options={TYPES.map((t) => ({ value: t, label: t }))} />
        </Field>

        <Field label="起诊时间" error={start.error}>
          <DateTimePicker
            value={(start.value as string) || null}
            onValueChange={(iso) => start.onChange(iso ?? "")}
            minutesStep={5}
          />
        </Field>
        <Field label="结束时间" error={end.error}>
          <TimeField value={(end.value as string) || null} onValueChange={(iso) => end.onChange(iso ?? "")} />
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
