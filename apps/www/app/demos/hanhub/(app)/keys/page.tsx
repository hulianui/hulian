"use client";
import { copy } from "./page.content";

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
} from "@hulianui/ui";
import type { ColumnDef } from "@hulianui/ui";
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
    name: form.register("name", { rules: [{ required: true, message: copy("pleaseEnterAKeyName") }] }),
    group: form.register("group"),
    limitUsd: form.register("limitUsd"),
    rpm: form.register("rpm", { rules: [{ required: true, message: copy("pleaseSetSpeedLimit") }] }),
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
    toast({ tone: "success", title: copy("keyCreated"), description: copy("pleaseCopyItImmediatelyAndKeepIt") });
  };

  const toggleStatus = (id: string) =>
    setKeys((prev) =>
      prev.map((k) => (k.id === id ? { ...k, status: k.status === "active" ? "disabled" : "active" } : k)),
    );

  const resetSecret = (id: string) => {
    const next = genSecret();
    setKeys((prev) => prev.map((k) => (k.id === id ? { ...k, secret: next } : k)));
    toast({ tone: "success", title: copy("keyHasBeenReset"), description: copy("theOldKeyIsInvalidImmediatelyPlease") });
  };

  const revokeKey = (id: string) => {
    setKeys((prev) => prev.filter((k) => k.id !== id));
    toast({ tone: "danger", title: copy("keyRevoked") });
  };

  const columns = useMemo<ColumnDef<ApiKey, unknown>[]>(
    () => [
      {
        accessorKey: "name",
        header: copy("nameGroup"),
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
              <div className="mt-0.5 text-xs text-muted-foreground">{copy("create")}{k.createdAt}
                {k.expiresAt ? copy("expirationValue", k.expiresAt) : copy("longTermEffective")}
                {k.allowedModels.length > 0 ? copy("limitedToValueModels", k.allowedModels.length) : copy("allModels")}
              </div>
            </div>
          );
        },
      },
      {
        id: "secret",
        header: copy("key"),
        cell: ({ row }) => (
          <SecretField value={row.original.secret} size="sm" readOnly onCopy={() => toast({ tone: "info", title: copy("keyCopied") })} />
        ),
      },
      {
        id: "usage",
        header: copy("usageThisMonth"),
        cell: ({ row }) => {
          const k = row.original;
          if (k.limitUsd == null) {
            return (
              <div className="text-sm">
                <span className="tabular-nums text-foreground">{formatUsd(k.usedUsd)}</span>
                <span className="text-muted-foreground">{copy("noLimit")}</span>
              </div>
            );
          }
          const pct = Math.min(100, (k.usedUsd / k.limitUsd) * 100);
          return (
            <div className="w-40">
              <Meter value={pct} />
              <div className="mt-1 text-xs text-muted-foreground">
                <span className="tabular-nums text-foreground">{formatUsd(k.usedUsd)}</span> / {formatUsd(k.limitUsd)}
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: "rpm",
        header: copy("speedLimit"),
        cell: ({ row }) => <span className="tabular-nums text-sm">{row.original.rpm} RPM</span>,
      },
      {
        id: "status",
        header: copy("status"),
        cell: ({ row }) => {
          const k = row.original;
          return (
            <div className="flex items-center gap-2">
              <StatusDot status={k.status === "active" ? "online" : "offline"} />
              <Switch
                checked={k.status === "active"}
                onCheckedChange={() => toggleStatus(k.id)}
                aria-label={copy("startAndStopValue", k.name)}
              />
            </div>
          );
        },
      },
      {
        id: "actions",
        header: copy("operation"),
        meta: { sticky: "right" },
        cell: ({ row }) => (
          <div className="flex justify-end gap-1">
            <Button size="sm" variant="ghost" onClick={() => resetSecret(row.original.id)}>
              <RotateCcw className="size-4" />{copy("reset")}</Button>
            <Button size="sm" variant="ghost" tone="danger" onClick={() => revokeKey(row.original.id)}>
              <Ban className="size-4" />{copy("revoke")}</Button>
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
          <h1 className="text-xl font-semibold text-foreground">{copy("apiKey")}</h1>
          <p className="text-sm text-muted-foreground">{copy("useOneKeyToAccessAllUpstream")}</p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="size-4" />{copy("createNewKey")}</Button>
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
            <div className="text-sm font-medium text-foreground">{copy("key2")}{created.name}{copy("createdTheCompleteKeyWillOnlyBe")}</div>
            <SecretField
              value={created.secret}
              revealed
              size="md"
              onCopy={() => toast({ tone: "info", title: copy("completeKeyCopied") })}
            />
            <div className="flex items-center gap-1.5 text-xs text-warning">
              <TriangleAlert className="size-3.5" />{copy("afterClosingThisPromptYouWillNot")}</div>
          </div>
        </Banner>
      )}

      <Card>
        <CardHeader className="flex items-center gap-2 font-medium text-foreground">
          <KeyRound className="size-4" />{copy("keyList")}<span className="text-xs font-normal text-muted-foreground">
            {copy("keyCountOpen")}{keys.filter((k) => k.status === "active").length}{copy("enabledTotal")}{keys.length}{copy("localizedText")}</span>
        </CardHeader>
        <CardBody>
          <Table columns={columns} data={keys} enableSorting={false} getRowId={(k) => k.id} />
        </CardBody>
      </Card>

      {/* 新建密钥表单 */}
      <ModalForm
        title={copy("createNewApiKey")}
        form={form}
        open={open}
        onOpenChange={setOpen}
        onFinish={(v) => handleFinish(v as KeyFormState)}
        submitText={copy("createKey")}
        className="w-[520px]"
      >
        <div className="grid grid-cols-2 gap-x-4">
          <Field label={copy("keyName")} className="col-span-2" error={reg.name.error}>
            <Input
              value={reg.name.value as string}
              onChange={reg.name.onChange}
              onBlur={reg.name.onBlur}
              placeholder={copy("suchAsProductionEnvironmentMainService")}
            />
          </Field>
          <Field label={copy("groupToWhichItBelongs")}>
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
          <Field label={copy("monthlyLimitUsdEmptyNoLimit")}>
            <NumberField
              value={reg.limitUsd.value as number | null}
              onValueChange={(v) => reg.limitUsd.onChange(v)}
              min={0}
              step={50}
              aria-label={copy("monthlyLimit")}
            />
          </Field>
          <Field label={copy("speedLimitRpm")} error={reg.rpm.error}>
            <NumberField
              value={reg.rpm.value as number | null}
              onValueChange={(v) => reg.rpm.onChange(v)}
              min={1}
              step={50}
              aria-label={copy("speedLimit2")}
            />
          </Field>
          <Field label={copy("expirationDateOptional")}>
            <Input
              type="date"
              value={reg.expiresAt.value as string}
              onChange={reg.expiresAt.onChange}
              onBlur={reg.expiresAt.onBlur}
            />
          </Field>
          <Field label={copy("adjustableModelRange")} className="col-span-2">
            <Select
              items={[{ value: "all", label: copy("allModels2") }, ...models.map((m) => ({ value: m.id, label: m.name }))]}
              value={reg.scope.value as string}
              onValueChange={(v) => reg.scope.onChange(v as string)}
            >
              <SelectTrigger />
              <SelectContent>
                <SelectItem value="all">{copy("allModels3")}</SelectItem>
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
