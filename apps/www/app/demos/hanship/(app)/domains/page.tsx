"use client";
import { copy } from "./page.content";
import { DEMO_RELATIVE_TIME_LOCALE } from "../../../_components/demo-locale";

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
  primary: { label: copy("mainDomain"), tone: "brand" },
  redirect: { label: copy("redirect"), tone: "neutral" },
  preview: { label: copy("preview"), tone: "neutral" },
};

const sslMeta: Record<Domain["ssl"], { label: string; tone: "success" | "warning" | "danger" }> = {
  active: { label: copy("issued"), tone: "success" },
  pending: { label: copy("issuing"), tone: "warning" },
  error: { label: copy("failed"), tone: "danger" },
};

const dnsMeta: Record<Domain["dns"], { label: string; tone: "success" | "warning" | "danger" }> = {
  valid: { label: copy("alreadyEffective"), tone: "success" },
  pending: { label: copy("toBeEffective"), tone: "warning" },
  misconfigured: { label: copy("configurationError"), tone: "danger" },
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
      rules: [{ required: true, message: copy("pleaseEnterDomainName") }],
    }),
    projectId: form.register("projectId", {
      rules: [{ required: true, message: copy("pleaseSelectAnItem") }],
    }),
    type: form.register("type", {
      rules: [{ required: true, message: copy("pleaseSelectType") }],
    }),
  };

  const rows = useMemo(() => {
    const base = data ?? [];
    return [...extra, ...base].filter((d) => !removed.includes(d.id));
  }, [data, extra, removed]);

  const misconfigured = rows.filter((d) => d.dns === "misconfigured");

  const handleVerify = (d: Domain) => {
    void run(() => {
      toast({ tone: "info", title: copy("verificationInitiated"), description: copy("recheckingDnsRecordsForValue", d.host) });
    });
  };

  const handleDelete = (d: Domain) => {
    setRemoved((prev) => [...prev, d.id]);
    toast({ tone: "danger", title: copy("domainNameHasBeenDeleted"), description: d.host });
  };

  const columns: ColumnDef<Domain, unknown>[] = [
    {
      id: "host",
      header: copy("domainName"),
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
      header: copy("project"),
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">{projectById(row.original.projectId)?.name ?? "—"}</span>
      ),
    },
    {
      id: "ssl",
      header: copy("sslCertificate"),
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
      header: copy("add"),
      cell: ({ row }) => (
        <RelativeTime value={agoDateDays(row.original.addedAgoDays)} locale={DEMO_RELATIVE_TIME_LOCALE} className="text-xs text-muted-foreground" />
      ),
    },
    {
      id: "actions",
      header: copy("operation"),
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
                    aria-label={copy("verifyValue", d.host)}
                  >
                    <ShieldCheck className="size-4" />{copy("verify")}</Button>
                }
              />
              <TooltipContent>{copy("recheckDnsAndCertificates")}</TooltipContent>
            </Tooltip>
            <Popconfirm
              title={copy("deleteThisDomainName")}
              description={copy("valueWillNoLongerPointToThis", d.host)}
              okText={copy("delete")}
              cancelText={copy("cancel")}
              danger
              onConfirm={() => handleDelete(d)}
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
          <h1 className="text-lg font-semibold">{copy("domainName2")}</h1>
          <p className="text-sm text-muted-foreground">{copy("manageCustomDomainNamesSslCertificatesAnd")}</p>
        </div>
        <Button onClick={() => setOpen(true)}>
          <Plus className="size-4" />{copy("addDomainName")}</Button>
      </div>

      {!loading && misconfigured.length > 0 ? (
        <Alert tone="warning" title={copy("dnsForValueDomainsIsNotConfigured", misconfigured.length)}>{copy("pleaseClickDnsRecordsToBeConfigured")}</Alert>
      ) : null}

      <Card>
        <CardHeader className="text-sm font-medium">{copy("allDomainNames")}</CardHeader>
        <CardBody>
          {loading ? (
            <div className="flex flex-col gap-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-9 w-full" />
              ))}
            </div>
          ) : rows.length === 0 ? (
            <Empty title={copy("noCustomDomainNameYet")} description={copy("addADomainNameAutomaticallyIssueAn")}>
              <Button onClick={() => setOpen(true)}>
                <Plus className="size-4" />{copy("addDomainName2")}</Button>
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
          <CardHeader className="text-sm font-medium">{copy("dnsRecordsToBeConfigured")}</CardHeader>
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
                      { label: copy("type"), children: <span className="font-mono text-sm">CNAME</span> },
                      { label: copy("name"), children: <span className="font-mono text-sm">{d.host}</span> },
                      {
                        label: copy("value"),
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
        title={copy("addDomainName3")}
        form={form}
        open={open}
        onOpenChange={setOpen}
        submitText={copy("add2")}
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
          toast({ tone: "success", title: copy("theDomainNameHasBeenAddedAnd"), description: fresh.host });
        }}
      >
        <Field label={copy("domainName3")} error={reg.host.error} description={copy("forExampleAppExampleCom")}>
          <Input
            value={String(reg.host.value ?? "")}
            onChange={(e) => reg.host.onChange(e.target.value)}
            onBlur={reg.host.onBlur}
            placeholder="app.example.com"
          />
        </Field>
        <Field label={copy("project2")} error={reg.projectId.error}>
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
        <Field label={copy("type2")} error={reg.type.error}>
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
