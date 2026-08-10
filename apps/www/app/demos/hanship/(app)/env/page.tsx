"use client";
import { copy } from "./page.content";
import { DEMO_RELATIVE_TIME_LOCALE } from "../../../_components/demo-locale";

import { useMemo, useState } from "react";
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Checkbox,
  CheckboxGroup,
  Empty,
  Field,
  Input,
  ModalForm,
  Popconfirm,
  RelativeTime,
  Segmented,
  SecretField,
  Skeleton,
  Switch,
  Table,
  Tag,
  toast,
  useForm,
} from "@hulianui/ui";
import type { ColumnDef } from "@hulianui/ui";
import { Plus } from "lucide-react";

import { envVars as seedEnvVars } from "../../_data/store";
import type { Environment, EnvVar } from "../../_data/types";
import { agoDateDays } from "../../_lib/format";
import { useMockData } from "../../../lib/async";

const envLabel: Record<Environment, string> = {
  production: copy("produce"),
  preview: copy("preview"),
};

const filterItems = [
  { value: "all", label: copy("all") },
  { value: "production", label: copy("produce2") },
  { value: "preview", label: copy("preview2") },
];

type AddEnvValues = {
  key: string;
  value: string;
  targets: string[];
  secret: boolean;
};

export default function EnvPage() {
  const { data, loading } = useMockData<EnvVar[]>(seedEnvVars);
  const [extra, setExtra] = useState<EnvVar[]>([]);
  const [removed, setRemoved] = useState<string[]>([]);
  const [filter, setFilter] = useState("all");
  const [open, setOpen] = useState(false);

  const form = useForm<AddEnvValues>({
    initialValues: { key: "", value: "", targets: ["production"], secret: false },
  });
  const reg = {
    key: form.register("key", {
      rules: [{ required: true, message: copy("pleaseEnterVariableName") }],
    }),
    value: form.register("value", {
      rules: [{ required: true, message: copy("pleaseEnterVariableValue") }],
    }),
    targets: form.register("targets", {
      rules: [{ required: true, message: copy("chooseAtLeastOneEnvironment") }],
    }),
    secret: form.register("secret"),
  };

  const rows = useMemo(() => {
    const base = data ?? [];
    const all = [...extra, ...base].filter((v) => !removed.includes(v.id));
    if (filter === "all") return all;
    return all.filter((v) => v.targets.includes(filter as Environment));
  }, [data, extra, removed, filter]);

  const handleDelete = (v: EnvVar) => {
    setRemoved((prev) => [...prev, v.id]);
    toast({ tone: "danger", title: copy("variableDeleted"), description: v.key });
  };

  const targetValues = (reg.targets.value as string[] | undefined) ?? [];

  const columns: ColumnDef<EnvVar, unknown>[] = [
    {
      id: "key",
      header: copy("key"),
      cell: ({ row }) => <span className="font-mono text-sm">{row.original.key}</span>,
    },
    {
      id: "value",
      header: copy("value"),
      cell: ({ row }) => {
        const v = row.original;
        if (v.secret) {
          return (
            <SecretField
              value={v.value}
              readOnly
              size="sm"
              maskStrategy="prefix-suffix"
              onCopy={() => toast({ tone: "info", title: copy("copied") })}
            />
          );
        }
        return (
          <button
            type="button"
            className="font-mono text-sm text-muted-foreground transition-colors hover:text-foreground"
            onClick={() => {
              void navigator.clipboard?.writeText(v.value);
              toast({ tone: "info", title: copy("copied2") });
            }}
            aria-label={copy("copyTheValueOfValue", v.key)}
          >
            {v.value}
          </button>
        );
      },
    },
    {
      id: "targets",
      header: copy("environment"),
      cell: ({ row }) => (
        <div className="flex flex-wrap gap-1">
          {row.original.targets.map((t) => (
            <Tag key={t} tone={t === "production" ? "success" : "warning"} size="sm">
              {envLabel[t]}
            </Tag>
          ))}
        </div>
      ),
    },
    {
      id: "updated",
      header: copy("update"),
      cell: ({ row }) => (
        <RelativeTime value={agoDateDays(row.original.updatedAgoDays)} locale={DEMO_RELATIVE_TIME_LOCALE} className="text-xs text-muted-foreground" />
      ),
    },
    {
      id: "actions",
      header: copy("operation"),
      meta: { sticky: "right" },
      cell: ({ row }) => {
        const v = row.original;
        return (
          <div className="flex items-center justify-end">
            <Popconfirm
              title={copy("deleteThisVariable")}
              description={copy("valueWillBeRemovedFromTheSelected", v.key)}
              okText={copy("delete")}
              cancelText={copy("cancel")}
              danger
              onConfirm={() => handleDelete(v)}
            >
              <Button variant="ghost" size="sm" tone="danger">{copy("delete2")}</Button>
            </Popconfirm>
          </div>
        );
      },
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold">{copy("environmentVariables")}</h1>
          <p className="text-sm text-muted-foreground">{copy("configureBuildRuntimeVariablesForProductionAnd")}</p>
        </div>
        <Button onClick={() => setOpen(true)}>
          <Plus className="size-4" />{copy("addNewVariable")}</Button>
      </div>

      <Card>
        <CardHeader className="flex items-center justify-between">
          <span className="text-sm font-medium">{copy("variableList")}</span>
          <Segmented
            items={filterItems}
            value={filter}
            onValueChange={setFilter}
            size="sm"
            aria-label={copy("filterByEnvironment")}
          />
        </CardHeader>
        <CardBody>
          {loading ? (
            <div className="flex flex-col gap-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-9 w-full" />
              ))}
            </div>
          ) : rows.length === 0 ? (
            <Empty
              title={filter === "all" ? copy("thereAreNoEnvironmentVariablesYet") : copy("thereAreNoVariablesInThisEnvironment")}
              description={filter === "all" ? copy("afterAddingTheVariableItWillBe") : copy("switchToAllToViewVariablesFrom")}
            >
              {filter === "all" ? (
                <Button onClick={() => setOpen(true)}>
                  <Plus className="size-4" />{copy("addNewVariable2")}</Button>
              ) : (
                <Button variant="outline" onClick={() => setFilter("all")}>{copy("viewAll")}</Button>
              )}
            </Empty>
          ) : (
            <Table<EnvVar>
              columns={columns}
              data={rows}
              enableSorting={false}
              getRowId={(v) => v.id}
            />
          )}
        </CardBody>
      </Card>

      <ModalForm
        title={copy("addEnvironmentVariables")}
        form={form}
        open={open}
        onOpenChange={setOpen}
        submitText={copy("save")}
        className="w-[520px]"
        onFinish={(values) => {
          const v = values as AddEnvValues;
          const fresh: EnvVar = {
            id: `env-new-${Date.now()}`,
            key: v.key.trim(),
            value: v.value,
            targets: (v.targets as Environment[]).length
              ? (v.targets as Environment[])
              : ["production"],
            secret: Boolean(v.secret),
            updatedAgoDays: 0,
          };
          setExtra((prev) => [fresh, ...prev]);
          form.resetFields();
          toast({ tone: "success", title: copy("variableSaved"), description: copy("valueWillTakeEffectInTheNext", fresh.key) });
        }}
      >
        <Field label={copy("variableName")} error={reg.key.error} description={copy("suchAsDatabaseUrl")}>
          <Input
            value={String(reg.key.value ?? "")}
            onChange={(e) => reg.key.onChange(e.target.value)}
            onBlur={reg.key.onBlur}
            placeholder="DATABASE_URL"
          />
        </Field>
        <Field label={copy("variableValue")} error={reg.value.error}>
          <Input
            value={String(reg.value.value ?? "")}
            onChange={(e) => reg.value.onChange(e.target.value)}
            onBlur={reg.value.onBlur}
            placeholder="postgres://…"
          />
        </Field>
        <Field label={copy("environment2")} error={reg.targets.error} description={copy("variablesWillBeInjectedIntoTheSelected")}>
          <CheckboxGroup
            value={targetValues}
            onValueChange={(val) => reg.targets.onChange(val)}
            orientation="horizontal"
            aria-label={copy("targetEnvironment")}
          >
            <Checkbox value="production" label={copy("produce3")} />
            <Checkbox value="preview" label={copy("preview3")} />
          </CheckboxGroup>
        </Field>
        <Field label={copy("ciphertext")} description={copy("whenTurnedOnTheValueWillBe")}>
          <Switch
            checked={Boolean(reg.secret.value)}
            onCheckedChange={(c) => reg.secret.onChange(c)}
            aria-label={copy("markAsRedacted")}
          />
        </Field>
      </ModalForm>
    </div>
  );
}
