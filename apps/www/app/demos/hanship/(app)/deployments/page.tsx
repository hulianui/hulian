"use client";
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
  { value: "all", label: "全部环境" },
  { value: "production", label: "生产" },
  { value: "preview", label: "预览" },
];

const STATUS_OPTIONS = [
  { value: "all", label: "全部状态" },
  { value: "ready", label: "已上线" },
  { value: "building", label: "构建中" },
  { value: "error", label: "失败" },
  { value: "canceled", label: "已取消" },
  { value: "queued", label: "排队" },
  { value: "skipped", label: "已跳过" },
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
    projectId: form.register("projectId", { rules: [{ required: true, message: "请选择项目" }] }),
    branch: form.register("branch", { rules: [{ required: true, message: "请输入分支" }] }),
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
        header: "项目",
        cell: ({ row }) => (
          <span className="font-medium text-foreground">
            {projectById(row.original.projectId)?.name ?? row.original.projectId}
          </span>
        ),
      },
      {
        id: "env",
        header: "环境",
        cell: ({ row }) => (
          <Tag tone={row.original.env === "production" ? "brand" : "neutral"} size="sm">
            {row.original.env === "production" ? "生产" : "预览"}
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
        header: "部署地址",
        cell: ({ row }) => (
          <a
            href={`https://${row.original.url}`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex max-w-[220px] items-center gap-1 truncate font-mono text-xs text-muted transition-colors hover:text-primary"
          >
            <span className="truncate">{row.original.url}</span>
            <ExternalLink className="size-3 shrink-0 opacity-60" />
          </a>
        ),
      },
      {
        id: "status",
        header: "状态",
        cell: ({ row }) => <DeployStatus status={row.original.status} size="sm" />,
      },
      {
        id: "created",
        header: "创建",
        cell: ({ row }) => (
          <RelativeTime value={agoDate(row.original.agoMin)} className="text-xs text-muted" />
        ),
      },
      {
        id: "actions",
        header: "操作",
        meta: { sticky: "right" },
        cell: ({ row }) => (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push(`${ROOT}/deployments/${row.original.id}`)}
          >
            <Eye className="size-4" />
            查看
          </Button>
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
      message: `手动部署（分支 ${v.branch.trim() || "main"}）`,
      author: "瑚琏",
      authorInitial: "瑚",
      status: "building",
      url: `${sha.slice(0, 8)}.${slug}.hanship.dev`,
      agoMin: 0,
      durationSec: null,
    };
    setExtra((prev) => [np, ...prev]);
    setPage(1);
    toast({
      tone: "info",
      title: "已触发部署",
      description: `${proj?.name ?? v.projectId} · ${np.branch} 正在构建中。`,
    });
  };

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-xl font-semibold text-foreground">部署历史</h1>
        <p className="text-sm text-muted">跨所有项目的部署记录 · 点开任一条查看构建步骤与日志</p>
      </div>

      {error ? (
        <Alert tone="danger" title="加载部署列表失败">
          <div className="flex flex-col gap-2">
            <span>{error}</span>
            <Button variant="outline" size="sm" className="w-fit" onClick={reload}>
              重试
            </Button>
          </div>
        </Alert>
      ) : (
        <ProTable<Deploy>
          title="全部部署"
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
              <Plus className="size-4" />
              手动部署
            </Button>
          }
          search={{
            fields: [
              { name: "kw", label: "关键词", placeholder: "提交信息 / SHA / 分支 / 项目名" },
              { name: "env", label: "环境", type: "select", options: ENV_OPTIONS },
              { name: "status", label: "状态", type: "select", options: STATUS_OPTIONS },
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
        title="手动部署"
        form={form}
        open={open}
        onOpenChange={setOpen}
        onFinish={(v) => handleFinish(v as DeployForm)}
        submitText="触发部署"
        className="w-[520px]"
      >
        <div className="flex flex-col gap-1">
          <Field label="项目" error={reg.projectId.error}>
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
          <Field label="分支" error={reg.branch.error} description="将以预览环境部署该分支的最新提交">
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
