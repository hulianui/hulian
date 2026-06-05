"use client";
import { useMemo, useState } from "react";
import { Ban, KeyRound, Plus, RotateCcw, ShieldCheck, TriangleAlert } from "lucide-react";
import {
  Banner,
  Button,
  Card,
  CardBody,
  CardHeader,
  Field,
  Input,
  Meter,
  ModalForm,
  NumberField,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SecretField,
  StatusDot,
  Switch,
  Table,
  Tag,
  toast,
  useForm,
} from "@hulian/ui";
import type { ColumnDef } from "@hulian/ui";
import { apiKeys as seedKeys, keyGroups } from "../../_data/keys";
import { models } from "../../_data/providers";
import type { ApiKey } from "../../_data/types";
import { formatUsd } from "../../_lib/pricing";

type KeyFormState = {
  name: string;
  group: string;
  limitUsd: number | null;
  rpm: number | null;
  expiresAt: string;
  scope: string; // "all" | modelId
};

const EMPTY: KeyFormState = {
  name: "",
  group: keyGroups[0],
  limitUsd: 500,
  rpm: 300,
  expiresAt: "",
  scope: "all",
};

// 生成 mock 密钥串。
function genSecret(): string {
  const hex = "0123456789abcdef";
  let body = "";
  for (let i = 0; i < 32; i++) body += hex[Math.floor(Math.random() * 16)];
  return `sk-hanhub-${body}`;
}

export default function KeysPage() {
  const [keys, setKeys] = useState<ApiKey[]>(seedKeys);
  const [open, setOpen] = useState(false);
  // 新建成功后一次性展示的完整密钥。
  const [created, setCreated] = useState<ApiKey | null>(null);

  const form = useForm<KeyFormState>({ initialValues: EMPTY });

  const reg = {
    name: form.register("name", { rules: [{ required: true, message: "请输入密钥名称" }] }),
    group: form.register("group"),
    limitUsd: form.register("limitUsd"),
    rpm: form.register("rpm", { rules: [{ required: true, message: "请设置限速" }] }),
    expiresAt: form.register("expiresAt"),
    scope: form.register("scope"),
  };

  const openCreate = () => {
    form.resetFields();
    setCreated(null);
    setOpen(true);
  };

  const handleFinish = (values: KeyFormState) => {
    const newKey: ApiKey = {
      id: `k${Date.now()}`,
      name: values.name.trim(),
      secret: genSecret(),
      group: values.group,
      status: "active",
      usedUsd: 0,
      limitUsd: values.limitUsd && values.limitUsd > 0 ? values.limitUsd : null,
      rpm: values.rpm ?? 60,
      createdAt: new Date().toISOString().slice(0, 10),
      expiresAt: values.expiresAt || null,
      allowedModels: values.scope === "all" ? [] : [values.scope],
    };
    setKeys((prev) => [newKey, ...prev]);
    setCreated(newKey);
    toast({ tone: "info", title: "密钥已创建", description: "请立即复制并妥善保存，完整密钥仅展示这一次。" });
  };

  const toggleStatus = (id: string) =>
    setKeys((prev) =>
      prev.map((k) => (k.id === id ? { ...k, status: k.status === "active" ? "disabled" : "active" } : k)),
    );

  const resetSecret = (id: string) => {
    const next = genSecret();
    setKeys((prev) => prev.map((k) => (k.id === id ? { ...k, secret: next } : k)));
    toast({ tone: "info", title: "密钥已重置", description: "旧密钥立即失效，请更新你的服务配置。" });
  };

  const revokeKey = (id: string) => {
    setKeys((prev) => prev.filter((k) => k.id !== id));
    toast({ tone: "danger", title: "密钥已吊销" });
  };

  const columns = useMemo<ColumnDef<ApiKey, unknown>[]>(
    () => [
      {
        accessorKey: "name",
        header: "名称 / 分组",
        cell: ({ row }) => {
          const k = row.original;
          return (
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="truncate font-medium text-foreground">{k.name}</span>
                <Tag size="sm" tone="neutral">
                  {k.group}
                </Tag>
              </div>
              <div className="mt-0.5 text-xs text-muted">
                创建 {k.createdAt}
                {k.expiresAt ? ` · 到期 ${k.expiresAt}` : " · 长期有效"}
                {k.allowedModels.length > 0 ? ` · 限 ${k.allowedModels.length} 个模型` : " · 全部模型"}
              </div>
            </div>
          );
        },
      },
      {
        id: "secret",
        header: "密钥",
        cell: ({ row }) => (
          <SecretField value={row.original.secret} size="sm" readOnly onCopy={() => toast({ tone: "info", title: "已复制密钥" })} />
        ),
      },
      {
        id: "usage",
        header: "本月用量",
        cell: ({ row }) => {
          const k = row.original;
          if (k.limitUsd == null) {
            return (
              <div className="text-sm">
                <span className="tabular-nums text-foreground">{formatUsd(k.usedUsd)}</span>
                <span className="text-muted"> / 不限</span>
              </div>
            );
          }
          const pct = Math.min(100, (k.usedUsd / k.limitUsd) * 100);
          return (
            <div className="w-40">
              <Meter value={pct} />
              <div className="mt-1 text-xs text-muted">
                <span className="tabular-nums text-foreground">{formatUsd(k.usedUsd)}</span> / {formatUsd(k.limitUsd)}
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: "rpm",
        header: "限速",
        cell: ({ row }) => <span className="tabular-nums text-sm">{row.original.rpm} RPM</span>,
      },
      {
        id: "status",
        header: "状态",
        cell: ({ row }) => {
          const k = row.original;
          return (
            <div className="flex items-center gap-2">
              <StatusDot status={k.status === "active" ? "online" : "offline"} />
              <Switch
                checked={k.status === "active"}
                onCheckedChange={() => toggleStatus(k.id)}
                aria-label={`启停 ${k.name}`}
              />
            </div>
          );
        },
      },
      {
        id: "actions",
        header: "操作",
        meta: { sticky: "right" },
        cell: ({ row }) => (
          <div className="flex justify-end gap-1">
            <Button size="sm" variant="ghost" onClick={() => resetSecret(row.original.id)}>
              <RotateCcw className="size-4" />
              重置
            </Button>
            <Button size="sm" variant="ghost" tone="danger" onClick={() => revokeKey(row.original.id)}>
              <Ban className="size-4" />
              吊销
            </Button>
          </div>
        ),
      },
    ],
    [],
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-foreground">API 密钥</h1>
          <p className="text-sm text-muted">用一把密钥访问全部上游模型 · 按分组管控限额与限速</p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="size-4" />
          新建密钥
        </Button>
      </div>

      {/* 新建成功：一次性展示完整密钥 */}
      {created && (
        <Banner
          tone="success"
          variant="soft"
          align="start"
          icon={<ShieldCheck className="size-4" />}
          onClose={() => setCreated(null)}
        >
          <div className="flex w-full flex-col gap-2">
            <div className="text-sm font-medium text-foreground">
              密钥「{created.name}」已创建 —— 完整密钥仅此一次展示，请立即复制保存。
            </div>
            <SecretField
              value={created.secret}
              revealed
              size="md"
              onCopy={() => toast({ tone: "info", title: "已复制完整密钥" })}
            />
            <div className="flex items-center gap-1.5 text-xs text-warning">
              <TriangleAlert className="size-3.5" />
              关闭此提示后将无法再次查看完整密钥，只能重置。
            </div>
          </div>
        </Banner>
      )}

      <Card>
        <CardHeader className="flex items-center gap-2 font-medium text-foreground">
          <KeyRound className="size-4" />
          密钥列表
          <span className="text-xs font-normal text-muted">
            （{keys.filter((k) => k.status === "active").length} 个启用 · 共 {keys.length} 个）
          </span>
        </CardHeader>
        <CardBody>
          <Table columns={columns} data={keys} enableSorting={false} getRowId={(k) => k.id} />
        </CardBody>
      </Card>

      {/* 新建密钥表单 */}
      <ModalForm
        title="新建 API 密钥"
        form={form}
        open={open}
        onOpenChange={setOpen}
        onFinish={(v) => handleFinish(v as KeyFormState)}
        submitText="创建密钥"
        className="w-[520px]"
      >
        <div className="grid grid-cols-2 gap-x-4">
          <Field label="密钥名称" className="col-span-2" error={reg.name.error}>
            <Input
              value={reg.name.value as string}
              onChange={reg.name.onChange}
              onBlur={reg.name.onBlur}
              placeholder="如：生产环境 · 主服务"
            />
          </Field>
          <Field label="所属分组">
            <Select
              items={keyGroups.map((g) => ({ value: g, label: g }))}
              value={reg.group.value as string}
              onValueChange={(v) => reg.group.onChange(v as string)}
            >
              <SelectTrigger />
              <SelectContent>
                {keyGroups.map((g) => (
                  <SelectItem key={g} value={g}>
                    {g}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field label="月度限额（USD，空 = 不限）">
            <NumberField
              value={reg.limitUsd.value as number | null}
              onValueChange={(v) => reg.limitUsd.onChange(v)}
              min={0}
              step={50}
              aria-label="月度限额"
            />
          </Field>
          <Field label="限速（RPM）" error={reg.rpm.error}>
            <NumberField
              value={reg.rpm.value as number | null}
              onValueChange={(v) => reg.rpm.onChange(v)}
              min={1}
              step={50}
              aria-label="限速"
            />
          </Field>
          <Field label="到期日（可选）">
            <Input
              type="date"
              value={reg.expiresAt.value as string}
              onChange={reg.expiresAt.onChange}
              onBlur={reg.expiresAt.onBlur}
            />
          </Field>
          <Field label="可调模型范围" className="col-span-2">
            <Select
              items={[{ value: "all", label: "全部模型" }, ...models.map((m) => ({ value: m.id, label: m.name }))]}
              value={reg.scope.value as string}
              onValueChange={(v) => reg.scope.onChange(v as string)}
            >
              <SelectTrigger />
              <SelectContent>
                <SelectItem value="all">全部模型</SelectItem>
                {models.map((m) => (
                  <SelectItem key={m.id} value={m.id}>
                    {m.name}
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
