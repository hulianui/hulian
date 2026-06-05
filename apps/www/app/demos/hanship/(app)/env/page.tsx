"use client";

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
  production: "生产",
  preview: "预览",
};

const filterItems = [
  { value: "all", label: "全部" },
  { value: "production", label: "生产" },
  { value: "preview", label: "预览" },
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
      rules: [{ required: true, message: "请输入变量名" }],
    }),
    value: form.register("value", {
      rules: [{ required: true, message: "请输入变量值" }],
    }),
    targets: form.register("targets", {
      rules: [{ required: true, message: "至少选择一个环境" }],
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
    toast({ tone: "danger", title: "变量已删除", description: v.key });
  };

  const targetValues = (reg.targets.value as string[] | undefined) ?? [];

  const columns: ColumnDef<EnvVar, unknown>[] = [
    {
      id: "key",
      header: "键",
      cell: ({ row }) => <span className="font-mono text-sm">{row.original.key}</span>,
    },
    {
      id: "value",
      header: "值",
      cell: ({ row }) => {
        const v = row.original;
        if (v.secret) {
          return (
            <SecretField
              value={v.value}
              readOnly
              size="sm"
              maskStrategy="prefix-suffix"
              onCopy={() => toast({ tone: "info", title: "已复制" })}
            />
          );
        }
        return (
          <button
            type="button"
            className="font-mono text-sm text-muted transition-colors hover:text-foreground"
            onClick={() => {
              void navigator.clipboard?.writeText(v.value);
              toast({ tone: "info", title: "已复制" });
            }}
            aria-label={`复制 ${v.key} 的值`}
          >
            {v.value}
          </button>
        );
      },
    },
    {
      id: "targets",
      header: "环境",
      cell: ({ row }) => (
        <div className="flex flex-wrap gap-1">
          {row.original.targets.map((t) => (
            <Tag key={t} tone="neutral" size="sm">
              {envLabel[t]}
            </Tag>
          ))}
        </div>
      ),
    },
    {
      id: "updated",
      header: "更新",
      cell: ({ row }) => (
        <RelativeTime value={agoDateDays(row.original.updatedAgoDays)} className="text-xs text-muted" />
      ),
    },
    {
      id: "actions",
      header: "操作",
      meta: { sticky: "right" },
      cell: ({ row }) => {
        const v = row.original;
        return (
          <div className="flex items-center justify-end">
            <Popconfirm
              title="删除该变量？"
              description={`${v.key} 将从所选环境中移除，下次部署生效。`}
              okText="删除"
              cancelText="取消"
              danger
              onConfirm={() => handleDelete(v)}
            >
              <Button variant="ghost" size="sm" tone="danger">
                删除
              </Button>
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
          <h1 className="text-lg font-semibold">环境变量</h1>
          <p className="text-sm text-muted">为生产与预览环境配置构建期 / 运行期变量，密文值加密存储。</p>
        </div>
        <Button onClick={() => setOpen(true)}>
          <Plus className="size-4" />
          新增变量
        </Button>
      </div>

      <Card>
        <CardHeader className="flex items-center justify-between">
          <span className="text-sm font-medium">变量列表</span>
          <Segmented
            items={filterItems}
            value={filter}
            onValueChange={setFilter}
            size="sm"
            aria-label="按环境筛选"
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
              title={filter === "all" ? "还没有环境变量" : "该环境下没有变量"}
              description={filter === "all" ? "新增变量后将在下次部署注入构建。" : "切换到「全部」查看其他环境的变量。"}
            >
              {filter === "all" ? (
                <Button onClick={() => setOpen(true)}>
                  <Plus className="size-4" />
                  新增变量
                </Button>
              ) : (
                <Button variant="outline" onClick={() => setFilter("all")}>
                  查看全部
                </Button>
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
        title="新增环境变量"
        form={form}
        open={open}
        onOpenChange={setOpen}
        submitText="保存"
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
          toast({ tone: "info", title: "变量已保存", description: `${fresh.key} 将在下次部署生效` });
        }}
      >
        <Field label="变量名" error={reg.key.error} description="如 DATABASE_URL">
          <Input
            value={String(reg.key.value ?? "")}
            onChange={(e) => reg.key.onChange(e.target.value)}
            onBlur={reg.key.onBlur}
            placeholder="DATABASE_URL"
          />
        </Field>
        <Field label="变量值" error={reg.value.error}>
          <Input
            value={String(reg.value.value ?? "")}
            onChange={(e) => reg.value.onChange(e.target.value)}
            onBlur={reg.value.onBlur}
            placeholder="postgres://…"
          />
        </Field>
        <Field label="环境" error={reg.targets.error} description="变量将注入所选环境">
          <CheckboxGroup
            value={targetValues}
            onValueChange={(val) => reg.targets.onChange(val)}
            orientation="horizontal"
            aria-label="目标环境"
          >
            <Checkbox value="production" label="生产" />
            <Checkbox value="preview" label="预览" />
          </CheckboxGroup>
        </Field>
        <Field label="密文" description="开启后值将被加密，列表中以掩码展示">
          <Switch
            checked={Boolean(reg.secret.value)}
            onCheckedChange={(c) => reg.secret.onChange(c)}
            aria-label="标记为密文"
          />
        </Field>
      </ModalForm>
    </div>
  );
}
