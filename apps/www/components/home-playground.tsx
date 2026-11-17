"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { ArrowRight, ShoppingCart } from "lucide-react";
import { Alert, Button, Input, Progress, Segmented, Switch, Tag, Text } from "@hulianui/ui";
import { DOCS_LOCALE } from "../lib/docs-locale";

// 首页「组件试玩格」：六格，每格顶上一排变体开关，中间是那件组件本身。
// 证明的是「好用」：不用进文档，在首页就能把常用变体点一遍。

const en = DOCS_LOCALE === "en";

const copy = en
  ? {
      eyebrow: "Ready to use",
      title: ["Carefully designed defaults, ", "free to change"],
      lead: "Change a prop to get a different behavior.",
      addToCart: "Add to cart",
      tagLabels: ["Soft", "Solid", "Outline"],
      tones: { brand: "Brand", success: "Success", warning: "Warning", danger: "Danger" },
      inputStates: { default: "Default", disabled: "Disabled", invalid: "Invalid" },
      inputLabel: "Username",
      inputError: "Already taken, try another.",
      switchLabel: "Auto-save drafts",
      alerts: {
        info: "A new version is available.",
        success: "Payment received.",
        warning: "Your trial ends in 3 days.",
        danger: "Deploy failed on step 2.",
      },
      progress: "Upload",
      more: "See all components",
      names: ["Button", "Tag", "Input", "Switch", "Progress", "Alert"],
    }
  : {
      eyebrow: "开箱即用",
      title: ["提供了精心设计的默认配置，", "也可自由修改"],
      lead: "变更 prop，获得组件的不同功能。",
      addToCart: "加入购物车",
      tagLabels: ["浅底", "实底", "描边"],
      tones: { brand: "品牌", success: "成功", warning: "警告", danger: "危险" },
      inputStates: { default: "默认", disabled: "禁用", invalid: "出错" },
      inputLabel: "用户名",
      inputError: "已被占用，换一个试试。",
      switchLabel: "自动保存草稿",
      alerts: {
        info: "有新版本可以更新。",
        success: "已收到付款。",
        warning: "试用期还剩 3 天。",
        danger: "部署在第 2 步失败。",
      },
      progress: "上传",
      more: "查看全部组件",
      names: ["按钮", "标签", "输入框", "开关", "进度", "提示"],
    };

type Tone = "brand" | "success" | "warning" | "danger";
const TONES: Tone[] = ["brand", "success", "warning", "danger"];

function Cell({
  name,
  options,
  value,
  onChange,
  children,
}: {
  name: string;
  options: { value: string; label: string }[];
  value: string;
  onChange: (v: string) => void;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col bg-surface">
      <div className="flex items-center justify-between gap-3 px-4 pt-4">
        <Text as="span" size="sm" weight="semibold">
          {name}
        </Text>
        <Segmented
          tone="brand"
          size="sm"
          items={options}
          value={value}
          onValueChange={onChange}
          aria-label={name}
        />
      </div>
      <div className="grid min-h-44 flex-1 place-items-center px-6 py-8">{children}</div>
    </div>
  );
}

export function HomePlayground() {
  const [btn, setBtn] = useState("solid");
  const [tone, setTone] = useState<string>("brand");
  const [inputState, setInputState] = useState("default");
  const [switchSize, setSwitchSize] = useState("md");
  const [progressVariant, setProgressVariant] = useState("linear");
  const [alertTone, setAlertTone] = useState("success");

  const toneOptions = TONES.map((t) => ({ value: t, label: copy.tones[t] }));

  return (
    <section className="mx-auto max-w-6xl px-6 py-24 sm:py-28">
      <div className="mx-auto max-w-2xl text-center">
        <Text size="sm" weight="semibold" className="text-primary">
          {copy.eyebrow}
        </Text>
        <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
          {copy.title[0]}
          <span className="text-primary">{copy.title[1]}</span>
        </h2>
        <Text tone="muted" className="mt-4 leading-relaxed">
          {copy.lead}
        </Text>
      </div>

      {/* gap-px + 底色 = 格子之间一像素的分隔线，外圈一条圆角边框 */}
      <div className="mt-12 grid gap-px overflow-hidden rounded-2xl border border-border/80 bg-border/70 shadow-sm sm:grid-cols-2 lg:grid-cols-3">
        <Cell
          name={copy.names[0]}
          options={["solid", "outline", "soft", "ghost"].map((v) => ({ value: v, label: v }))}
          value={btn}
          onChange={setBtn}
        >
          <Button variant={btn as "solid" | "outline" | "soft" | "ghost"}>
            <ShoppingCart className="size-4" aria-hidden />
            {copy.addToCart}
          </Button>
        </Cell>

        <Cell name={copy.names[1]} options={toneOptions} value={tone} onChange={setTone}>
          <div className="flex flex-wrap justify-center gap-2">
            {(["soft", "solid", "outline"] as const).map((v, i) => (
              <Tag key={v} variant={v} tone={tone as Tone} dot={i === 0}>
                {copy.tagLabels[i]}
              </Tag>
            ))}
          </div>
        </Cell>

        <Cell
          name={copy.names[2]}
          options={(["default", "disabled", "invalid"] as const).map((v) => ({
            value: v,
            label: copy.inputStates[v],
          }))}
          value={inputState}
          onChange={setInputState}
        >
          <label className="block w-full max-w-60 space-y-1.5">
            <Text as="span" size="sm" weight="medium">
              {copy.inputLabel}
            </Text>
            <Input
              defaultValue="hulian"
              disabled={inputState === "disabled"}
              invalid={inputState === "invalid"}
              aria-describedby={inputState === "invalid" ? "hl-pg-input-err" : undefined}
            />
            {inputState === "invalid" && (
              <Text id="hl-pg-input-err" as="span" size="xs" className="block text-danger">
                {copy.inputError}
              </Text>
            )}
          </label>
        </Cell>

        <Cell
          name={copy.names[3]}
          options={["sm", "md", "lg"].map((v) => ({ value: v, label: v }))}
          value={switchSize}
          onChange={setSwitchSize}
        >
          <Switch size={switchSize as "sm" | "md" | "lg"} defaultChecked label={copy.switchLabel} />
        </Cell>

        <Cell
          name={copy.names[4]}
          options={["linear", "circular"].map((v) => ({ value: v, label: v }))}
          value={progressVariant}
          onChange={setProgressVariant}
        >
          {progressVariant === "linear" ? (
            <Progress value={72} showValue aria-label={copy.progress} className="w-full max-w-60" />
          ) : (
            <Progress
              variant="circular"
              value={72}
              size={72}
              thickness={6}
              showValue
              aria-label={copy.progress}
            />
          )}
        </Cell>

        <Cell
          name={copy.names[5]}
          options={(["info", "success", "warning", "danger"] as const).map((v) => ({
            value: v,
            label: v === "info" ? (en ? "Info" : "信息") : copy.tones[v as Tone],
          }))}
          value={alertTone}
          onChange={setAlertTone}
        >
          <Alert
            tone={alertTone as "info" | "success" | "warning" | "danger"}
            title={copy.alerts[alertTone as keyof typeof copy.alerts]}
            className="w-full"
          />
        </Cell>
      </div>

      <div className="mt-8 text-center">
        <Link
          href="/components"
          className="group inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary-hover"
        >
          {copy.more}
          <ArrowRight
            className="size-3.5 transition-transform group-hover:translate-x-0.5"
            aria-hidden
          />
        </Link>
      </div>
    </section>
  );
}
