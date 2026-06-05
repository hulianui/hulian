"use client";
import { useState } from "react";
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Field,
  Heading,
  Input,
  Segmented,
  Slider,
  Switch,
  Text,
  Textarea,
  toast,
} from "@hulianui/ui";

export default function SettingsPage() {
  const [nickname, setNickname] = useState("小琏");
  const [signature, setSignature] = useState("很高兴为您服务，有问题随时找我～");
  const [autoAccept, setAutoAccept] = useState(true);
  const [maxConcurrent, setMaxConcurrent] = useState(5);
  const [autoTransfer, setAutoTransfer] = useState(true);
  const [autoReply, setAutoReply] = useState(true);
  const [welcome, setWelcome] = useState("您好，我是您的专属客服小琏，请问有什么可以帮您？");
  const [worktime, setWorktime] = useState("work");

  const save = () => {
    toast({ title: "设置已保存", description: "客服偏好已更新（demo 内存态，刷新还原）", tone: "info" });
  };

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-4">
      <div className="flex items-end justify-between gap-3">
        <div>
          <Heading level={1} size="xl">
            客服设置
          </Heading>
          <Text tone="muted" className="mt-1">
            配置坐席接待偏好与自动化规则。
          </Text>
        </div>
        <Button onClick={save}>保存设置</Button>
      </div>

      {/* 坐席资料 */}
      <Card>
        <CardHeader>坐席资料</CardHeader>
        <CardBody className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="坐席昵称">
            <Input value={nickname} onChange={(e) => setNickname(e.target.value)} placeholder="对客展示的名称" />
          </Field>
          <Field label="个性签名" description="对话窗口副标题展示" className="sm:col-span-1">
            <Input value={signature} onChange={(e) => setSignature(e.target.value)} placeholder="一句话签名" />
          </Field>
        </CardBody>
      </Card>

      {/* 接待设置 */}
      <Card>
        <CardHeader>接待设置</CardHeader>
        <CardBody className="flex flex-col gap-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="text-sm font-medium">自动接入新会话</div>
              <Text size="sm" tone="muted">
                在线时新会话自动分配给我
              </Text>
            </div>
            <Switch checked={autoAccept} onCheckedChange={setAutoAccept} aria-label="自动接入新会话" />
          </div>

          <Field label={`同时接待上限：${maxConcurrent} 个会话`} description="超过上限的会话进入排队">
            <Slider
              value={maxConcurrent}
              onValueChange={(v) => setMaxConcurrent(Array.isArray(v) ? v[0] : (v as number))}
              min={1}
              max={10}
              step={1}
              showValue
            />
          </Field>

          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="text-sm font-medium">离开后自动转接</div>
              <Text size="sm" tone="muted">
                状态切到「小休」时把进行中会话转交他人
              </Text>
            </div>
            <Switch checked={autoTransfer} onCheckedChange={setAutoTransfer} aria-label="离开后自动转接" />
          </div>
        </CardBody>
      </Card>

      {/* 自动回复 */}
      <Card>
        <CardHeader>自动回复</CardHeader>
        <CardBody className="flex flex-col gap-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="text-sm font-medium">启用欢迎语</div>
              <Text size="sm" tone="muted">
                客户接入时自动发送一条欢迎语
              </Text>
            </div>
            <Switch checked={autoReply} onCheckedChange={setAutoReply} aria-label="启用欢迎语" />
          </div>
          <Field label="欢迎语内容">
            <Textarea
              value={welcome}
              onChange={(e) => setWelcome(e.target.value)}
              rows={3}
              disabled={!autoReply}
              placeholder="客户接入时自动发送…"
            />
          </Field>
        </CardBody>
      </Card>

      {/* 工作时段 */}
      <Card>
        <CardHeader>工作时段</CardHeader>
        <CardBody>
          <Field label="接待时段" description="非工作时段由智能助手值守">
            <Segmented
              value={worktime}
              onValueChange={setWorktime}
              items={[
                { value: "all", label: "全天 7×24" },
                { value: "work", label: "工作时间 9:00-21:00" },
                { value: "custom", label: "自定义" },
              ]}
            />
          </Field>
        </CardBody>
      </Card>
    </div>
  );
}
