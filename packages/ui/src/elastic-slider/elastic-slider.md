---
slug: elastic-slider
name: ElasticSlider
category: forms
group: basic
tags: [animated]
exports: [ElasticSlider]
status: enriched
---

# ElasticSlider

> 橡皮筋音量滑块 · 拖到两端轨道横拉纵压 + 图标回弹位移 + hover 整体放大、松手 spring 弹回(motion·零新依赖·reduced-motion) · forms/basic · #animated

## 何时用

需要一个带玩味动效的单值滑块时用（音量、亮度等连续量调节）。要表单标准化校验、键盘 a11y、与 Input/Select 同列对齐的常规录入，用普通滑块/[Input](../input/input.md)；本组件是非受控数值反馈型装饰滑块，强调拖拽手感而非表单语义。

## 导入
```ts
import { ElasticSlider } from "@hulianui/ui"
```

## Props

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| defaultValue | `number` | `50` | 初始值（非受控）。组件内部维护数值，仅在挂载与该 prop 变化时同步进内部 state |
| startingValue | `number` | `0` | 量程下界（轨道最左对应数值） |
| maxValue | `number` | `100` | 量程上界（轨道最右对应数值） |
| isStepped | `boolean` | `false` | 是否吸附到步长（拖动时按 stepSize 取整） |
| stepSize | `number` | `1` | 吸附步长，仅 isStepped 为 true 时生效 |
| showValue | `boolean` | `true` | 是否显示当前值数字指示（轨道上方居中） |
| className | `string` | — | 透传到根容器的额外 className（merge via cn） |
| style | `CSSProperties` | — | 透传到根容器的内联样式 |

## Events

| 事件 | 类型 | 说明 |
|------|------|------|
| onValueChange | `(value: number) => void` | 拖动产生新值时回调，供消费方接管/上报数值 |

## Slots

| 插槽 | 类型 | 说明 |
|------|------|------|
| leftIcon | `ReactNode` | 左侧图标（轨道左端），拖动越界到最左时随回弹做位移+放大 |
| rightIcon | `ReactNode` | 右侧图标（轨道右端），拖动越界到最右时随回弹做位移+放大 |

## 示例
```tsx
// 默认音量滑块
<ElasticSlider defaultValue={40} />
```
```tsx
// 自定义图标 + 量程 + 步长吸附
<ElasticSlider
  defaultValue={65}
  startingValue={-50}
  maxValue={50}
  isStepped
  stepSize={10}
  leftIcon={<SunDim className="size-5" aria-hidden />}
  rightIcon={<Sun className="size-5" aria-hidden />}
/>
```

## 禁忌 / 坑

- **非受控**：`defaultValue` 只在挂载与 prop 变化时同步进内部 state，不能当受控值每帧回灌。要持续读数走 `onValueChange` 自存。
- 拖到两端会有橡皮筋横拉纵压溢出，外层容器需留出 overflow 空间（别用 `overflow-hidden` 紧贴裁掉）。
- 暂无其他已知坑。

## 相关
[Input](../input/input.md) · [Textarea](../textarea/textarea.md) · [Select](../select/select.md) · [Checkbox](../checkbox/checkbox.md) · [CheckboxGroup](../checkbox-group/checkbox-group.md) · [Radio](../radio/radio.md)
