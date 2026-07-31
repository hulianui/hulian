---
"@hulianui/ui": minor
---

`react-easy-crop` 升到 6.2.3（ImageCropper 的裁剪引擎）

走 minor 而不是 patch：它挂在 `dependencies` 而不是 `peerDependencies`，升 major 会改变下游
装到的传递依赖大版本，不该藏在 patch 里发。

**API / 坐标语义零变更**。ImageCropper 的源码一行没动，`onCropComplete(area, croppedAreaPixels)`
的含义、`restrictPosition` 的夹紧规则、出图坐标全部照旧。v6.0.0 的 breaking 是构建产物层面的：
去掉 UMD build、去掉 `tslib` 运行时依赖（少一个传递依赖）、`exports` map 拆出
`index.d.mts` / `index.d.ts` 双份类型。

**两处实际差异**：

1. **v6.0.1 给媒体元素加了 `max-width: unset`** —— 防全局 `img { max-width: 100% }` 类 reset
   （Tailwind Preflight 正是这种）挤压裁剪媒体。我们默认 `objectFit: "contain"`，
   `.reactEasyCrop_Contain` 的 `max-width: 100%` 优先级更后，所以默认路径行为不变；
   受益的是传 `objectFit: "cover"` 系列的消费方。
2. **v6.1.0 给 resize 后的回调加了 250ms 防抖**。视觉布局仍是即时重算（实测容器 320→200px
   后裁剪框立刻跟到 143×200，比例仍是 5:7），防抖只推迟 `onCropComplete` 的发射。
   理论上留下一个「resize 后 250ms 内点确认会用到旧几何」的窗口，实操中人手够不到；
   实测 resize 前后各点一次确认，源区域稳定在 571×800（≈5:7），说明防抖后回调正常收敛、
   不会永久停在旧几何。

**验收**：3302 用例全绿、消费方 typecheck 门禁绿、12 个体积入口全在基线内（root-barrel
反而因少了 tslib 略降）、www 构建通过。真浏览器实拖实裁自证：滚轮缩放到 3×、拖拽对位、
确认出图 413×578 JPEG，产物像素与裁剪框内所见一致。
