"use client";
import { copy } from "./page.content";

import { useEffect, useState } from "react";
import { TriangleAlert } from "lucide-react";
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
  Popconfirm,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  Slider,
  Switch,
  TimeField,
  toast,
} from "@hulianui/ui";
import type { ViewAngle } from "@hulianui/ui";
import { sleep, usePending } from "../../../lib/async";
import { useOrg } from "../../_lib/org-store";
import { DEFAULT_SETTINGS } from "../../_data/org";
import type { OrgSettings } from "../../_data/types";
import { VIEW_LABEL } from "../../_lib/labels";

const VIEWS: ViewAngle[] = [0, 90, 180, 270];

export default function OrgClassroomSettingsPage() {
  const { state, updateSettings, reset } = useOrg();
  const [draft, setDraft] = useState<OrgSettings>(state.settings);
  const [pending, run] = usePending();

  useEffect(() => {
    setDraft(state.settings);
  }, [state.settings]);

  const update = <K extends keyof OrgSettings>(key: K, value: OrgSettings[K]) => {
    setDraft((prev) => ({ ...prev, [key]: value }));
  };

  const save = () => {
    if (draft.dayEnd <= draft.dayStart) {
      toast({ tone: "danger", title: copy("endBeforeStart") });
      return;
    }
    void run(() => {
      updateSettings(draft);
      toast({
        tone: "success",
        title: copy("savedToast"),
        description: copy("savedToastDesc"),
      });
    });
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-foreground">{copy("title")}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{copy("subtitle")}</p>
        </div>
        <Button loading={pending} onClick={save}>
          {copy("save")}
        </Button>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader
            title={copy("mapSection")}
            extra={
              <Popconfirm
                title={copy("restoreTitle")}
                description={copy("restoreDesc")}
                okText={copy("restoreDefaults")}
                onConfirm={async () => {
                  await sleep(350);
                  setDraft(DEFAULT_SETTINGS);
                  updateSettings(DEFAULT_SETTINGS);
                  toast({ tone: "success", title: copy("restoredToast") });
                }}
              >
                <Button variant="ghost" size="sm">
                  {copy("restoreDefaults")}
                </Button>
              </Popconfirm>
            }
          />
          <CardBody className="flex flex-col gap-5">
            <Field label={copy("northDeg")} description={copy("northDegDesc")}>
              <Slider
                value={draft.northDeg}
                min={0}
                max={359}
                step={1}
                showValue
                aria-label={copy("northDeg")}
                onValueChange={(value) =>
                  update("northDeg", Array.isArray(value) ? value[0] : value)
                }
              />
            </Field>
            <Field label={copy("defaultView")} description={copy("defaultViewDesc")}>
              <Select
                items={VIEWS.map((view) => ({ value: String(view), label: VIEW_LABEL[view] }))}
                value={String(draft.defaultView)}
                onValueChange={(value) =>
                  update("defaultView", Number(value ?? 0) as ViewAngle)
                }
              >
                <SelectTrigger />
                <SelectContent>
                  {VIEWS.map((view) => (
                    <SelectItem key={view} value={String(view)}>
                      {VIEW_LABEL[view]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label={copy("showLegend")} description={copy("showLegendDesc")}>
              <Switch
                checked={draft.showLegend}
                onCheckedChange={(checked) => update("showLegend", checked)}
                aria-label={copy("showLegend")}
              />
            </Field>
          </CardBody>
        </Card>

        <Card>
          <CardHeader title={copy("scheduleSection")} />
          <CardBody className="flex flex-col gap-5">
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label={copy("workStart")}>
                <TimeField
                  aria-label={copy("workStart")}
                  value={draft.dayStart}
                  onValueChange={(value) => update("dayStart", value ?? "09:00")}
                />
              </Field>
              <Field label={copy("workEnd")}>
                <TimeField
                  aria-label={copy("workEnd")}
                  value={draft.dayEnd}
                  onValueChange={(value) => update("dayEnd", value ?? "18:00")}
                />
              </Field>
            </div>
            <p className="text-sm text-muted-foreground">{copy("workHoursDesc")}</p>
            <Field label={copy("notifyStatus")} description={copy("notifyStatusDesc")}>
              <Switch
                checked={draft.notifyStatus}
                onCheckedChange={(checked) => update("notifyStatus", checked)}
                aria-label={copy("notifyStatus")}
              />
            </Field>
          </CardBody>
        </Card>
      </div>

      <Card>
        <CardHeader title={copy("dangerSection")} />
        <CardBody className="flex flex-col gap-3">
          <p className="text-sm text-muted-foreground">{copy("resetDataDesc")}</p>
          <AlertDialog>
            <AlertDialogTrigger
              render={
                <Button variant="outline" tone="danger" className="w-fit">
                  {copy("resetData")}
                </Button>
              }
            />
            <AlertDialogContent
              title={copy("resetDataTitle")}
              description={copy("resetDataConfirm")}
              icon={<TriangleAlert className="size-5 text-danger" />}
            >
              <AlertDialogClose render={<Button variant="outline">{copy("cancel")}</Button>} />
              <AlertDialogClose
                render={
                  <Button
                    tone="danger"
                    onClick={() => {
                      reset();
                      toast({ tone: "success", title: copy("resetDataDone") });
                    }}
                  >
                    {copy("resetData")}
                  </Button>
                }
              />
            </AlertDialogContent>
          </AlertDialog>
        </CardBody>
      </Card>
    </div>
  );
}
