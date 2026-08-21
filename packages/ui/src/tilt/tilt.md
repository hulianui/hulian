---
slug: tilt
name: Tilt
category: decoration
group: overlay-fx
tags: ["animated"]
exports: [Tilt, tiltAngles, glareState, normalizePointer]
status: enriched
---

# Tilt

> 视差倾斜包裹器 · 裹住任意 children 做 3D 倾斜(区别 TiltedCard 的固定卡片结构) · 指针/陀螺仪/手动角度三种驱动 + 全窗跟踪 + 单轴限制 + 反向 + 静息角 + 悬停放大 · glare 跟随指针的反光高光(角度与强度按几何算) · onTiltMove 每帧回传角度与反光可驱动多层视差 · 角度/反光是纯函数可测 · 吃瑚琏动效曲线·默认尊重 reduced-motion(零依赖) · decoration/overlay-fx

## 何时用

想让**任意**一块内容随指针轻微立体化：价目表卡、图表卡、登录框、主视觉图、一段 3D 文案。

和 [TiltedCard](../tilted-card/tilted-card.md) 的分工：TiltedCard 是**卡片**（图片 + 跟随气泡 + overlay，结构固定，开箱即用）；本组件是**原语**，只负责「倾斜 + 反光」，裹什么都行。要现成的图片卡用前者，要给自己的布局加倾斜用后者。

对标 `react-parallax-tilt` 的能力面（glare / 陀螺仪 / 全窗跟踪 / 手动角度 / 单轴 / 静息角 / 事件回调），但零依赖、过渡曲线走瑚琏动效 SSOT、默认尊重 `prefers-reduced-motion`。

## 导入
```ts
import { Tilt } from "@hulianui/ui"
```

## Props

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| tiltEnable | `boolean` | `true` | 总开关 |
| maxAngleX / maxAngleY | `number` | `12` | 两轴最大角（度） |
| reverse | `boolean` | `false` | 反向倾斜 |
| axis | `"x" \| "y"` | - | 只绕单轴 |
| initialAngleX / initialAngleY | `number` | `0` | 静息角（不交互时的初始倾斜） |
| manualAngleX / manualAngleY | `number \| null` | - | 手动角度，给了就接管该轴（滑杆/摇杆/滚动进度驱动） |
| scale | `number` | `1` | 悬停放大倍数 |
| perspective | `number` | `1000` | 透视距离 px，越小越夸张 |
| transitionSpeed | `number` | `300` | 过渡时长 ms |
| transitionEasing | `string` | 瑚琏 `ease-out` | 过渡曲线 |
| reset | `boolean` | `true` | 离开时归位 |
| trackOnWindow | `boolean` | `false` | 在整个窗口内跟踪指针（大面积主视觉） |
| gyroscope | `boolean` | `false` | 监听设备陀螺仪 |
| glare | `boolean` | `false` | 反光高光层 |
| glareMaxOpacity | `number` | `0.35` | 反光最大不透明度 |
| glareColor | `string` | `"#ffffff"` | 反光颜色 |
| glareReverse | `boolean` | `false` | 反光方向取反 |
| glareBorderRadius | `string` | - | 反光层圆角 |
| onTiltMove / onTiltEnter / onTiltLeave | `fn` | - | 每帧角度与反光 / 进入 / 离开 |

### 纯函数（已导出）

`tiltAngles(px, py, opts)` 归一化指针 → 旋转角 · `glareState(px, py, opts)` → 反光角与强度 · `normalizePointer(clientX, clientY, rect)` → 0..1。想自己驱动别的图层做多层视差时直接复用。

## 示例
```tsx
// 给任意卡片加倾斜 + 反光
<Tilt glare glareBorderRadius="calc(var(--radius) + 0.25rem)" maxAngleX={16} maxAngleY={16}>
  <PricingCard {...plan} />
</Tilt>

// 滑杆/滚动进度驱动
<Tilt manualAngleX={angle} manualAngleY={0} />

// 拿实时角度驱动第二层，做多层视差
<Tilt onTiltMove={({ angles }) => setDepth(angles)}>…</Tilt>
```

## 禁忌 / 坑

- **`glareBorderRadius` 要与被裹元素的圆角一致**，否则高光是个直角矩形、从圆角处溢出来。
- **陀螺仪在 iOS 上需要站点自行取得 `DeviceOrientationEvent` 权限**（用户手势里调 `requestPermission()`）。未授权时事件根本不触发，组件静默保持静息态——不会报错，但也不会动，别误判成组件坏了。
- `trackOnWindow` 让卡片在指针**没悬停**时也持续动：一屏多个会互相抢注意力，通常只给主视觉一个。
- **reduced-motion 下完全不倾斜**（这类效果对前庭敏感人群最不友好），children 照常渲染。要做「必须动」的演示别指望它。
- 倾斜靠 CSS 3D，内部有 `transform-style: preserve-3d`：被裹元素若自己也开了 `overflow: hidden` + 大圆角，某些浏览器上圆角边缘会有锯齿——把圆角放到被裹元素上、`Tilt` 只做变换即可。

## 相关
[TiltedCard](../tilted-card/tilted-card.md) · [MagicCard](../magic-card/magic-card.md) · [GlareHover](../glare-hover/glare-hover.md) · [CardSpotlight](../card-spotlight/card-spotlight.md) · [ProfileCard](../profile-card/profile-card.md) · [Reveal](../reveal/reveal.md)
