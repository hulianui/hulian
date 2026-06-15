"use client";
import { Sun, SunDim } from "lucide-react";
import type { ShowcaseSpec } from "../showcase/types";
import { ElasticSlider } from "./elastic-slider";

/** 居中展示容器，给橡皮筋拉伸效果留出溢出空间 */
function Stage({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-40 w-full max-w-md items-center justify-center rounded-xl border border-border bg-surface p-8">
      {children}
    </div>
  );
}

export const elasticSliderShowcase: ShowcaseSpec = {
  examples: [
    {
      title: "基础用法",
      description: "默认音量滑块，拖到两端轨道像橡皮筋一样被拉伸回弹。",
      code: `<ElasticSlider defaultValue={40} />`,
      render: () => (
        <Stage>
          <ElasticSlider defaultValue={40} />
        </Stage>
      ),
    },
    {
      title: "自定义图标",
      description: "用 leftIcon / rightIcon 替换两端图标，例如亮度调节。",
      code: `<ElasticSlider
  defaultValue={65}
  leftIcon={<SunDim className="size-5" aria-hidden />}
  rightIcon={<Sun className="size-5" aria-hidden />}
/>`,
      render: () => (
        <Stage>
          <ElasticSlider
            defaultValue={65}
            leftIcon={<SunDim className="size-5" aria-hidden />}
            rightIcon={<Sun className="size-5" aria-hidden />}
          />
        </Stage>
      ),
    },
    {
      title: "步长吸附",
      description: "isStepped 开启后拖动按 stepSize 取整吸附。",
      code: `<ElasticSlider defaultValue={30} isStepped stepSize={10} />`,
      render: () => (
        <Stage>
          <ElasticSlider defaultValue={30} isStepped stepSize={10} />
        </Stage>
      ),
    },
    {
      title: "自定义量程",
      description: "startingValue / maxValue 设定上下界，showValue 可隐藏数值。",
      code: `<ElasticSlider
  defaultValue={0}
  startingValue={-50}
  maxValue={50}
  showValue={false}
/>`,
      render: () => (
        <Stage>
          <ElasticSlider
            defaultValue={0}
            startingValue={-50}
            maxValue={50}
            showValue={false}
          />
        </Stage>
      ),
    },
  ],

  controls: [
    { prop: "defaultValue", type: "number", defaultValue: 50, label: "初始值" },
    { prop: "startingValue", type: "number", defaultValue: 0, label: "下界" },
    { prop: "maxValue", type: "number", defaultValue: 100, label: "上界" },
    { prop: "isStepped", type: "boolean", defaultValue: false, label: "步长吸附" },
    { prop: "stepSize", type: "number", defaultValue: 10, label: "步长" },
    { prop: "showValue", type: "boolean", defaultValue: true, label: "显示数值" },
  ],

  states: [
    {
      name: "default（音量·拖到两端橡皮筋拉伸）",
      render: () => (
        <Stage>
          <ElasticSlider defaultValue={40} />
        </Stage>
      ),
    },
    {
      name: "自定义图标（亮度调节）",
      render: () => (
        <Stage>
          <ElasticSlider
            defaultValue={65}
            leftIcon={<SunDim className="size-5" aria-hidden />}
            rightIcon={<Sun className="size-5" aria-hidden />}
          />
        </Stage>
      ),
    },
    {
      name: "步长吸附（step 10）",
      render: () => (
        <Stage>
          <ElasticSlider defaultValue={30} isStepped stepSize={10} />
        </Stage>
      ),
    },
    {
      name: "自定义量程（-50 ~ 50 · 隐藏数值）",
      render: () => (
        <Stage>
          <ElasticSlider
            defaultValue={0}
            startingValue={-50}
            maxValue={50}
            showValue={false}
          />
        </Stage>
      ),
    },
  ],

  renderWithProps: (p) => (
    <Stage>
      <ElasticSlider
        defaultValue={p.defaultValue as number}
        startingValue={p.startingValue as number}
        maxValue={p.maxValue as number}
        isStepped={p.isStepped as boolean}
        stepSize={p.stepSize as number}
        showValue={p.showValue as boolean}
      />
    </Stage>
  ),

  toCode: (p) =>
    [
      `<ElasticSlider`,
      `  defaultValue={${p.defaultValue}}`,
      `  startingValue={${p.startingValue}}`,
      `  maxValue={${p.maxValue}}`,
      `  isStepped={${p.isStepped}}`,
      `  stepSize={${p.stepSize}}`,
      `  showValue={${p.showValue}}`,
      `/>`,
    ].join("\n"),
};
