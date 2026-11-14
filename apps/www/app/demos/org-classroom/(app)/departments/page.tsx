"use client";
import { copy } from "./page.content";

import { useMemo, useState } from "react";
import { Plus } from "lucide-react";
import {
  Alert,
  Button,
  Card,
  CardBody,
  CardHeader,
  Empty,
  Field,
  Input,
  Meter,
  ModalForm,
  Popconfirm,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  Skeleton,
  Text,
  toast,
  useForm,
} from "@hulianui/ui";
import { sleep } from "../../../lib/async";
import { useOrg } from "../../_lib/org-store";
import { ACCENT_COLORS } from "../../_data/org";
import type { DepartmentRecord } from "../../_data/types";
import { FACING_LABEL } from "../../_lib/labels";

type DepartmentForm = {
  name: string;
  floor: string;
  leadId: string;
  accent: string;
  facing: DepartmentRecord["facing"];
};

const FACINGS = ["up", "right", "down", "left"] as const;

export default function OrgClassroomDepartmentsPage() {
  const {
    state,
    loading,
    error,
    reload,
    peopleById,
    updateDepartment,
    addDepartment,
    removeDepartment,
  } = useOrg();

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<DepartmentRecord | null>(null);

  const form = useForm<DepartmentForm>({
    initialValues: {
      name: "",
      floor: "",
      leadId: "",
      accent: ACCENT_COLORS[0],
      facing: "down",
    },
  });
  const name = form.register("name", {
    rules: [{ required: true, message: copy("nameRequired") }],
  });
  const floor = form.register("floor");
  const lead = form.register("leadId");
  const accent = form.register("accent");
  const facing = form.register("facing");

  const accentOptions = useMemo(
    () => [
      { value: ACCENT_COLORS[0], label: copy("accentPrimary") },
      { value: ACCENT_COLORS[1], label: copy("accentInfo") },
      { value: ACCENT_COLORS[2], label: copy("accentSuccess") },
      { value: ACCENT_COLORS[3], label: copy("accentWarning") },
      { value: ACCENT_COLORS[4], label: copy("accentDanger") },
    ],
    [],
  );

  const openCreate = () => {
    setEditing(null);
    form.resetFields();
    form.setFieldsValue(
      { name: "", floor: "", leadId: "", accent: ACCENT_COLORS[0], facing: "down" },
      { markPristine: true },
    );
    setFormOpen(true);
  };

  const openEdit = (department: DepartmentRecord) => {
    setEditing(department);
    form.resetFields();
    form.setFieldsValue(
      {
        name: department.name,
        floor: department.floor,
        leadId: department.leadId,
        accent: department.accent,
        facing: department.facing,
      },
      { markPristine: true },
    );
    setFormOpen(true);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-foreground">{copy("title")}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{copy("subtitle")}</p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="size-4" />
          {copy("addDepartment")}
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
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 3 }, (_, index) => (
            <Skeleton key={index} className="h-56 w-full" shape="rect" />
          ))}
        </div>
      ) : state.departments.length === 0 ? (
        <Empty title={copy("emptyTitle")} description={copy("emptyDesc")}>
          <Button onClick={openCreate}>{copy("addDepartment")}</Button>
        </Empty>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {state.departments.map((department) => {
            const seats = state.seats.filter((seat) => seat.departmentId === department.id);
            const occupied = seats.filter((seat) => seat.personId).length;
            const members = state.people.filter(
              (person) => person.departmentId === department.id,
            ).length;
            const leadPerson = department.leadId
              ? peopleById.get(department.leadId)
              : undefined;
            return (
              <Card key={department.id}>
                <CardHeader
                  title={
                    <span className="inline-flex items-center gap-2">
                      <span
                        aria-hidden
                        className="size-3 rounded-full"
                        style={{ backgroundColor: department.accent }}
                      />
                      {department.name}
                    </span>
                  }
                  extra={
                    <Button variant="ghost" size="sm" onClick={() => openEdit(department)}>
                      {copy("edit")}
                    </Button>
                  }
                />
                <CardBody className="flex flex-col gap-3">
                  <div className="text-sm text-muted-foreground">
                    {department.floor} · {FACING_LABEL[department.facing]} ·{" "}
                    {leadPerson?.name ?? copy("noLead")}
                  </div>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
                    <span>{copy("members", members)}</span>
                    <span>{copy("seats", seats.length)}</span>
                  </div>
                  <Meter
                    value={occupied}
                    max={Math.max(seats.length, 1)}
                    showValue
                    label={department.name}
                    formatValue={({ value, max }) =>
                      copy("occupancy", max > 0 ? Math.round((value / max) * 100) : 0)
                    }
                    className="w-full"
                  />
                  {members > 0 ? (
                    <div className="flex flex-col gap-1">
                      <Button variant="outline" size="sm" tone="danger" className="w-fit" disabled>
                        {copy("remove")}
                      </Button>
                      <Text size="xs" tone="muted">
                        {copy("removeBlocked")}
                      </Text>
                    </div>
                  ) : (
                    <Popconfirm
                      danger
                      title={copy("removeTitle", department.name)}
                      description={copy("removeDesc")}
                      okText={copy("remove")}
                      onConfirm={async () => {
                        await sleep(400);
                        removeDepartment(department.id);
                        toast({
                          tone: "success",
                          title: copy("removedToast"),
                          description: copy("removedToastDesc", department.name),
                        });
                      }}
                    >
                      <Button variant="outline" size="sm" tone="danger" className="w-fit">
                        {copy("remove")}
                      </Button>
                    </Popconfirm>
                  )}
                </CardBody>
              </Card>
            );
          })}
        </div>
      )}

      <ModalForm
        title={editing ? copy("editDepartment") : copy("addDepartment")}
        open={formOpen}
        onOpenChange={setFormOpen}
        form={form}
        submitText={copy("save")}
        className="w-[520px]"
        onFinish={(values) => {
          const data = values as DepartmentForm;
          const payload = {
            name: data.name.trim(),
            floor: data.floor.trim(),
            leadId: data.leadId,
            accent: data.accent,
            facing: data.facing,
          };
          if (editing) {
            updateDepartment(editing.id, payload);
            toast({
              tone: "success",
              title: copy("updatedToast"),
              description: copy("updatedToastDesc", payload.name),
            });
          } else {
            addDepartment(payload);
            toast({
              tone: "success",
              title: copy("createdToast"),
              description: copy("createdToastDesc", payload.name),
            });
          }
          return true;
        }}
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label={copy("name")} error={name.error} required>
            <Input
              value={name.value as string}
              onChange={name.onChange}
              onBlur={name.onBlur}
              placeholder={copy("namePlaceholder")}
            />
          </Field>
          <Field label={copy("floor")} error={floor.error}>
            <Input
              value={floor.value as string}
              onChange={floor.onChange}
              onBlur={floor.onBlur}
              placeholder={copy("floorPlaceholder")}
            />
          </Field>
          <Field label={copy("lead")} error={lead.error}>
            <Select
              searchable
              items={state.people.map((person) => ({
                value: person.id,
                label: person.name,
              }))}
              value={(lead.value as string) || null}
              placeholder={copy("leadPlaceholder")}
              onValueChange={(value) => lead.onChange(value ?? "")}
            >
              <SelectTrigger aria-label={copy("lead")} />
              <SelectContent>
                {state.people.map((person) => (
                  <SelectItem key={person.id} value={person.id}>
                    {person.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field label={copy("accent")} error={accent.error}>
            <Select
              items={accentOptions}
              value={(accent.value as string) || null}
              onValueChange={(value) => accent.onChange(value ?? "")}
            >
              <SelectTrigger aria-label={copy("accent")} />
              <SelectContent>
                {accentOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    <span className="inline-flex items-center gap-2">
                      <span
                        aria-hidden
                        className="size-2.5 rounded-full"
                        style={{ backgroundColor: option.value }}
                      />
                      {option.label}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field label={copy("facing")} error={facing.error}>
            <Select
              items={FACINGS.map((item) => ({ value: item, label: FACING_LABEL[item] }))}
              value={(facing.value as string) || null}
              onValueChange={(value) => facing.onChange(value ?? "")}
            >
              <SelectTrigger aria-label={copy("facing")} />
              <SelectContent>
                {FACINGS.map((item) => (
                  <SelectItem key={item} value={item}>
                    {FACING_LABEL[item]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
        </div>
      </ModalForm>
    </div>
  );
}
