"use client";

import { useMemo, useState } from "react";
import {
  Alert,
  Button,
  Card,
  CardBody,
  CardHeader,
  Descriptions,
  Empty,
  Field,
  Input,
  ModalForm,
  Popconfirm,
  RelativeTime,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  Skeleton,
  Table,
  Tag,
  toast,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  useForm,
} from "@hulianui/ui";
import type { ColumnDef } from "@hulianui/ui";
import { Plus, ShieldCheck } from "lucide-react";

import { domains as seedDomains, projectById, projects } from "../../_data/store";
import type { Domain } from "../../_data/types";
import { agoDateDays } from "../../_lib/format";
import { useMockData, usePending } from "../../../lib/async";

type DomainType = Domain["type"];

const typeMeta: Record<DomainType, { label: string; tone: "brand" | "neutral" }> = {
  primary: { label: "主域", tone: "brand" },
  redirect: { label: "重定向", tone: "neutral" },
  preview: { label: "预览", tone: "neutral" },
};

const sslMeta: Record<Domain["ssl"], { label: string; tone: "success" | "warning" | "danger" }> = {
  active: { label: "已签发", tone: "success" },
  pending: { label: "签发中", tone: "warning" },
  error: { label: "失败", tone: "danger" },
};

const dnsMeta: Record<Domain["dns"], { label: string; tone: "success" | "warning" | "danger" }> = {
  valid: { label: "已生效", tone: "success" },
  pending: { label: "待生效", tone: "warning" },
  misconfigured: { label: "配置错误", tone: "danger" },
};

const typeOptions = (Object.keys(typeMeta) as DomainType[]).map((value) => ({
  value,
  label: typeMeta[value].label,
}));

const projectOptions = projects.map((p) => ({ value: p.id, label: p.name }));

type AddDomainValues = {
  host: string;
  projectId: string;
  type: DomainType;
};

export default function DomainsPage() {
  const { data, loading } = useMockData<Domain[]>(seedDomains);
  const [extra, setExtra] = useState<Domain[]>([]);
  const [removed, setRemoved] = useState<string[]>([]);
  const [open, setOpen] = useState(false);
  const [pending, run] = usePending();

  const form = useForm<AddDomainValues>({
    initialValues: { host: "", projectId: projects[0]?.id ?? "", type: "primary" },
  });
  const reg = {
    host: form.register("host", {
      rules: [{ required: true, message: "请输入域名" }],
    }),
    projectId: form.register("projectId", {
      rules: [{ required: true, message: "请选择项目" }],
    }),
    type: form.register("type", {
      rules: [{ required: true, message: "请选择类型" }],
    }),
  };

  const rows = useMemo(() => {
    const base = data ?? [];
    return [...extra, ...base].filter((d) => !removed.includes(d.id));
  }, [data, extra, removed]);

  const misconfigured = rows.filter((d) => d.dns === "misconfigured");

  const handleVerify = (d: Domain) => {
    void run(() => {
      toast({ tone: "info", title: "已发起验证", description: `正在重新检查 ${d.host} 的 DNS 记录` });
    });
  };

  const handleDelete = (d: Domain) => {
    setRemoved((prev) => [...prev, d.id]);
    toast({ tone: "danger", title: "域名已删除", description: d.host });
  };

  const columns: ColumnDef<Domain, unknown>[] = [
    {
      id: "host",
      header: "域名",
      cell: ({ row }) => {
        const d = row.original;
        return (
          <div className="flex items-center gap-2">
            <span className="font-mono text-sm">{d.host}</span>
            <Tag tone={typeMeta[d.type].tone} size="sm">
              {typeMeta[d.type].label}
            </Tag>
          </div>
        );
      },
    },
    {
      id: "project",
      header: "项目",
      cell: ({ row }) => (
        <span className="text-sm text-muted">{projectById(row.original.projectId)?.name ?? "—"}</span>
      ),
    },
    {
      id: "ssl",
      header: "SSL 证书",
      cell: ({ row }) => {
        const m = sslMeta[row.original.ssl];
        return (
          <Tag tone={m.tone} size="sm">
            {m.label}
          </Tag>
        );
      },
    },
    {
      id: "dns",
      header: "DNS",
      cell: ({ row }) => {
        const m = dnsMeta[row.original.dns];
        return (
          <Tag tone={m.tone} size="sm">
            {m.label}
          </Tag>
        );
      },
    },
    {
      id: "added",
      header: "添加",
      cell: ({ row }) => (
        <RelativeTime value={agoDateDays(row.original.addedAgoDays)} className="text-xs text-muted" />
      ),
    },
    {
      id: "actions",
      header: "操作",
      meta: { sticky: "right" },
      cell: ({ row }) => {
        const d = row.original;
        return (
          <div className="flex items-center justify-end gap-1">
            <Tooltip>
              <TooltipTrigger
                render={
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={pending}
                    onClick={() => handleVerify(d)}
                    aria-label={`验证 ${d.host}`}
                  >
                    <ShieldCheck className="size-4" />
                    验证
                  </Button>
                }
              />
              <TooltipContent>重新检查 DNS 与证书</TooltipContent>
            </Tooltip>
            <Popconfirm
              title="删除该域名？"
              description={`${d.host} 将不再指向本项目。`}
              okText="删除"
              cancelText="取消"
              danger
              onConfirm={() => handleDelete(d)}
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
          <h1 className="text-lg font-semibold">域名</h1>
          <p className="text-sm text-muted">管理自定义域名、SSL 证书与 DNS 解析。</p>
        </div>
        <Button onClick={() => setOpen(true)}>
          <Plus className="size-4" />
          添加域名
        </Button>
      </div>

      {!loading && misconfigured.length > 0 ? (
        <Alert tone="warning" title={`${misconfigured.length} 个域名 DNS 未正确配置`}>
          请按下方「待配置 DNS 记录」添加 CNAME 记录后点击「验证」。
        </Alert>
      ) : null}

      <Card>
        <CardHeader className="text-sm font-medium">全部域名</CardHeader>
        <CardBody>
          {loading ? (
            <div className="flex flex-col gap-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-9 w-full" />
              ))}
            </div>
          ) : rows.length === 0 ? (
            <Empty title="还没有自定义域名" description="添加一个域名，自动签发 SSL 证书并接入边缘网络。">
              <Button onClick={() => setOpen(true)}>
                <Plus className="size-4" />
                添加域名
              </Button>
            </Empty>
          ) : (
            <Table<Domain>
              columns={columns}
              data={rows}
              enableSorting={false}
              getRowId={(d) => d.id}
            />
          )}
        </CardBody>
      </Card>

      {!loading && misconfigured.length > 0 ? (
        <Card>
          <CardHeader className="text-sm font-medium">待配置 DNS 记录</CardHeader>
          <CardBody className="flex flex-col gap-4">
            {misconfigured.map((d) => {
              const slug = projectById(d.projectId)?.slug ?? "app";
              return (
                <div key={d.id} className="flex flex-col gap-2">
                  <div className="text-sm font-medium">{d.host}</div>
                  <Descriptions
                    column={1}
                    bordered
                    layout="horizontal"
                    items={[
                      { label: "类型", children: <span className="font-mono text-sm">CNAME</span> },
                      { label: "名称", children: <span className="font-mono text-sm">{d.host}</span> },
                      {
                        label: "值",
                        children: <span className="font-mono text-sm">{`${slug}.hanship.dev`}</span>,
                      },
                    ]}
                  />
                </div>
              );
            })}
          </CardBody>
        </Card>
      ) : null}

      <ModalForm
        title="添加域名"
        form={form}
        open={open}
        onOpenChange={setOpen}
        submitText="添加"
        className="w-[520px]"
        onFinish={(values) => {
          const v = values as AddDomainValues;
          const fresh: Domain = {
            id: `dom-new-${Date.now()}`,
            projectId: v.projectId,
            host: v.host.trim(),
            type: v.type,
            ssl: "pending",
            dns: "pending",
            addedAgoDays: 0,
          };
          setExtra((prev) => [fresh, ...prev]);
          form.resetFields();
          toast({ tone: "info", title: "域名已添加，正在签发证书", description: fresh.host });
        }}
      >
        <Field label="域名" error={reg.host.error} description="例如 app.example.com">
          <Input
            value={String(reg.host.value ?? "")}
            onChange={(e) => reg.host.onChange(e.target.value)}
            onBlur={reg.host.onBlur}
            placeholder="app.example.com"
          />
        </Field>
        <Field label="项目" error={reg.projectId.error}>
          <Select
            items={projectOptions}
            value={String(reg.projectId.value ?? "")}
            onValueChange={(x) => reg.projectId.onChange(x)}
          >
            <SelectTrigger />
            <SelectContent>
              {projectOptions.map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        <Field label="类型" error={reg.type.error}>
          <Select
            items={typeOptions}
            value={String(reg.type.value ?? "primary")}
            onValueChange={(x) => reg.type.onChange(x as DomainType)}
          >
            <SelectTrigger />
            <SelectContent>
              {typeOptions.map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
      </ModalForm>
    </div>
  );
}
