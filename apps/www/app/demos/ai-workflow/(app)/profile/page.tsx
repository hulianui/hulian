"use client";
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
  const [name, setName] = useState("苏砚");
  const [role, setRole] = useState("创意设计师");
  const [email, setEmail] = useState("suyan@hulian.design");
  const [bio, setBio] = useState("用 AI 把脑子里的画面拽出来。专注品牌视觉与概念海报。");

  const [savePending, runSave] = usePending();

  const onSave = () => {
    void runSave(() => {
      toast({ title: "资料已保存", tone: "success" });
    });
  };

  const recent = ARTIFACTS.filter((a) => a.type === "image").slice(0, 6);

  return (
    <div className="h-full overflow-y-auto">
      <div className="mx-auto max-w-5xl px-6 py-8">
        <header className="mb-6">
          <Heading level={1} size="2xl">
            个人资料
          </Heading>
          <Text tone="muted" className="mt-1.5">
            管理你的账户信息、用量与创作偏好。
          </Text>
        </header>

        {/* 资料头卡 */}
        <Card variant="elevated" className="mb-5">
          <CardBody className="flex flex-col items-center gap-4 p-5 sm:flex-row">
            {/* 删除远程图片 src，仅用 fallback 首字 */}
            <Avatar fallback="苏" className="size-16 shrink-0" />
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
              专业版
            </Tag>
          </CardBody>
        </Card>

        {/* 用量统计 */}
        <div className="mb-5 grid gap-4 sm:grid-cols-3">
          <Card>
            <CardBody className="p-4">
              <Stat label="本月生成" value="128" delta={12} deltaLabel="较上月" />
            </CardBody>
          </Card>
          <Card>
            <CardBody className="p-4">
              <Stat label="收藏作品" value="36" delta={5} deltaLabel="较上月" />
            </CardBody>
          </Card>
          <Card>
            <CardBody className="p-4">
              <Stat label="剩余额度" value="68%" delta={-8} deltaLabel="本月已用 32%" />
            </CardBody>
          </Card>
        </div>

        <div className="grid gap-5 lg:grid-cols-[1.1fr_1fr]">
          {/* 账户信息表单 */}
          <Card>
            <CardBody className="space-y-4 p-5">
              <Heading level={3} size="base">
                账户信息
              </Heading>
              <Field label="昵称">
                <Input value={name} onChange={(e) => setName(e.target.value)} />
              </Field>
              <Field label="角色 / 头衔">
                <Input value={role} onChange={(e) => setRole(e.target.value)} />
              </Field>
              <Field label="邮箱">
                <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
              </Field>
              <Field label="个人简介">
                <Textarea value={bio} rows={3} autoResize onChange={(e) => setBio(e.target.value)} />
              </Field>
              <div className="flex items-center gap-3">
                <Button onClick={onSave} disabled={savePending}>
                  {savePending ? <Spinner size="sm" /> : null}
                  {savePending ? "保存中…" : "保存修改"}
                </Button>
              </div>
            </CardBody>
          </Card>

          {/* 最近创作 */}
          <Card>
            <CardBody className="space-y-3 p-5">
              <Heading level={3} size="base">
                最近创作
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
