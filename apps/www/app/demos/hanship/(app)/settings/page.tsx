"use client";

import { useState } from "react";
import {
  AlertDialog,
  AlertDialogClose,
  AlertDialogContent,
  AlertDialogTrigger,
  Button,
  Card,
  CardBody,
  CardHeader,
  Field,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  Switch,
  toast,
} from "@hulianui/ui";
import { Pause, Trash2 } from "lucide-react";

import { projects } from "../../_data/store";
import type { Framework } from "../../_data/types";
import { usePending } from "../../../lib/async";

const project = projects[0];

const frameworks: Framework[] = ["Next.js", "Vite", "Astro", "Nuxt", "Remix", "静态站点"];
const frameworkOptions = frameworks.map((f) => ({ value: f, label: f }));
const nodeOptions = [
  { value: "18", label: "18.x" },
  { value: "20", label: "20.x (推荐)" },
  { value: "22", label: "22.x" },
];

const defaultOutputDir = (fw: Framework) => (fw === "Next.js" ? ".next" : "dist");

export default function SettingsPage() {
  const [framework, setFramework] = useState<Framework>(project.framework);
  const [buildCmd, setBuildCmd] = useState("pnpm build");
  const [outputDir, setOutputDir] = useState(defaultOutputDir(project.framework));
  const [nodeVersion, setNodeVersion] = useState("20");
  const [installCmd, setInstallCmd] = useState("pnpm install");

  const [prodBranch, setProdBranch] = useState(project.productionBranch);
  const [autoDeploy, setAutoDeploy] = useState(project.autoDeploy);
  const [prPreview, setPrPreview] = useState(true);

  const [savingBuild, runBuild] = usePending();
  const [savingGit, runGit] = usePending();

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-lg font-semibold">构建设置</h1>
        <p className="text-sm text-muted">
          项目 <span className="font-mono">{project.name}</span> 的框架预设、构建命令与 Git 集成。
        </p>
      </div>

      {/* 框架与构建 */}
      <Card>
        <CardHeader className="text-sm font-medium">框架与构建</CardHeader>
        <CardBody className="flex flex-col gap-4">
          <Field label="框架预设" description="切换框架会自动调整默认输出目录">
            <Select
              items={frameworkOptions}
              value={framework}
              onValueChange={(x) => {
                const fw = x as Framework;
                setFramework(fw);
                setOutputDir(defaultOutputDir(fw));
              }}
            >
              <SelectTrigger />
              <SelectContent>
                {frameworkOptions.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field label="安装命令">
            <Input
              value={installCmd}
              onChange={(e) => setInstallCmd(e.target.value)}
              placeholder="pnpm install"
            />
          </Field>
          <Field label="构建命令">
            <Input
              value={buildCmd}
              onChange={(e) => setBuildCmd(e.target.value)}
              placeholder="pnpm build"
            />
          </Field>
          <Field label="输出目录" description="构建产物相对仓库根目录的路径">
            <Input
              value={outputDir}
              onChange={(e) => setOutputDir(e.target.value)}
              placeholder="dist"
            />
          </Field>
          <Field label="Node 版本">
            <Select items={nodeOptions} value={nodeVersion} onValueChange={(x) => setNodeVersion(x as string)}>
              <SelectTrigger />
              <SelectContent>
                {nodeOptions.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <div className="flex justify-end">
            <Button
              loading={savingBuild}
              disabled={savingBuild}
              onClick={() =>
                void runBuild(() => {
                  toast({ tone: "info", title: "构建设置已保存" });
                })
              }
            >
              保存
            </Button>
          </div>
        </CardBody>
      </Card>

      {/* Git 集成 */}
      <Card>
        <CardHeader className="text-sm font-medium">Git 集成</CardHeader>
        <CardBody className="flex flex-col gap-4">
          <Field label="仓库" description="在源代码托管商处管理仓库连接">
            <Input value={project.repo} readOnly />
          </Field>
          <Field label="生产分支" description="推送到该分支将触发生产部署">
            <Input
              value={prodBranch}
              onChange={(e) => setProdBranch(e.target.value)}
              placeholder="main"
            />
          </Field>
          <Field label="自动部署" description="分支有新提交时自动构建并部署">
            <Switch checked={autoDeploy} onCheckedChange={setAutoDeploy} aria-label="自动部署" />
          </Field>
          <Field label="PR 预览部署" description="为每个 Pull Request 生成独立预览地址">
            <Switch checked={prPreview} onCheckedChange={setPrPreview} aria-label="PR 预览部署" />
          </Field>
          <div className="flex justify-end">
            <Button
              loading={savingGit}
              disabled={savingGit}
              onClick={() =>
                void runGit(() => {
                  toast({ tone: "info", title: "Git 集成设置已保存" });
                })
              }
            >
              保存
            </Button>
          </div>
        </CardBody>
      </Card>

      {/* 危险区 */}
      <Card className="border-danger/40">
        <CardHeader className="text-sm font-medium text-danger">危险区</CardHeader>
        <CardBody className="flex flex-col gap-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="text-sm font-medium">暂停项目</div>
              <p className="text-sm text-muted">暂停后将停止接收新部署，已有部署继续在线。</p>
            </div>
            <AlertDialog>
              <AlertDialogTrigger
                render={
                  <Button variant="outline">
                    <Pause className="size-4" />
                    暂停项目
                  </Button>
                }
              />
              <AlertDialogContent
                title="暂停该项目？"
                description="暂停后自动部署将停止，可随时恢复。"
              >
                <AlertDialogClose
                  render={
                    <Button variant="outline" size="sm">
                      取消
                    </Button>
                  }
                />
                <AlertDialogClose
                  render={
                    <Button
                      size="sm"
                      onClick={() =>
                        toast({ tone: "neutral", title: "项目已暂停", description: project.name })
                      }
                    >
                      确认暂停
                    </Button>
                  }
                />
              </AlertDialogContent>
            </AlertDialog>
          </div>

          <div className="flex items-center justify-between gap-4 border-t border-hairline pt-4">
            <div>
              <div className="text-sm font-medium">删除项目</div>
              <p className="text-sm text-muted">永久删除项目、部署记录与域名绑定，此操作不可撤销。</p>
            </div>
            <AlertDialog>
              <AlertDialogTrigger
                render={
                  <Button tone="danger">
                    <Trash2 className="size-4" />
                    删除项目
                  </Button>
                }
              />
              <AlertDialogContent
                title="删除该项目？"
                description={`「${project.name}」及其全部部署、域名绑定将被永久删除，无法恢复。`}
              >
                <AlertDialogClose
                  render={
                    <Button variant="outline" size="sm">
                      取消
                    </Button>
                  }
                />
                <AlertDialogClose
                  render={
                    <Button
                      tone="danger"
                      size="sm"
                      onClick={() =>
                        toast({ tone: "danger", title: "项目已删除", description: project.name })
                      }
                    >
                      永久删除
                    </Button>
                  }
                />
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
