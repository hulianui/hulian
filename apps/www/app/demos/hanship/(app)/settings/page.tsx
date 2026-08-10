"use client";
import { copy } from "./page.content";

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
const frameworkOptions = frameworks.map((f) => ({ value: f, label: f === "静态站点" ? copy("staticSite") : f }));
const nodeOptions = [
  { value: "18", label: "18.x" },
  { value: "20", label: copy("xRecommended") },
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
        <h1 className="text-lg font-semibold">{copy("buildSettings")}</h1>
        <p className="text-sm text-muted-foreground">{copy("project")}<span className="font-mono">{project.name}</span>{copy("frameworkPresetsBuildCommandsAndGitIntegration")}</p>
      </div>

      {/* 框架与构建 */}
      <Card>
        <CardHeader className="text-sm font-medium">{copy("frameworkAndBuild")}</CardHeader>
        <CardBody className="flex flex-col gap-4">
          <Field label={copy("framePresets")} description={copy("switchingFrameworksWillAutomaticallyAdjustTheDefault")}>
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
          <Field label={copy("installationCommand")}>
            <Input
              value={installCmd}
              onChange={(e) => setInstallCmd(e.target.value)}
              placeholder="pnpm install"
            />
          </Field>
          <Field label={copy("buildCommand")}>
            <Input
              value={buildCmd}
              onChange={(e) => setBuildCmd(e.target.value)}
              placeholder="pnpm build"
            />
          </Field>
          <Field label={copy("outputDirectory")} description={copy("thePathOfTheBuildProductRelative")}>
            <Input
              value={outputDir}
              onChange={(e) => setOutputDir(e.target.value)}
              placeholder="dist"
            />
          </Field>
          <Field label={copy("nodeVersion")}>
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
                  toast({ tone: "success", title: copy("buildSettingsSaved") });
                })
              }
            >{copy("save")}</Button>
          </div>
        </CardBody>
      </Card>

      {/* Git 集成 */}
      <Card>
        <CardHeader className="text-sm font-medium">{copy("gitIntegration")}</CardHeader>
        <CardBody className="flex flex-col gap-4">
          <Field label={copy("warehouse")} description={copy("manageRepositoryConnectionsAtYourSourceCode")}>
            <Input value={project.repo} readOnly />
          </Field>
          <Field label={copy("productionBranch")} description={copy("pushingToThisBranchWillTriggerA")}>
            <Input
              value={prodBranch}
              onChange={(e) => setProdBranch(e.target.value)}
              placeholder="main"
            />
          </Field>
          <Field label={copy("automaticDeployment")} description={copy("automaticallyBuildAndDeployWhenBranchesHave")}>
            <Switch checked={autoDeploy} onCheckedChange={setAutoDeploy} aria-label={copy("automaticDeployment2")} />
          </Field>
          <Field label={copy("prPreviewDeployment")} description={copy("generateIndependentPreviewAddressesForEachPull")}>
            <Switch checked={prPreview} onCheckedChange={setPrPreview} aria-label={copy("prPreviewDeployment2")} />
          </Field>
          <div className="flex justify-end">
            <Button
              loading={savingGit}
              disabled={savingGit}
              onClick={() =>
                void runGit(() => {
                  toast({ tone: "success", title: copy("gitIntegrationSettingsSaved") });
                })
              }
            >{copy("save2")}</Button>
          </div>
        </CardBody>
      </Card>

      {/* 危险区 */}
      <Card className="border-danger/40">
        <CardHeader className="text-sm font-medium text-danger">{copy("dangerZone")}</CardHeader>
        <CardBody className="flex flex-col gap-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="text-sm font-medium">{copy("pauseProject")}</div>
              <p className="text-sm text-muted-foreground">{copy("afterTheSuspensionNewDeploymentsWillStop")}</p>
            </div>
            <AlertDialog>
              <AlertDialogTrigger
                render={
                  <Button variant="outline">
                    <Pause className="size-4" />{copy("pauseProject2")}</Button>
                }
              />
              <AlertDialogContent
                title={copy("pauseTheProject")}
                description={copy("automaticDeploymentWillStopAfterPausingAnd")}
              >
                <AlertDialogClose
                  render={
                    <Button variant="outline" size="sm">{copy("cancel")}</Button>
                  }
                />
                <AlertDialogClose
                  render={
                    <Button
                      size="sm"
                      onClick={() =>
                        toast({ tone: "neutral", title: copy("projectHasBeenSuspended"), description: project.name })
                      }
                    >{copy("confirmPause")}</Button>
                  }
                />
              </AlertDialogContent>
            </AlertDialog>
          </div>

          <div className="flex items-center justify-between gap-4 border-t border-hairline pt-4">
            <div>
              <div className="text-sm font-medium">{copy("deleteProject")}</div>
              <p className="text-sm text-muted-foreground">{copy("permanentlyDeleteTheProjectDeploymentRecordAnd")}</p>
            </div>
            <AlertDialog>
              <AlertDialogTrigger
                render={
                  <Button tone="danger">
                    <Trash2 className="size-4" />{copy("deleteProject2")}</Button>
                }
              />
              <AlertDialogContent
                title={copy("deleteThisProject")}
                description={copy("valueAndAllItsDeploymentsAndDomain", project.name)}
              >
                <AlertDialogClose
                  render={
                    <Button variant="outline" size="sm">{copy("cancel2")}</Button>
                  }
                />
                <AlertDialogClose
                  render={
                    <Button
                      tone="danger"
                      size="sm"
                      onClick={() =>
                        toast({ tone: "danger", title: copy("projectDeleted"), description: project.name })
                      }
                    >{copy("deletePermanently")}</Button>
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
