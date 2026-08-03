"use client";
import { copy } from "./page.content";
import { useState } from "react";
import { Sparkles } from "lucide-react";
import {
  Avatar,
  Button,
  Card,
  CardBody,
  Field,
  Heading,
  Input,
  Spinner,
  Stat,
  Tag,
  Text,
  Textarea,
  toast,
} from "@hulianui/ui";
import { meshGradient } from "../../_lib/artwork";
import { ARTIFACTS } from "../../_data/artifacts";
import { usePending } from "../../../lib/async";

export default function ProfilePage() {
  const [name, setName] = useState(copy("suYan"));
  const [role, setRole] = useState(copy("creativeDesigner"));
  const [email, setEmail] = useState("suyan@hulian.design");
  const [bio, setBio] = useState(copy("useAIToPullThePictureOutOfYourHead"));

  const [savePending, runSave] = usePending();

  const onSave = () => {
    void runSave(() => {
      toast({ title: copy("profileSaved"), tone: "success" });
    });
  };

  const recent = ARTIFACTS.filter((a) => a.type === "image").slice(0, 6);

  return (
    <div className="h-full overflow-y-auto">
      <div className="mx-auto max-w-5xl px-6 py-8">
        <header className="mb-6">
          <Heading level={1} size="2xl">
            {copy("profile")}
          </Heading>
          <Text tone="muted" className="mt-1.5">
            {copy("manageYourAccountInformationUsageAndCreativePreferences")}
          </Text>
        </header>

        {/* 资料头卡 */}
        <Card variant="elevated" className="mb-5">
          <CardBody className="flex flex-col items-center gap-4 p-5 sm:flex-row">
            {/* 删除远程图片 src，仅用 fallback 首字 */}
            <Avatar fallback={copy("sue")} className="size-16 shrink-0" />
            <div className="min-w-0 flex-1 text-center sm:text-left">
              <div className="flex items-center justify-center gap-2 sm:justify-start">
                <Heading level={2} size="lg">
                  {name}
                </Heading>
                <Tag size="sm" tone="brand" variant="soft">
                  {role}
                </Tag>
              </div>
              <Text tone="muted" size="sm" className="mt-0.5">
                {email}
              </Text>
            </div>
            <Tag size="sm" tone="success" variant="soft" className="shrink-0">
              <Sparkles className="size-3.5" />
              {copy("pro")}
            </Tag>
          </CardBody>
        </Card>

        {/* 用量统计 */}
        <div className="mb-5 grid gap-4 sm:grid-cols-3">
          <Card>
            <CardBody className="p-4">
              <Stat
                label={copy("generatedThisMonth")}
                value="128"
                delta={12}
                deltaLabel={copy("comparedToLastMonth")}
              />
            </CardBody>
          </Card>
          <Card>
            <CardBody className="p-4">
              <Stat
                label={copy("favoriteWorks")}
                value="36"
                delta={5}
                deltaLabel={copy("comparedToLastMonth")}
              />
            </CardBody>
          </Card>
          <Card>
            <CardBody className="p-4">
              <Stat
                label={copy("remainingCredits")}
                value="68%"
                delta={-8}
                deltaLabel={copy("usedThisMonth")}
              />
            </CardBody>
          </Card>
        </div>

        <div className="grid gap-5 lg:grid-cols-[1.1fr_1fr]">
          {/* 账户信息表单 */}
          <Card>
            <CardBody className="space-y-4 p-5">
              <Heading level={3} size="base">
                {copy("accountInformation")}
              </Heading>
              <Field label={copy("nickname")}>
                <Input value={name} onChange={(e) => setName(e.target.value)} />
              </Field>
              <Field label={copy("roleTitle")}>
                <Input value={role} onChange={(e) => setRole(e.target.value)} />
              </Field>
              <Field label={copy("email")}>
                <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
              </Field>
              <Field label={copy("bio")}>
                <Textarea
                  value={bio}
                  rows={3}
                  autoResize
                  onChange={(e) => setBio(e.target.value)}
                />
              </Field>
              <div className="flex items-center gap-3">
                <Button onClick={onSave} disabled={savePending}>
                  {savePending ? <Spinner size="sm" /> : null}
                  {savePending ? copy("saving") : copy("saveChanges")}
                </Button>
              </div>
            </CardBody>
          </Card>

          {/* 最近创作 */}
          <Card>
            <CardBody className="space-y-3 p-5">
              <Heading level={3} size="base">
                {copy("recentCreations")}
              </Heading>
              <div className="grid grid-cols-3 gap-2.5">
                {recent.map((a) => (
                  <div
                    key={a.id}
                    className="aspect-square overflow-hidden rounded-[var(--radius)] border border-border"
                    style={{ background: meshGradient(a.seed ?? 1) }}
                    title={a.title}
                  />
                ))}
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}
