"use client";
import { copy } from "./page.content";
import { DEMO_RELATIVE_TIME_LOCALE } from "../../../_components/demo-locale";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, ExternalLink, Eye } from "lucide-react";
import {
  Button,
  Input,
  ProTable,
  Tag,
  GitCommit,
  DeployStatus,
  RelativeTime,
  Alert,
  Field,
  ModalForm,
  useForm,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  toast,
} from "@hulianui/ui";
import type { ColumnDef } from "@hulianui/ui";
import { deploys as seed, projects, projectById } from "../../_data/store";
import type { Deploy } from "../../_data/types";
import { agoDate } from "../../_lib/format";
import { useMockData } from "../../../lib/async";
import { ROOT } from "../../_components/nav-config";

const PAGE_SIZE = 8;

type DeployFilter = { kw: string; env: string; status: string };
const EMPTY_FILTER: DeployFilter = { kw: "", env: "all", status: "all" };

const ENV_OPTIONS = [
  { value: "all", label: copy("allEnvironments") },
  { value: "production", label: copy("produce") },
  { value: "preview", label: copy("preview") },
];

const STATUS_OPTIONS = [
  { value: "all", label: copy("allStatus") },
  { value: "ready", label: copy("alreadyOnline") },
  { value: "building", label: copy("underConstruction") },
  { value: "error", label: copy("failed") },
  { value: "canceled", label: copy("canceled") },
  { value: "queued", label: copy("queue") },
  { value: "skipped", label: copy("skipped") },
];

type DeployForm = { projectId: string; branch: string };

export default function DeploymentsPage() {
  const router = useRouter();
  const { data, loading, error, reload } = useMockData<Deploy[]>(seed, { failOnce: true });
  const [extra, setExtra] = useState<Deploy[]>([]);
  const [filter, setFilter] = useState<DeployFilter>(EMPTY_FILTER);
  const [page, setPage] = useState(1);
  const [open, setOpen] = useState(false);

  const form = useForm<DeployForm>({
    initialValues: { projectId: projects[0]?.id ?? "", branch: "main" },
  });
  const reg = {
    projectId: form.register("projectId", { rules: [{ required: true, message: copy("pleaseSelectAnItem") }] }),
    branch: form.register("branch", { rules: [{ required: true, message: copy("pleaseEnterBranch") }] }),
  };

  const all = useMemo(() => [...extra, ...(data ?? [])], [extra, data]);

  const filtered = useMemo(() => {
    const kw = filter.kw.trim().toLowerCase();
    return all.filter((d) => {
      if (filter.env !== "all" && d.env !== filter.env) return false;
      if (filter.status !== "all" && d.status !== filter.status) return false;
      if (kw) {
        const proj = projectById(d.projectId)?.name ?? "";
        const hay = `${d.message} ${d.sha} ${d.branch} ${proj}`.toLowerCase();
        if (!hay.includes(kw)) return false;
      }
      return true;
    });
  }, [all, filter]);

  const total = filtered.length;
  const pageRows = useMemo(
    () => filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [filtered, page],
  );

  const columns = useMemo<ColumnDef<Deploy, unknown>[]>(
    () => [
      {
        id: "project",
        header: copy("project"),
        cell: ({ row }) => (
          <span className="font-medium text-foreground">
            {projectById(row.original.projectId)?.name ?? row.original.projectId}
          </span>
        ),
      },
      {
        id: "env",
        header: copy("environment"),
        cell: ({ row }) => (
          <Tag tone={row.original.env === "production" ? "success" : "warning"} size="sm">
            {row.original.env === "production" ? copy("produce2") : copy("preview2")}
          </Tag>
        ),
      },
      {
        id: "source",
        header: "Source",
        cell: ({ row }) => (
          <GitCommit
            layout="stacked"
            size="sm"
            sha={row.original.sha}
            branch={row.original.branch}
            message={row.original.message}
            author={row.original.author}
          />
        ),
      },
      {
        id: "url",
        header: copy("deploymentAddress"),
        cell: ({ row }) => (
          <a
            href={`https://${row.original.url}`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex max-w-[220px] items-center gap-1 truncate font-mono text-xs text-muted-foreground transition-colors hover:text-primary"
          >
            <span className="truncate">{row.original.url}</span>
            <ExternalLink className="size-3 shrink-0 opacity-60" />
          </a>
        ),
      },
      {
        id: "status",
        header: copy("status"),
        cell: ({ row }) => <DeployStatus status={row.original.status} size="sm" />,
      },
      {
        id: "created",
        header: copy("create"),
        cell: ({ row }) => (
          <RelativeTime value={agoDate(row.original.agoMin)} locale={DEMO_RELATIVE_TIME_LOCALE} className="text-xs text-muted-foreground" />
        ),
      },
      {
        id: "actions",
        header: copy("operation"),
        meta: { sticky: "right" },
        cell: ({ row }) => (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push(`${ROOT}/deployments/${row.original.id}`)}
          >
            <Eye className="size-4" />{copy("view")}</Button>
        ),
      },
    ],
    [router],
  );

  const handleFinish = (v: DeployForm) => {
    const proj = projectById(v.projectId);
    const sha = Math.random().toString(16).slice(2, 14).padEnd(12, "0");
    const slug = proj?.slug ?? "preview";
    const np: Deploy = {
      id: `d-manual-${Date.now()}`,
      projectId: v.projectId,
      env: "preview",
      branch: v.branch.trim() || "main",
      sha,
      message: copy("manualDeploymentBranchValue", v.branch.trim() || "main"),
      author: copy("hulian"),
      authorInitial: copy("coral"),
      status: "building",
      url: `${sha.slice(0, 8)}.${slug}.hanship.dev`,
      agoMin: 0,
      durationSec: null,
    };
    setExtra((prev) => [np, ...prev]);
    setPage(1);
    toast({
      tone: "info",
      title: copy("deploymentTriggered"),
      description: copy("valueValueIsUnderConstruction", proj?.name ?? v.projectId, np.branch),
    });
  };

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-xl font-semibold text-foreground">{copy("deploymentHistory")}</h1>
        <p className="text-sm text-muted-foreground">{copy("deploymentRecordsAcrossAllProjectsClickOn")}</p>
      </div>

      {error ? (
        <Alert tone="danger" title={copy("failedToLoadDeploymentList")}>
          <div className="flex flex-col gap-2">
            <span>{error}</span>
            <Button variant="outline" size="sm" className="w-fit" onClick={reload}>{copy("tryAgain")}</Button>
          </div>
        </Alert>
      ) : (
        <ProTable<Deploy>
          title={copy("deployAll")}
          columns={columns}
          data={pageRows}
          getRowId={(d) => d.id}
          enableSorting={false}
          loading={loading}
          toolbar={{ reload: true, density: true, columnSetting: true, fullscreen: true }}
          onReload={reload}
          toolbarActions={
            <Button
              size="sm"
              onClick={() => {
                form.resetFields();
                setOpen(true);
              }}
            >
              <Plus className="size-4" />{copy("manualDeployment")}</Button>
          }
          search={{
            fields: [
              { name: "kw", label: copy("keywords"), placeholder: copy("commitInformationShaBranchProjectName") },
              { name: "env", label: copy("environment2"), type: "select", options: ENV_OPTIONS },
              { name: "status", label: copy("status2"), type: "select", options: STATUS_OPTIONS },
            ],
            values: filter,
            onChange: (vals) => {
              setFilter({
                kw: (vals.kw as string) ?? "",
                env: (vals.env as string) ?? "all",
                status: (vals.status as string) ?? "all",
              });
              setPage(1);
            },
            onSearch: (vals) => {
              setFilter({
                kw: (vals.kw as string) ?? "",
                env: (vals.env as string) ?? "all",
                status: (vals.status as string) ?? "all",
              });
              setPage(1);
            },
            onReset: () => {
              setFilter(EMPTY_FILTER);
              setPage(1);
            },
          }}
          pagination={{
            page,
            pageSize: PAGE_SIZE,
            total,
            onPageChange: setPage,
          }}
        />
      )}

      <ModalForm
        title={copy("manualDeployment2")}
        form={form}
        open={open}
        onOpenChange={setOpen}
        onFinish={(v) => handleFinish(v as DeployForm)}
        submitText={copy("triggerDeployment")}
        className="w-[520px]"
      >
        <div className="flex flex-col gap-1">
          <Field label={copy("project2")} error={reg.projectId.error}>
            <Select
              items={projects.map((p) => ({ value: p.id, label: p.name }))}
              value={reg.projectId.value as string}
              onValueChange={(v) => reg.projectId.onChange(v as string)}
            >
              <SelectTrigger />
              <SelectContent>
                {projects.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field label={copy("branch")} error={reg.branch.error} description={copy("theLatestCommitOfThisBranchWill")}>
            <Input
              value={reg.branch.value as string}
              onChange={reg.branch.onChange}
              onBlur={reg.branch.onBlur}
              placeholder="main"
            />
          </Field>
        </div>
      </ModalForm>
    </div>
  );
}
